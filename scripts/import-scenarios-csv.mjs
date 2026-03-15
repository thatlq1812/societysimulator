/**
 * Import scenarios from CSV → data/scenarios.json
 * + Auto-generate AI images for scenarios missing images
 * + Auto-update src/lib/image-maps.ts
 *
 * Usage:
 *   node scripts/import-scenarios-csv.mjs <input.csv> [--gen-images] [--dry-run]
 *
 * Options:
 *   --gen-images   Auto-generate AI images for scenarios without image files
 *   --dry-run      Preview changes without writing files
 *
 * CSV format — 1 row per choice (12 rows per scenario):
 *   id, title, image, context, role, choice, text, wealth, control, influence, resilience, alliance, stratification, production, innovation, welfare, democracy
 *
 *   - id/title/image/context: filled only on first row of each scenario (blank = inherit from above)
 *   - role: cong-nhan | nong-dan | tri-thuc | startup
 *   - choice: A | B | C
 *   - text: choice description
 *   - wealth..democracy: effect deltas (-15 to +15)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const scenariosPath = join(projectRoot, 'data', 'scenarios.json')
const imageMapsPath = join(projectRoot, 'src', 'lib', 'image-maps.ts')
const imagesDir = join(projectRoot, 'public', 'images')

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const flags = new Set(args.filter(a => a.startsWith('--')))
const positional = args.filter(a => !a.startsWith('--'))

const csvPath = positional[0]
const genImages = flags.has('--gen-images')
const dryRun = flags.has('--dry-run')

if (!csvPath) {
  console.error('Usage: node scripts/import-scenarios-csv.mjs <input.csv> [--gen-images] [--dry-run]')
  console.error('')
  console.error('Options:')
  console.error('  --gen-images   Auto-generate AI images for scenarios without image files')
  console.error('  --dry-run      Preview changes without writing files')
  console.error('')
  console.error('CSV format: 1 row per choice (12 rows per scenario)')
  console.error('  id, title, image, context, role, choice, text, wealth, control, ..., democracy')
  process.exit(1)
}

// ─── CSV parser ──────────────────────────────────────────────────────────────
function parseCSV(text) {
  // Strip BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)

  const rows = []
  let fields = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (current || fields.length > 0) {
        fields.push(current)
        current = ''
      }
      if (fields.length > 0) {
        rows.push(fields)
        fields = []
      }
      if (ch === '\r' && text[i + 1] === '\n') i++
    } else {
      current += ch
    }
  }
  if (current || fields.length > 0) {
    fields.push(current)
    rows.push(fields)
  }
  return rows
}

function int(val) {
  const n = parseInt(val, 10)
  return isNaN(n) ? 0 : n
}

// ─── Effect key mapping ──────────────────────────────────────────────────────
const EFFECT_SHORT = [
  'wealth', 'control', 'influence', 'resilience',
  'alliance', 'stratification', 'production',
  'innovation', 'welfare', 'democracy',
]
const EFFECT_KEYS = EFFECT_SHORT.map(k => k + 'Delta')

// ─── Read + parse CSV ────────────────────────────────────────────────────────
console.log(`Reading CSV: ${csvPath}`)
const csvText = readFileSync(csvPath, 'utf8')
const allRows = parseCSV(csvText)

if (allRows.length < 2) {
  console.error('CSV has no data rows')
  process.exit(1)
}

const headers = allRows[0].map(h => h.trim().toLowerCase())
console.log(`Headers: ${headers.length} columns, ${allRows.length - 1} data rows\n`)

// Find column indices
function colIdx(name) {
  const idx = headers.indexOf(name.toLowerCase())
  if (idx === -1) throw new Error(`Missing required column: "${name}"`)
  return idx
}

const COL = {
  id: colIdx('id'),
  title: colIdx('title'),
  image: colIdx('image'),
  context: colIdx('context'),
  role: colIdx('role'),
  choice: colIdx('choice'),
  text: colIdx('text'),
}
// Effect columns
for (const e of EFFECT_SHORT) {
  COL[e] = colIdx(e)
}

// ─── Group rows into scenarios (fill-down for blank id/title/image/context) ─
const scenarioMap = new Map() // id → { meta, roles: { role → { choiceId → {text, effects} } } }
let currentId = ''
let currentTitle = ''
let currentImage = ''
let currentContext = ''

for (let i = 1; i < allRows.length; i++) {
  const row = allRows[i]

  // Fill-down: if id is non-empty, start a new scenario group
  const rawId = row[COL.id]?.trim()
  if (rawId) {
    currentId = rawId
    currentTitle = row[COL.title]?.trim() || currentTitle
    currentImage = row[COL.image]?.trim() ?? currentImage
    currentContext = row[COL.context]?.trim() || currentContext
  }

  if (!currentId) {
    console.warn(`  Row ${i + 1}: no scenario ID yet, skipping`)
    continue
  }

  const role = row[COL.role]?.trim()
  const choiceId = row[COL.choice]?.trim()?.toUpperCase()
  const text = row[COL.text]?.trim()

  if (!role || !choiceId || !text) {
    console.warn(`  Row ${i + 1}: missing role/choice/text, skipping`)
    continue
  }

  if (!scenarioMap.has(currentId)) {
    scenarioMap.set(currentId, {
      id: currentId,
      title: currentTitle,
      image: currentImage,
      context: currentContext,
      roles: {},
    })
  }

  const sc = scenarioMap.get(currentId)
  // Update metadata if provided (allows editing on any row)
  if (rawId) {
    sc.title = currentTitle
    sc.image = currentImage
    sc.context = currentContext
  }

  if (!sc.roles[role]) sc.roles[role] = []

  const effects = {}
  for (let ei = 0; ei < EFFECT_SHORT.length; ei++) {
    effects[EFFECT_KEYS[ei]] = int(row[COL[EFFECT_SHORT[ei]]])
  }

  sc.roles[role].push({ id: choiceId, text, effects })
}

// ─── Build scenarios array ───────────────────────────────────────────────────
const scenarios = []
const ROLE_ORDER = ['cong-nhan', 'nong-dan', 'tri-thuc', 'startup']

for (const [id, sc] of scenarioMap) {
  const roleSpecificChoices = {}
  for (const role of ROLE_ORDER) {
    if (sc.roles[role]?.length) {
      roleSpecificChoices[role] = sc.roles[role]
    } else {
      console.warn(`  Scenario "${id}": missing role "${role}" — using empty choices`)
      roleSpecificChoices[role] = []
    }
  }

  scenarios.push({
    id: sc.id,
    title: sc.title,
    image: sc.image,
    context: sc.context,
    roleSpecificChoices,
  })
}

console.log(`Parsed ${scenarios.length} scenarios from CSV`)
for (const sc of scenarios) {
  const roleCounts = ROLE_ORDER.map(r => sc.roleSpecificChoices[r]?.length || 0)
  console.log(`  ${sc.id} — "${sc.title}" [${roleCounts.join('/')} choices]`)
}

// ─── Delta cap validation ────────────────────────────────────────────────────
let warnings = 0
for (const sc of scenarios) {
  for (const [role, choices] of Object.entries(sc.roleSpecificChoices)) {
    for (const ch of choices) {
      for (const [key, val] of Object.entries(ch.effects)) {
        if (Math.abs(val) > 15) {
          console.warn(`  ⚠ ${sc.id}/${role}/${ch.id}: ${key}=${val} exceeds ±15 cap`)
          ch.effects[key] = Math.max(-15, Math.min(15, val))
          warnings++
        }
      }
    }
  }
}
if (warnings) console.log(`\n  Clamped ${warnings} delta values to ±15`)

// ─── Check for missing images ────────────────────────────────────────────────
const missingImages = []
for (const sc of scenarios) {
  if (!sc.image) {
    missingImages.push(sc)
    continue
  }
  const imgPath = join(imagesDir, sc.image)
  if (!existsSync(imgPath)) {
    missingImages.push(sc)
  }
}

if (missingImages.length > 0) {
  console.log(`\n${missingImages.length} scenarios missing images:`)
  for (const sc of missingImages) {
    console.log(`  - ${sc.id}: ${sc.image || '(no image field)'}`)
  }
}

// ─── Write scenarios.json ────────────────────────────────────────────────────
if (dryRun) {
  console.log('\n[DRY RUN] Would write scenarios.json but skipping')
} else {
  writeFileSync(scenariosPath, JSON.stringify(scenarios, null, 2) + '\n', 'utf8')
  console.log(`\nWrote ${scenarios.length} scenarios to data/scenarios.json`)
}

// ─── Update image-maps.ts ────────────────────────────────────────────────────
function updateImageMaps() {
  const mapEntries = scenarios
    .filter(sc => sc.image)
    .map(sc => `  '${sc.id}': '/images/${sc.image}',`)
    .join('\n')

  const currentContent = readFileSync(imageMapsPath, 'utf8')

  // Replace SCENARIO_IMAGE_MAP block
  const mapRegex = /(export const SCENARIO_IMAGE_MAP: Record<string, string> = \{)\n[\s\S]*?(\})/
  const match = currentContent.match(mapRegex)

  if (!match) {
    console.warn('  Could not find SCENARIO_IMAGE_MAP in image-maps.ts — skipping update')
    return false
  }

  const newContent = currentContent.replace(
    mapRegex,
    `$1\n${mapEntries}\n$2`,
  )

  if (newContent === currentContent) {
    console.log('  image-maps.ts already up to date')
    return true
  }

  if (dryRun) {
    console.log('  [DRY RUN] Would update image-maps.ts')
    return true
  }

  writeFileSync(imageMapsPath, newContent, 'utf8')
  console.log('  Updated SCENARIO_IMAGE_MAP in src/lib/image-maps.ts')
  return true
}

updateImageMaps()

// ─── Auto-generate missing images ────────────────────────────────────────────
if (genImages && missingImages.length > 0) {
  console.log(`\n── Generating ${missingImages.length} missing images ──\n`)

  // Read .env for API key
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
    console.error('  GEMINI_API_KEY not set in .env — cannot generate images')
    console.error('  Run without --gen-images, or set GEMINI_API_KEY in .env')
    process.exit(1)
  }

  const { GoogleGenAI } = await import('@google/genai')
  const client = new GoogleGenAI({ apiKey })
  if (!existsSync(imagesDir)) mkdirSync(imagesDir, { recursive: true })

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
- Aspect ratio: square (1:1)
- Color palette is limited: dark bg + 1-2 accent colors per image`.trim()

  async function generateImage(prompt, filename) {
    const fullPrompt = `${STYLE_RULES}\n\nGENERATE THIS IMAGE:\n${prompt}`
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [fullPrompt],
      config: { responseModalities: ['IMAGE'] },
    })

    if (!response.candidates?.length) throw new Error('Empty response')
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

        const outPath = join(imagesDir, filename)
        writeFileSync(outPath, imageData)
        return imageData.length
      }
    }
    throw new Error('No image data in response')
  }

  let generated = 0
  let failed = 0

  for (const sc of missingImages) {
    // Auto-assign filename if missing
    if (!sc.image) {
      sc.image = `scenario-${sc.id}.png`
      // Update in scenarios array
      const idx = scenarios.findIndex(s => s.id === sc.id)
      if (idx >= 0) scenarios[idx].image = sc.image
    }

    const prompt = `Abstract symbolic illustration representing: "${sc.title}". Context: ${sc.context.slice(0, 200)}`
    process.stdout.write(`  GEN  ${sc.image} ...`)

    try {
      const size = await generateImage(prompt, sc.image)
      console.log(` OK (${(size / 1024).toFixed(0)} KB)`)
      generated++
    } catch (err) {
      console.log(` FAIL: ${err.message}`)
      failed++
    }

    // Rate limit (3s between requests)
    await new Promise(r => setTimeout(r, 3000))
  }

  console.log(`\nImage generation: ${generated} OK, ${failed} failed`)

  // Re-write scenarios.json + image-maps.ts with updated image fields
  if (generated > 0 && !dryRun) {
    writeFileSync(scenariosPath, JSON.stringify(scenarios, null, 2) + '\n', 'utf8')
    updateImageMaps()
    console.log('Updated scenarios.json + image-maps.ts with new image fields')
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log('\n── Summary ──')
console.log(`  Scenarios: ${scenarios.length}`)
console.log(`  Roles per scenario: ${ROLE_ORDER.length}`)
console.log(`  Choices per role: 3 (A/B/C)`)
console.log(`  Effects per choice: ${EFFECT_KEYS.length}`)
if (warnings) console.log(`  Delta clamped: ${warnings}`)
if (missingImages.length && !genImages) {
  console.log(`\n  Tip: Run with --gen-images to auto-generate missing images`)
}
if (dryRun) console.log(`\n  [DRY RUN] No files were modified`)
