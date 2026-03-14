/**
 * Sync scenarios from Google Sheets → data/scenarios.json
 * 
 * Usage:
 *   node scripts/sync-scenarios.mjs <SHEET_ID>
 *   node scripts/sync-scenarios.mjs 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
 * 
 * Sheet format (Tab: "Scenarios"):
 *   Row 1: Headers
 *   Columns: id | title | image | context | choiceA_text | choiceA_wealth | choiceA_control | choiceA_alliance | choiceA_stratification | choiceA_production | choiceA_innovation | choiceA_welfare | choiceA_democracy | choiceB_text | ... | choiceC_text | ...
 * 
 * The script fetches the sheet as CSV (public link, no auth needed if sheet is published).
 * Then writes data/scenarios.json.
 */
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const outPath = join(projectRoot, 'data', 'scenarios.json')

const SHEET_ID = process.argv[2]
if (!SHEET_ID) {
  console.error('Usage: node scripts/sync-scenarios.mjs <GOOGLE_SHEET_ID>')
  console.error('')
  console.error('Sheet must be published to web (File → Share → Publish to web → CSV)')
  console.error('Tab name must be "Scenarios"')
  console.error('')
  console.error('Expected columns:')
  console.error('  id, title, image, context,')
  console.error('  choiceA_text, choiceA_wealth, choiceA_control, choiceA_alliance, choiceA_stratification, choiceA_production, choiceA_innovation, choiceA_welfare, choiceA_democracy,')
  console.error('  choiceB_text, choiceB_wealth, choiceB_control, choiceB_alliance, choiceB_stratification, choiceB_production, choiceB_innovation, choiceB_welfare, choiceB_democracy,')
  console.error('  choiceC_text, choiceC_wealth, choiceC_control, choiceC_alliance, choiceC_stratification, choiceC_production, choiceC_innovation, choiceC_welfare, choiceC_democracy')
  process.exit(1)
}

const SHEET_NAME = 'Scenarios'
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`

function parseCSV(text) {
  const lines = []
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
      lines.push(current)
      current = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (current || lines.length > 0) {
        lines.push(current)
        current = ''
      }
      if (lines.length > 0) {
        yield lines.splice(0)
      }
      if (ch === '\r' && text[i + 1] === '\n') i++
    } else {
      current += ch
    }
  }
  if (current || lines.length > 0) {
    lines.push(current)
    yield lines.splice(0)
  }
}

function int(val) {
  const n = parseInt(val, 10)
  return isNaN(n) ? 0 : n
}

function buildChoice(id, row, offset) {
  return {
    id,
    text: row[offset] || '',
    effects: {
      wealthDelta: int(row[offset + 1]),
      controlDelta: int(row[offset + 2]),
      allianceDelta: int(row[offset + 3]),
      stratificationDelta: int(row[offset + 4]),
      productionDelta: int(row[offset + 5]),
      innovationDelta: int(row[offset + 6]),
      welfareDelta: int(row[offset + 7]),
      democracyDelta: int(row[offset + 8]),
    },
  }
}

console.log(`Fetching from Google Sheets: ${SHEET_ID}`)
console.log(`Sheet tab: ${SHEET_NAME}\n`)

try {
  const res = await fetch(CSV_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  const csvText = await res.text()

  const rows = [...parseCSV(csvText)]
  if (rows.length < 2) throw new Error('Sheet has no data rows')

  const headers = rows[0]
  console.log(`Headers: ${headers.join(', ')}`)
  console.log(`Data rows: ${rows.length - 1}\n`)

  const scenarios = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row[0]?.trim()) continue

    const scenario = {
      id: row[0].trim(),
      title: row[1]?.trim() || '',
      image: row[2]?.trim() || '',
      context: row[3]?.trim() || '',
      choices: [
        buildChoice('A', row, 4),
        buildChoice('B', row, 13),
        buildChoice('C', row, 22),
      ],
    }

    scenarios.push(scenario)
    console.log(`  [${i}] ${scenario.id} — ${scenario.title}`)
  }

  writeFileSync(outPath, JSON.stringify(scenarios, null, 2), 'utf8')
  console.log(`\nWrote ${scenarios.length} scenarios to data/scenarios.json`)
} catch (err) {
  console.error(`\nError: ${err.message}`)
  console.error('\nMake sure the Google Sheet is published to web:')
  console.error('  File → Share → Publish to web → Select "Scenarios" tab → CSV format → Publish')
  process.exit(1)
}
