/**
 * Generate 6 additional slide images for MLN131 Chapter 5 presentation.
 * Mixed aspect ratios: 21:9, 1:1, 16:9
 * Style-chained from cover-phan-1.png as the series anchor.
 *
 * Run: node scripts/gen-slide-images.mjs
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
if (!apiKey) { console.error('GEMINI_API_KEY not set in .env'); process.exit(1) }

const client = new GoogleGenAI({ apiKey })
const OUT_DIR = 'D:\\UNI\\MLN131\\images'
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const MODEL = 'gemini-3-pro-image-preview'

// ── Shared style DNA (same series as the covers) ─────────────────────────────
const STYLE_DNA = `
SERIES VISUAL IDENTITY — match the existing cover images in this series:
- Background: deep midnight-blue fading to black (#0a0f1e → #000000), subtle hexagonal grid texture overlay
- Art style: premium flat vector illustration — bold geometric silhouettes, clean hard edges, zero photorealism, flat fills only (no gradients within shapes)
- Lighting: dramatic rim-light from one edge matching the dominant accent color; opposite side fades to near-black
- Atmosphere: solemn, intellectual, slightly futuristic — high-end academic keynote aesthetic
- Red socialist star motif: small, subtle, consistent placement in corner
- Vietnamese cultural context: ultra-faint lotus or Vietnamese star watermark in background (~5% opacity)
- NO text, NO letters, NO numbers anywhere in the image
- NO photorealistic rendering
`.trim()

// ── Image definitions ─────────────────────────────────────────────────────────
const IMAGES = [
  // ── 1. 21:9 ──────────────────────────────────────────────────────────────
  {
    filename: 'slide-vi-tri-co-cau.png',
    ratio: '21:9',
    prompt: `
${STYLE_DNA}

CANVAS: Ultra-wide 21:9 (2.33:1 landscape, letterbox format).
DOMINANT ACCENT: Deep blue (#1e3a8a) with gold (#eab308) secondary.
COMPOSITION (left-heavy, right ~45% dark for text overlay):
A monumental multi-ring CONCENTRIC DIAGRAM fills the left side. The outermost ring (large, faint) represents "toàn bộ đời sống xã hội" (all social life). The middle ring represents "các loại cơ cấu xã hội" (social structures). The innermost GLOWING ring — brightest, blue-gold — represents "cơ cấu xã hội - giai cấp" (social class structure) at the CENTER. From this core ring, four beams radiate outward in blue, emerald, violet, amber. The core ring has a subtle STAR or NODE at its center, suggesting centrality and importance. Around the rings: abstract data-orbit paths like electrons, suggesting the scientific/systemic nature of the topic.
RIM LIGHT: Cold blue-gold from left edge.
MOOD: Authoritative, diagrammatic, shows hierarchy and centrality.
    `.trim(),
  },

  // ── 2. 1:1 ───────────────────────────────────────────────────────────────
  {
    filename: 'slide-quy-luat-bien-doi.png',
    ratio: '1:1',
    prompt: `
${STYLE_DNA}

CANVAS: Perfect square 1:1.
DOMINANT ACCENT: Violet (#8b5cf6) and amber (#f59e0b) — representing transformation over time.
COMPOSITION (centered, fills ~80% of canvas):
A visual metaphor for TRANSFORMATION and HISTORICAL LAW. At center: a large SPIRAL or HELIX rising from bottom to top — representing historical progression. Along the spiral: three distinct "stages" marked by different geometric shapes. Stage 1 (bottom): angular, rough shapes in dark blue — old capitalist-era class structure. Stage 2 (middle): transitional, mixed forms — the "thời kỳ quá độ" (transition period), marked with a bright amber marker. Stage 3 (top): harmonious, interconnected circular shapes in emerald/violet — the emerging new structure. Connecting the stages: flowing curved geometric arrows curving upward. Behind the spiral: very faint clock/gear motifs suggesting time and mechanistic laws of change.
RIM LIGHT: Violet from left, amber accent on right nodes.
MOOD: Dynamic, evolutionary, scientific — laws of historical change.
    `.trim(),
  },

  // ── 3. 1:1 ───────────────────────────────────────────────────────────────
  {
    filename: 'slide-vi-tri-thanh-nien.png',
    ratio: '1:1',
    prompt: `
${STYLE_DNA}

CANVAS: Perfect square 1:1.
DOMINANT ACCENT: Amber-gold (#f59e0b) with electric blue (#3b82f6) secondary.
COMPOSITION (centered, fills ~80% of canvas):
A VENN / INTERSECTION DIAGRAM rendered as overlapping geometric circles. Three large circles overlap at center: LEFT circle in blue (worker class), BOTTOM-LEFT circle in emerald (farmer class), RIGHT circle in violet (intellectual class). At the CENTER INTERSECTION — where all three overlap — a bright AMBER-GOLD glowing STAR or FIGURE representing "Thanh niên" (Youth) who uniquely bridges all three classes. The youth figure/star at intersection is significantly BRIGHTER and LARGER than surrounding elements, emphasizing its unique cross-class position. From the youth center: four radial beams in different colors going outward, suggesting youth's role connecting and energizing all classes.
RIM LIGHT: Warm amber from lower-left, cold blue from upper-right.
MOOD: Dynamic, interconnected, youth at the nexus — shows special position.
    `.trim(),
  },

  // ── 4. 21:9 ──────────────────────────────────────────────────────────────
  {
    filename: 'slide-suc-manh-thanh-nien.png',
    ratio: '21:9',
    prompt: `
${STYLE_DNA}

CANVAS: Ultra-wide 21:9 (2.33:1 landscape, letterbox format).
DOMINANT ACCENT: Vibrant amber-gold (#f59e0b) and red (#dc2626) — energy and power.
COMPOSITION (left-heavy, right ~45% dark for text overlay):
A WAVE or SURGE composition. A massive crowd of geometric human silhouettes (simplified, uniform) surges from left background toward right foreground — like a wave or army advancing. The crowd is rendered in layers: back rows in dark tones, front rows in increasingly bright amber-gold, the frontmost figures almost glowing. Above the crowd: a giant FIST or RAISED HAND silhouette (geometric, simplified) holding a digital device/tablet, suggesting tech-powered activism. Above that: network signal arcs radiating forward. The ground beneath them: Vietnamese rice-paddy terrace steps, very abstract and faint, connecting to national identity. The overall energy is unstoppable, forward-moving, massive.
RIM LIGHT: Intense amber-red from left, fading to deep black on right.
MOOD: Powerful, collective, unstoppable — the STRENGTH of Vietnamese youth.
    `.trim(),
  },

  // ── 5. 16:9 ──────────────────────────────────────────────────────────────
  {
    filename: 'slide-gia-tri-cot-loi.png',
    ratio: '16:9',
    prompt: `
${STYLE_DNA}

CANVAS: Standard widescreen 16:9.
DOMINANT ACCENT: Gold (#eab308) with multi-color accents — representing synthesis of values.
COMPOSITION (balanced, centered, slight left-lean):
A CRYSTAL or FACETED GEM shape at center-left, large and luminous in gold. The gem has 4 clearly defined facets, each glowing in a different color: BLUE facet (theory/lý luận), EMERALD facet (alliance/liên minh), VIOLET facet (knowledge/tri thức), AMBER facet (practice/thực tiễn). From each facet: a beam of that color extends outward to an orbiting node/icon. All four beams converge back into the central gold crystal. The composition suggests that all values are facets of one coherent truth. Background: very faint horizontal data lines like a scientific graph, suggesting analytical depth. The overall composition is diamond-like, precise, and balanced.
RIM LIGHT: Warm gold from upper-left.
MOOD: Comprehensive, synthesizing, conclusive — core values crystallized.
    `.trim(),
  },

  // ── 6. 16:9 ──────────────────────────────────────────────────────────────
  {
    filename: 'slide-ket-bai.png',
    ratio: '16:9',
    prompt: `
${STYLE_DNA}

CANVAS: Standard widescreen 16:9.
DOMINANT ACCENT: Cyan (#06b6d4) and gold (#eab308) — representing technology and human values in harmony.
COMPOSITION (cinematic, centered narrative):
A powerful DUALITY composition split vertically down the center. LEFT HALF: Abstract AI/technology imagery — a glowing neural network, circuit board patterns, holographic data streams, robot arm silhouettes, all in cold cyan-blue tones. RIGHT HALF: Human/values imagery — a young person silhouette standing upright, fist clenched at side in determination, surrounded by warm gold light; behind them: a Vietnamese flag star shape, lotus flower geometric shape, suggesting moral and political conviction. DOWN THE CENTER DIVIDE: A bright white glowing line where both worlds meet — the boundary where technology meets human conscience. At the TOP of this dividing line: a symbolic HAND (human) reaching up and grasping/directing a data stream coming from the tech side. The message is clear: human agency directs technology.
RIM LIGHT: Cold cyan from far left; warm gold from far right; brilliant white at center divide.
MOOD: Profound, balanced, forward-looking — humanity's mastery over technology for the common good.
    `.trim(),
  },
]

// ── Generation helpers ────────────────────────────────────────────────────────
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff])

function decodeImageData(raw) {
  let buf = Buffer.from(raw, 'base64')
  const ok = buf.subarray(0, 4).equals(PNG_MAGIC) || buf.subarray(0, 3).equals(JPEG_MAGIC)
  if (!ok) {
    try {
      const d = Buffer.from(buf.toString('ascii'), 'base64')
      if (d.subarray(0, 4).equals(PNG_MAGIC) || d.subarray(0, 3).equals(JPEG_MAGIC)) return d
    } catch {}
  }
  return buf
}

async function generateImage(prompt, styleRef = null) {
  const parts = []
  if (styleRef) {
    parts.push({ text: 'Use this image as a STRICT style reference — match its dark background, hex-grid texture, flat geometric vector art, dramatic rim-lighting, and overall cinematic academic mood. Generate a completely new subject as described below.' })
    parts.push({ inlineData: { mimeType: 'image/png', data: styleRef.toString('base64') } })
  }
  parts.push({ text: prompt })

  const response = await client.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts }],
    config: { responseModalities: ['IMAGE'] },
  })

  if (!response.candidates?.length) throw new Error('Empty response')
  const resParts = response.candidates[0].content?.parts ?? []
  for (const p of resParts) {
    if (p.inlineData?.data) return decodeImageData(p.inlineData.data)
  }
  const text = resParts.filter(p => p.text).map(p => p.text).join(' ')
  throw new Error(`No image data.${text ? ` Model: ${text.slice(0, 300)}` : ''}`)
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log('\n╔══════════════════════════════════════════════════════════════╗')
console.log('║  MLN131 — Slide Image Generator (21:9 / 1:1 / 16:9)        ║')
console.log(`║  Model: ${MODEL.padEnd(54)}║`)
console.log(`║  Output: ${OUT_DIR.padEnd(53)}║`)
console.log('╚══════════════════════════════════════════════════════════════╝\n')

// Load existing cover as style anchor
const ANCHOR_PATH = join(OUT_DIR, 'cover-phan-1.png')
let styleAnchor = existsSync(ANCHOR_PATH) ? readFileSync(ANCHOR_PATH) : null
if (styleAnchor) {
  console.log(`  📌 Style anchor: cover-phan-1.png (${(styleAnchor.length / 1024).toFixed(0)} KB)\n`)
} else {
  console.log('  ⚠ No style anchor found — first image will set the style\n')
}

let generated = 0, skipped = 0, failed = 0

for (const [i, { filename, ratio, prompt }] of IMAGES.entries()) {
  const outPath = join(OUT_DIR, filename)

  if (existsSync(outPath)) {
    console.log(`  SKIP  [${i + 1}/${IMAGES.length}] ${filename} (${ratio}) — already exists`)
    if (!styleAnchor) styleAnchor = readFileSync(outPath)
    skipped++
    continue
  }

  process.stdout.write(`  GEN   [${i + 1}/${IMAGES.length}] ${filename} (${ratio}) ...\n        → `)

  try {
    const imageData = await generateImage(prompt, styleAnchor)
    writeFileSync(outPath, imageData)
    const kb = (imageData.length / 1024).toFixed(0)
    console.log(`✓ OK — ${kb} KB`)
    if (!styleAnchor) { styleAnchor = imageData; console.log('        → Set as style anchor\n') }
    generated++
  } catch (err) {
    console.log(`✗ FAIL: ${err.message}`)
    failed++
  }

  if (i < IMAGES.length - 1) {
    process.stdout.write('        (4s pause...)\n\n')
    await new Promise(r => setTimeout(r, 4000))
  }
}

console.log('\n──────────────────────────────────────────────────────────────')
console.log(`  Generated: ${generated}  |  Skipped: ${skipped}  |  Failed: ${failed}`)
console.log(`  Output: ${OUT_DIR}`)
console.log('──────────────────────────────────────────────────────────────\n')
