/**
 * Generate new images for scenarios 13-20 + thematic images.
 * Run: node scripts/gen-images-v2.mjs
 */
import { GoogleGenAI } from '@google/genai'
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

// Read .env manually
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
- Primary accent: deep blue (#1e3a8a) representing Vietnamese youth
- Secondary accents: red (#dc2626), golden yellow (#eab308)
- Role colors: Worker=blue(#60a5fa), Farmer=emerald(#34d399), Intellectual=violet(#a78bfa), Startup=amber(#fbbf24)
- Art style: Flat vector / geometric minimalism, clean edges, no gradients
- Mood: Futuristic, serious, slightly cyberpunk — like a digital policy infographic
- NO text/words/letters in the image
- NO photorealistic rendering — keep it illustrative
- Aspect ratio: square (1:1) unless specified
- Color palette is limited: dark bg + 1-2 accent colors per image
`.trim()

const NEW_IMAGES = {
  // ── Scenario 13-20 images ──
  'scenario-algorithm.png':
    'Abstract composition: a maze-like algorithm flowchart where human figures are being sorted — some illuminated, some cast in shadow. Red warning lines separate "favored" from "excluded" paths. Blue and amber tones on dark background. Symbolizes algorithmic bias in job distribution.',

  'scenario-green.png':
    'Abstract composition: a factory transitioning from dark smoky silhouette on one side to clean bright geometric shapes with solar panels and wind turbines on the other. Emerald and amber tones on dark background. Symbolizes green energy transition.',

  'scenario-dao-governance.png':
    'Abstract composition: a circular council table made of interconnected blockchain nodes, with diverse human figures seated around it — some transparent/faded, some bright. Violet and cyan tones on dark background. Symbolizes DAO governance participation gap.',

  'scenario-digital-union.png':
    'Abstract composition: a chain of smartphone-connected worker silhouettes forming a unified line, facing a massive corporate platform wall. Red solidarity accent and blue worker tones on dark background. Symbolizes digital labor union.',

  'scenario-data-leak.png':
    'Abstract composition: a cracked digital vault with streams of personal data (represented as colored dots) escaping into dark space. An eye watches from above. Red warning and cyan data tones on dark background. Symbolizes data breach.',

  'scenario-generation-gap.png':
    'Abstract composition: elderly figures with walking sticks on one side of a digital divide — a glowing smartphone barrier — with young figures on the other side. Warm amber and cool blue contrast on dark background. Symbolizes generational digital gap.',

  'scenario-metaverse.png':
    'Abstract composition: floating virtual land plots with price tags hovering above, while below real-world figures look up from basic infrastructure. Gold/amber virtual tones vs blue reality tones on dark background. Symbolizes metaverse real estate bubble.',

  'scenario-deepfake.png':
    'Abstract composition: a fractured face half-human half-AI-generated, with social media share icons multiplying around it. Distorted network lines radiating outward. Red and violet tones on dark background. Symbolizes AI misinformation.',

  // ── Thematic images for landing page & decorations ──
  'theme-youth-vietnam.png':
    'Abstract composition: young Vietnamese silhouettes in ao dai and modern clothing walking together on a path that transforms from traditional village road to futuristic digital highway. Strong blue (#1e3a8a) dominant with accents of red and gold. Stars and network lines above. Dark background. Symbolizes Vietnamese youth in transition.',

  'theme-alliance.png':
    'Abstract composition: four distinct colored groups — blue, green, violet, amber — converging into one unified circular formation, their colors blending at intersection points. Red golden connection threads. Dark background. Symbolizes class alliance (lien minh giai cap).',

  'theme-chapter5.png':
    'Abstract composition: a layered pyramid/structure with different colored sections (blue workers at base, green farmers, violet intellectuals, amber entrepreneurs) — arrows showing both cooperation and tension between layers. Red and gold accent lines. Dark background. Symbolizes social class structure from Chapter 5.',

  'theme-digital-society.png':
    'Abstract composition: a cityscape merging with a circuit board pattern, with human figures connected by glowing network lines. Binary streams and data flowing between buildings. Blue and cyan tones on dark background. Symbolizes digital society transformation.',

  'theme-collective-choice.png':
    'Abstract composition: many hands pressing different colored buttons (red A, green B, blue C) on a shared control panel, with indicator gauges reacting above. Warm and cool tones balanced on dark background. Symbolizes collective decision-making.',

  'theme-fpt-university.png':
    'Abstract composition: a modern university building silhouette with digital wave emanating from it, student figures walking with laptops and books, connected by network lines. Strong blue (#1e3a8a) dominant with orange accent. Dark background. Symbolizes FPT University digital education.',
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

console.log(`\nGenerating ${Object.keys(NEW_IMAGES).length} new images...\n`)
console.log('Categories:')
console.log(`  - 8 scenario images (scenarios 13-20)`)
console.log(`  - 6 thematic images (Vietnamese youth, alliance, etc.)\n`)

let generated = 0
let skipped = 0
let failed = 0

for (const [filename, prompt] of Object.entries(NEW_IMAGES)) {
  const outPath = join(outDir, filename)
  if (existsSync(outPath)) {
    console.log(`  SKIP  ${filename} (already exists)`)
    skipped++
    continue
  }

  process.stdout.write(`  GEN   ${filename} ...`)
  try {
    const size = await generateImage(prompt, filename)
    console.log(` OK (${(size / 1024).toFixed(0)} KB)`)
    generated++
  } catch (err) {
    console.log(` FAIL: ${err.message}`)
    failed++
  }

  // Rate limit delay (3s between requests)
  await new Promise(r => setTimeout(r, 3000))
}

console.log(`\nDone! Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed}`)
console.log('Check public/images/ for new files.')
