/**
 * Export scenarios.json → CSV (UTF-8 BOM for Excel Vietnamese support)
 *
 * Usage:
 *   node scripts/export-scenarios-csv.mjs [output.csv]
 *
 * Default output: data/scenarios.csv
 *
 * CSV structure — 1 row per choice (12 rows per scenario):
 *   id, title, image, context, role, choice, text, wealth, control, influence, resilience, alliance, stratification, production, innovation, welfare, democracy
 *
 *   - id/title/image/context: filled only on first row of each scenario (rows 2-12 blank)
 *   - role: cong-nhan, nong-dan, tri-thuc, startup (3 rows each)
 *   - choice: A, B, C
 *   - text: choice description
 *   - wealth..democracy: effect deltas (-15 to +15)
 *
 * 20 scenarios × 4 roles × 3 choices = 240 data rows
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const scenariosPath = join(projectRoot, 'data', 'scenarios.json')
const defaultOut = join(projectRoot, 'data', 'scenarios.csv')

const outPath = process.argv[2] || defaultOut

const ROLES = ['cong-nhan', 'nong-dan', 'tri-thuc', 'startup']
const EFFECT_KEYS = [
  'wealthDelta', 'controlDelta', 'influenceDelta', 'resilienceDelta',
  'allianceDelta', 'stratificationDelta', 'productionDelta',
  'innovationDelta', 'welfareDelta', 'democracyDelta',
]
const EFFECT_SHORT = [
  'wealth', 'control', 'influence', 'resilience',
  'alliance', 'stratification', 'production',
  'innovation', 'welfare', 'democracy',
]

function csvEscape(val) {
  const s = String(val ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

// ─── Read scenarios ──────────────────────────────────────────────────────────
const scenarios = JSON.parse(readFileSync(scenariosPath, 'utf8'))
console.log(`Read ${scenarios.length} scenarios from data/scenarios.json\n`)

// ─── Build CSV ───────────────────────────────────────────────────────────────
const headers = ['id', 'title', 'image', 'context', 'role', 'choice', 'text', ...EFFECT_SHORT]
const rows = [headers.map(csvEscape).join(',')]

for (const sc of scenarios) {
  let isFirst = true

  for (const role of ROLES) {
    const choices = sc.roleSpecificChoices?.[role] ?? []

    for (let ci = 0; ci < 3; ci++) {
      const ch = choices[ci]
      const choiceId = ['A', 'B', 'C'][ci]

      const cols = [
        // Metadata only on first row of each scenario
        isFirst ? sc.id : '',
        isFirst ? sc.title : '',
        isFirst ? (sc.image || '') : '',
        isFirst ? sc.context : '',
        // Role + choice
        role,
        choiceId,
        ch?.text || '',
        // Effect deltas
        ...EFFECT_KEYS.map(ek => ch?.effects?.[ek] ?? 0),
      ]

      rows.push(cols.map(csvEscape).join(','))
      isFirst = false
    }
  }
}

// UTF-8 BOM for Excel to detect encoding correctly
const BOM = '\uFEFF'
writeFileSync(outPath, BOM + rows.join('\r\n'), 'utf8')

const totalRows = rows.length - 1
console.log(`Exported ${scenarios.length} scenarios × ${ROLES.length} roles × 3 choices = ${totalRows} rows`)
console.log(`Output: ${outPath}`)
console.log(`\nCSV has UTF-8 BOM — opens correctly in Excel with Vietnamese text.`)
console.log('Edit in Excel/Google Sheets, then import back with:')
console.log('  node scripts/import-scenarios-csv.mjs data/scenarios.csv')
