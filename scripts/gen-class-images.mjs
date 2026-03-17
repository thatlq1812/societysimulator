/**
 * Generate 4 synchronized social class images for MLN131 Chapter 5 presentation.
 * Subjects: Công nhân, Nông dân, Trí thức, Các tầng lớp khác
 * Uses the first generated image as a style reference for subsequent images.
 *
 * Run: node scripts/gen-class-images.mjs
 */
import { GoogleGenAI } from '@google/genai'
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

// Load .env
const envPath = join(projectRoot, '.env')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  }
}

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('GEMINI_API_KEY not set in .env')
  process.exit(1)
}

const client = new GoogleGenAI({ apiKey })
const outDir = join(projectRoot, 'public', 'images')
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

const MODEL = 'gemini-3-pro-image-preview'

/**
 * Shared style block — injected into every prompt for visual coherence.
 * Designed for a Vietnamese Marxist-Leninist university presentation (Chapter 5).
 */
const STYLE = `
UNIFIED VISUAL STYLE (apply to every image in this series):
- Square 1:1 canvas, HD resolution
- Background: deep navy-to-black gradient (#0a0f1e → #000000), subtle hex-grid texture
- Color accents per class: Worker=#3b82f6 (blue), Farmer=#10b981 (emerald), Intellectual=#8b5cf6 (violet), Other=#f59e0b (amber)
- Lighting: single dramatic rim-light matching the class accent color; rest in deep shadow
- Art style: premium flat vector illustration — bold geometric shapes, clean silhouettes, no photorealism
- Composition: centered subject fills ~80% of canvas, symmetrical or rule-of-thirds
- Atmosphere: solemn, powerful, slightly futuristic — like a high-end political poster meets cyberpunk infographic
- Red socialist star motif: subtle, small, top-right corner of every image
- NO text, NO letters, NO numbers anywhere in the image
- NO gradients within shapes — flat fills only
- Vietnamese cultural context: include subtle Vietnamese architectural or cultural details where natural
`.trim()

const IMAGES = [
  {
    filename: 'class-cong-nhan.png',
    accentColor: '#3b82f6',
    prompt: `
${STYLE}

THIS IMAGE — Giai cấp Công nhân (Working Class):
Dominant accent: electric blue (#3b82f6).
Composition: A powerful worker silhouette center-stage — hard hat, sturdy build — fist subtly raised or gripping a wrench/gear. Behind them: massive industrial machinery and factory gears rendered in geometric blue shapes. Foreground: molten-metal sparks (gold dots) rising upward. A faint crowd of worker silhouettes stretches to the horizon, suggesting collective strength. The figure embodies the vanguard of production — disciplined, strong, forward-looking. Rim light: cold blue.
`.trim(),
  },
  {
    filename: 'class-nong-dan.png',
    accentColor: '#10b981',
    prompt: `
${STYLE}

THIS IMAGE — Giai cấp Nông dân (Peasant/Farmer Class):
Dominant accent: emerald green (#10b981).
Composition: A farmer silhouette — conical Vietnamese nón lá hat, holding a rice stalk bundle — stands in a stylized rice paddy landscape made of layered geometric terraces. Behind them: rising sun rendered as concentric emerald and gold arcs. The terraced fields stretch wide in flat geometric layers, glowing emerald. Foreground: rice grain dots floating upward like data particles. The image radiates abundance, rootedness, and natural solidarity. Rim light: warm emerald.
Maintain IDENTICAL overall composition structure, dark background style, hex-grid texture, and red star motif as the Working Class image above.
`.trim(),
  },
  {
    filename: 'class-tri-thuc.png',
    accentColor: '#8b5cf6',
    prompt: `
${STYLE}

THIS IMAGE — Đội ngũ Trí thức (Intelligentsia):
Dominant accent: violet (#8b5cf6).
Composition: An intellectual figure — slim silhouette, glasses suggested by geometric shapes, holding an open book or laptop — stands at center. Behind them: a vast neural-network / circuit-board pattern expanding outward like a glowing brain, rendered in violet geometric nodes and lines. Floating above: abstract data visualizations (bar charts, network graphs) as purely geometric shapes. The scene merges traditional scholarship with digital knowledge. Rim light: deep violet.
Maintain IDENTICAL overall composition structure, dark background style, hex-grid texture, and red star motif as the previous images in this series.
`.trim(),
  },
  {
    filename: 'class-tang-lop-khac.png',
    accentColor: '#f59e0b',
    prompt: `
${STYLE}

THIS IMAGE — Các tầng lớp khác (Other Strata: entrepreneurs, youth, small business):
Dominant accent: amber gold (#f59e0b).
Composition: A dynamic ensemble of three silhouettes at center — an entrepreneur (briefcase), a young student (backpack), a small-business owner (shop stall icon) — united by glowing amber connection lines between them. Behind: a rising city skyline blending traditional Vietnamese phố cổ rooflines with modern skyscraper geometrics. Foreground: upward-pointing arrows and rising graph lines in amber, suggesting economic dynamism. The image radiates energy, diversity, and social mobility. Rim light: warm amber-gold.
Maintain IDENTICAL overall composition structure, dark background style, hex-grid texture, and red star motif as the previous images in this series.
`.trim(),
  },
]

// ── Image generation helpers ──────────────────────────────────────────────────

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff])

function decodeImageData(raw) {
  let buf = Buffer.from(raw, 'base64')
  const isValid = buf.subarray(0, 4).equals(PNG_MAGIC) || buf.subarray(0, 3).equals(JPEG_MAGIC)
  if (!isValid) {
    try {
      const decoded = Buffer.from(buf.toString('ascii'), 'base64')
      if (decoded.subarray(0, 4).equals(PNG_MAGIC) || decoded.subarray(0, 3).equals(JPEG_MAGIC)) {
        return decoded
      }
    } catch {}
  }
  return buf
}

/**
 * Generate one image.
 * @param {string} prompt - Full text prompt
 * @param {Buffer|null} styleImageBuffer - Optional reference image for style consistency
 * @returns {Buffer} Raw image bytes
 */
async function generateImage(prompt, styleImageBuffer = null) {
  const contents = []

  // Inject style reference image if available (for images 2-4)
  if (styleImageBuffer) {
    contents.push({
      role: 'user',
      parts: [
        {
          text: 'Use the following image as a STRICT style reference. Match its: background darkness, hex-grid texture, geometric flat vector art style, composition centering, rim-lighting technique, and overall mood. Do NOT copy its subject — generate a NEW subject as described below.',
        },
        {
          inlineData: {
            mimeType: 'image/png',
            data: styleImageBuffer.toString('base64'),
          },
        },
        { text: prompt },
      ],
    })
  } else {
    contents.push({ role: 'user', parts: [{ text: prompt }] })
  }

  const response = await client.models.generateContent({
    model: MODEL,
    contents,
    config: { responseModalities: ['IMAGE'] },
  })

  if (!response.candidates?.length) throw new Error('Empty response — no candidates')

  const parts = response.candidates[0].content?.parts ?? []
  for (const part of parts) {
    if (part.inlineData?.data) return decodeImageData(part.inlineData.data)
  }

  const textParts = parts.filter(p => p.text).map(p => p.text).join(' ')
  throw new Error(`No image data in response.${textParts ? ` Model said: ${textParts.slice(0, 300)}` : ''}`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════════════╗')
console.log('║  MLN131 Chapter 5 — Social Class Image Generator    ║')
console.log(`║  Model: ${MODEL.padEnd(44)}║`)
console.log('╚══════════════════════════════════════════════════════╝\n')

let styleReferenceBuffer = null // set after first successful generation
let generated = 0, skipped = 0, failed = 0

for (const [i, { filename, prompt }] of IMAGES.entries()) {
  const outPath = join(outDir, filename)

  if (existsSync(outPath)) {
    console.log(`  SKIP  [${i + 1}/4] ${filename} (already exists)`)
    // Load existing file as style reference for subsequent images
    if (!styleReferenceBuffer) styleReferenceBuffer = readFileSync(outPath)
    skipped++
    continue
  }

  const isStyleChained = styleReferenceBuffer !== null
  process.stdout.write(`  GEN   [${i + 1}/4] ${filename}${isStyleChained ? ' (style-chained)' : ' (anchor)'} ...`)

  try {
    const imageData = await generateImage(prompt, styleReferenceBuffer)
    writeFileSync(outPath, imageData)
    const kb = (imageData.length / 1024).toFixed(0)
    console.log(` ✓ OK (${kb} KB)`)

    // First successful image becomes the style anchor for all subsequent images
    if (!styleReferenceBuffer) {
      styleReferenceBuffer = imageData
      console.log(`        → Set as style anchor for remaining ${IMAGES.length - i - 1} images`)
    }
    generated++
  } catch (err) {
    console.log(` ✗ FAIL: ${err.message}`)
    failed++
  }

  // Rate limit buffer between requests
  if (i < IMAGES.length - 1) {
    process.stdout.write('        (waiting 4s for rate limit...)\n')
    await new Promise(r => setTimeout(r, 4000))
  }
}

console.log('\n─────────────────────────────────────────────────────')
console.log(`  Generated: ${generated}  |  Skipped: ${skipped}  |  Failed: ${failed}`)
console.log(`  Output: public/images/class-*.png`)
console.log('─────────────────────────────────────────────────────\n')
