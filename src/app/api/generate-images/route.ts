import { NextResponse } from 'next/server'
import { generateAndSaveImage, IMAGE_PROMPTS } from '@/lib/ai-image'
import { existsSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

/**
 * Admin endpoint: generate images and save to public/images/
 *
 * POST /api/generate-images?key=<GEMINI_API_KEY>
 * Optional query param: ?only=role-worker.png,hero-network.png (generate specific files)
 * Optional query param: ?skip_existing=true (skip files that already exist)
 *
 * This is a one-time operation — run once, then commit the images.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const url = new URL(req.url)
  const key = url.searchParams.get('key')
  const only = url.searchParams.get('only')?.split(',').filter(Boolean)
  const skipExisting = url.searchParams.get('skip_existing') === 'true'

  // Simple auth: require the API key as query param
  if (!key || key !== process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const entries = Object.entries(IMAGE_PROMPTS).filter(
    ([filename]) => !only || only.includes(filename),
  )

  const results: Array<{ filename: string; status: string; sizeBytes?: number }> = []

  for (const [filename, prompt] of entries) {
    // Skip if file already exists and skip_existing is true
    if (skipExisting) {
      const outPath = join(process.cwd(), 'public', 'images', filename)
      if (existsSync(outPath)) {
        results.push({ filename, status: 'skipped (exists)' })
        continue
      }
    }

    try {
      const result = await generateAndSaveImage(prompt, filename)
      results.push({ filename, status: 'ok', sizeBytes: result.sizeBytes })
    } catch (err) {
      results.push({ filename, status: `error: ${err instanceof Error ? err.message : String(err)}` })
    }

    // Small delay between requests to avoid rate limiting
    await new Promise((r) => setTimeout(r, 2000))
  }

  const successCount = results.filter((r) => r.status === 'ok').length
  const errorCount = results.filter((r) => r.status.startsWith('error')).length
  const skippedCount = results.filter((r) => r.status.startsWith('skipped')).length

  return NextResponse.json({
    summary: { total: results.length, success: successCount, errors: errorCount, skipped: skippedCount },
    results,
  })
}
