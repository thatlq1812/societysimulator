/**
 * Generate the 6 new images using @google/genai SDK.
 * Run: node scripts/gen-new-images.mjs
 */
import { GoogleGenAI } from '@google/genai'
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

// Read .env manually (no dotenv dependency)
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

const STYLE_RULES = `
STYLE RULES — Digital Society Simulator (Vietnamese socialist-themed edu-game):
- Dark background: pure near-black (#0d0d0d to #141414)
- Primary accent: revolutionary red (#dc2626, hsl 0 85% 50%)
- Secondary accent: golden yellow (#eab308, hsl 45 100% 55%)
- Role colors: Worker=blue(#60a5fa), Farmer=emerald(#34d399), Intellectual=violet(#a78bfa), Startup=amber(#fbbf24)
- Art style: Flat vector / geometric minimalism, clean edges, no gradients
- Mood: Futuristic, serious, slightly cyberpunk — like a 2030 policy infographic
- NO text/words/letters in the image
- NO photorealistic rendering — keep it illustrative
- Aspect ratio: square (1:1) unless specified
- Color palette is limited: dark bg + 1-2 accent colors per image
`.trim()

const NEW_IMAGES = {
  'transition-analyzing.png':
    'Abstract composition: data streams from multiple colored sources (blue, green, violet, amber, pink, cyan) converging into a central glowing brain-shaped processing node. Six orbiting indicator spheres in distinctive colors. Dark background. Symbolizes AI analysis.',

  'transition-waiting.png':
    'Abstract composition: interconnected human silhouettes standing on a large circular platform, looking toward a glowing horizon with anticipation. Calming blue and cyan tones with subtle red accents. Dark background. Symbolizes collective waiting.',

  'indicator-innovation.png':
    'Abstract composition: a lightbulb made of intricate circuit board patterns radiating violet light (#8b5cf6), surrounded by floating geometric shapes and data points. Violet dominant on dark background.',

  'indicator-welfare.png':
    'Abstract composition: interlinked human hands forming a safety net beneath a community of diverse silhouette figures. Warm pink (#f472b6) dominant tones on dark background. Symbolizes social welfare.',

  'indicator-democracy.png':
    'Abstract composition: transparent ballot boxes and raised hands with holographic digital voting interfaces. Multiple screens showing approval icons. Cyan (#06b6d4) dominant on dark background.',

  'lobby-gathering.png':
    'Wide abstract illustration: figures approaching from four different directions toward a central glowing hub platform. Each group has a different color aura — blue workers, green farmers, violet intellectuals, amber startup founders. Red and gold accent connection lines. Dark background.',
}

async function generateImage(prompt, filename) {
  const fullPrompt = `${STYLE_RULES}\n\nGENERATE THIS IMAGE:\n${prompt}`

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [fullPrompt],
    config: { responseModalities: ['IMAGE'] },
  })

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('Empty response')
  }

  const parts = response.candidates[0].content?.parts ?? []

  for (const part of parts) {
    if (part.inlineData) {
      const raw = part.inlineData.data
      if (!raw) throw new Error('inlineData.data is empty')

      let imageData = Buffer.from(raw, 'base64')

      const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])
      const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff])
      const isRaw = imageData.subarray(0, 4).equals(PNG_MAGIC) || imageData.subarray(0, 3).equals(JPEG_MAGIC)

      if (!isRaw) {
        try {
          const decoded = Buffer.from(imageData.toString('ascii'), 'base64')
          if (decoded.subarray(0, 4).equals(PNG_MAGIC) || decoded.subarray(0, 3).equals(JPEG_MAGIC)) {
            imageData = decoded
          }
        } catch {}
      }

      const outPath = join(outDir, filename)
      writeFileSync(outPath, imageData)
      return imageData.length
    }
  }

  const textParts = parts.filter(p => p.text).map(p => p.text).join(' ')
  throw new Error(`No image data.${textParts ? ` Model said: ${textParts.slice(0, 200)}` : ''}`)
}

console.log(`Generating ${Object.keys(NEW_IMAGES).length} new images...\n`)

for (const [filename, prompt] of Object.entries(NEW_IMAGES)) {
  const outPath = join(outDir, filename)
  if (existsSync(outPath)) {
    console.log(`  SKIP ${filename} (already exists)`)
    continue
  }

  process.stdout.write(`  GEN  ${filename} ...`)
  try {
    const size = await generateImage(prompt, filename)
    console.log(` OK (${(size / 1024).toFixed(0)} KB)`)
  } catch (err) {
    console.log(` FAIL: ${err.message}`)
  }

  // Rate limit delay
  await new Promise(r => setTimeout(r, 3000))
}

console.log('\nDone! Check public/images/ for new files.')
