/**
 * Generate 4 cinematic 21:9 section cover images for MLN131 Chapter 5 presentation.
 * Sections: I - Cơ cấu xã hội, II - Liên minh giai cấp, III - Thanh niên VN, IV - Tổng kết
 * Uses style-chaining: image 1 anchors the style for images 2-4.
 *
 * Run: node scripts/gen-cover-images.mjs
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
const OUT_DIR = 'D:\\UNI\\MLN131\\images'
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const MODEL = 'gemini-3-pro-image-preview'

/**
 * Shared cinematic ultra-wide style — consistent across all 4 covers.
 * Must feel like a premium academic keynote slide cover at 21:9 (2.33:1).
 */
const STYLE = `
UNIFIED CINEMATIC STYLE — apply rigorously to every image in this series:
- Canvas ratio: ultra-wide 21:9 (2.33:1 landscape). Extremely wide, shallow height — like a cinematic letterbox.
- Background: bright light tone — clean off-white to pale warm gray (#f8f6f1 → #edeae3), with a very subtle hexagonal grid texture overlay at ~8% opacity
- Art style: premium flat vector illustration — bold geometric silhouettes, clean hard edges, no photorealism, no gradients within shapes
- Lighting: soft directional light from the RIGHT — subjects on the right are fully lit and vivid; the LEFT half transitions to a lighter, airier tone (not dark) that still provides clear contrast for text overlay
- Composition: key subject/elements are HEAVILY focused on the RIGHT 50% of the canvas; the LEFT 50% is a clean, airy light space intentionally left open for text overlay — keep it uncluttered
- Depth: 3 layers — foreground (accent-color geometric shapes, vivid), midground (main subject silhouettes, full bold color), background (very faint pale silhouette at ~15% opacity)
- Atmosphere: bright, modern, professional — like a premium 2030 academic keynote or TED-style presentation
- NO red socialist star, NO flag stars, NO political symbols anywhere
- Vietnamese cultural accent: ultra-faint lotus petal outline in background (~8% opacity), purely decorative
- NO text, NO letters, NO numbers, NO roman numerals anywhere in the image
- NO photorealistic rendering
- Color palette: light/white bg + 1 bold vivid accent color per image + subtle secondary warmth
`.trim()

const COVERS = [
  {
    filename: 'cover-phan-1.png',
    prompt: `
${STYLE}

THIS COVER — Phần I: Cơ cấu xã hội - giai cấp (Social Class Structure):
Dominant accent: electric blue (#2563eb) — crisp and analytical.
LEFT-focused composition (right 50% is the visual focus; left 50% is clean open light space):
A stylized PYRAMID on the RIGHT, made of 4 stacked geometric bands — bold blue at base, emerald, violet, then amber at top. Between layers: thin white separating lines. Surrounding the pyramid: light-colored abstract arrows and connection lines showing structural forces. Far background: very faint pale cityscape silhouette at 12% opacity.
Lighting: bright and vivid on the right, airy open space on the left.
Mood: analytical, clean, academic — this is the THEORY section.
    `.trim(),
  },
  {
    filename: 'cover-phan-2.png',
    prompt: `
${STYLE}

THIS COVER — Phần II: Liên minh giai cấp, tầng lớp (Class Alliance):
Dominant accent: warm coral-red (#e85d4a) — solidarity and unity, bright not dark.
RIGHT-focused composition (right 50% visual focus; left 50% clean open space):
THREE bold geometric human silhouettes on the RIGHT — blue worker (hard-hat), emerald farmer (conical hat), violet intellectual (glasses) — standing side by side, arms reaching toward each other. Connecting them: interlocking warm coral chain-link rings between their hands. Behind them: radiating concentric arcs like a sunrise broadcast, vivid on the right fading gently to the light background on the left.
Lighting: bright warm light from the right, clean pale space on the left.
Mood: powerful, united, optimistic — this is the ALLIANCE section.
Maintain IDENTICAL light background, hex-grid texture, aspect ratio, and left-focus composition as the first cover.
    `.trim(),
  },
  {
    filename: 'cover-phan-3.png',
    prompt: `
${STYLE}

THIS COVER — Phần III: Thanh niên Việt Nam trong cơ cấu xã hội (Vietnamese Youth):
Dominant accent: vibrant amber-gold (#f59e0b) — youth energy and digital future.
RIGHT-focused composition (right 50% visual focus; left 50% clean open space):
FOUR young silhouettes in forward-striding poses clustered on the RIGHT — one with tablet (digital artist), one with hard hat (young worker), one with graduation cap (student), one with a device (startup youth). They stride toward the left with energy. Above them: floating geometric network nodes connected by amber lines. The composition has forward momentum. Background: very faint pale pagoda roofline shape at 10% opacity.
Lighting: warm amber-gold light from the right, bright open space on the left.
Mood: energetic, hopeful, forward-looking — this is the YOUTH section.
Maintain IDENTICAL light background, hex-grid texture, aspect ratio, and left-focus composition as previous covers.
    `.trim(),
  },
  {
    filename: 'cover-phan-4.png',
    prompt: `
${STYLE}

THIS COVER — Phần IV: Tổng kết và Trách nhiệm thực tiễn (Conclusion & Practical Responsibility):
Dominant accent: golden yellow (#eab308) blending with emerald (#10b981) — completion and new growth.
RIGHT-focused composition (right 50% visual focus; left 50% clean open space):
A bold RADIAL COMPASS shape on the RIGHT with 4 beams radiating in the 4 class colors (blue, emerald, violet, amber) — each ending in a small icon shape (gear, leaf, book, circuit). Beams converge at a bright golden core. Above: small geometric particles floating upward like sparks. Background: very faint pale concentric circle pattern at 8% opacity.
Lighting: warm gold light from the right, clean bright space on the left.
Mood: conclusive, synthesizing, inspiring — this is the CONCLUSION section.
Maintain IDENTICAL light background, hex-grid texture, aspect ratio, and left-focus composition as previous covers.
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
      if (decoded.subarray(0, 4).equals(PNG_MAGIC) || decoded.subarray(0, 3).equals(JPEG_MAGIC)) return decoded
    } catch {}
  }
  return buf
}

async function generateImage(prompt, styleImageBuffer = null) {
  const contents = []

  if (styleImageBuffer) {
    contents.push({
      role: 'user',
      parts: [
        {
          text: 'Use the following image as a STRICT style reference. Precisely match its: ultra-wide 21:9 canvas ratio, BRIGHT light background (off-white/warm gray), subtle hex-grid texture, flat vector silhouette art style, RIGHT-heavy composition with clean open light-toned LEFT side for text, soft directional lighting from the right, and overall bright modern keynote mood. Generate a COMPLETELY NEW subject as described below — do NOT copy the subject matter.',
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
  throw new Error(`No image data.${textParts ? ` Model said: ${textParts.slice(0, 300)}` : ''}`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('\n╔════════════════════════════════════════════════════════════╗')
console.log('║  MLN131 — Section Cover Generator (21:9 Cinematic)           ║')
console.log(`║  Model: ${MODEL.padEnd(51)}║`)
console.log(`║  Output: ${OUT_DIR.padEnd(50)}║`)
console.log('╚══════════════════════════════════════════════════════════════╝\n')

let styleAnchor = null
let generated = 0, skipped = 0, failed = 0

for (const [i, { filename, prompt }] of COVERS.entries()) {
  const outPath = join(OUT_DIR, filename)

  if (existsSync(outPath)) {
    console.log(`  SKIP  [${i + 1}/4] ${filename} (already exists)`)
    if (!styleAnchor) styleAnchor = readFileSync(outPath)
    skipped++
    continue
  }

  const tag = styleAnchor ? '(style-chained)' : '(anchor — sets style for series)'
  process.stdout.write(`  GEN   [${i + 1}/4] ${filename} ${tag}\n        → `)

  try {
    const imageData = await generateImage(prompt, styleAnchor)
    writeFileSync(outPath, imageData)
    const kb = (imageData.length / 1024).toFixed(0)
    console.log(`✓ OK — ${kb} KB → ${outPath}`)

    if (!styleAnchor) {
      styleAnchor = imageData
      console.log(`        → Style anchor set. Remaining images will style-chain from this.\n`)
    }
    generated++
  } catch (err) {
    console.log(`✗ FAIL: ${err.message}`)
    failed++
  }

  if (i < COVERS.length - 1) {
    process.stdout.write('        (4s rate-limit pause...)\n\n')
    await new Promise(r => setTimeout(r, 4000))
  }
}

console.log('\n─────────────────────────────────────────────────────────────')
console.log(`  Generated: ${generated}  |  Skipped: ${skipped}  |  Failed: ${failed}`)
console.log(`  Files: cover-phan-{1,2,3,4}.png  in  ${OUT_DIR}`)
console.log('─────────────────────────────────────────────────────────────\n')
