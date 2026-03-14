/**
 * Generate role-specific choices (20×4×3 = 240) using Gemini API.
 * Reads current data/scenarios.json, generates roleSpecificChoices for each,
 * writes back to data/scenarios.json.
 *
 * Run: node scripts/gen-role-choices.mjs
 */
import { GoogleGenAI } from '@google/genai'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

// Read .env
const envPath = join(projectRoot, '.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  }
}

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) { console.error('GEMINI_API_KEY not set'); process.exit(1) }

const client = new GoogleGenAI({ apiKey })
const dataPath = join(projectRoot, 'data', 'scenarios.json')
const scenarios = JSON.parse(readFileSync(dataPath, 'utf8'))

const SYSTEM_PROMPT = `Bạn là chuyên gia thiết kế game giáo dục về Chủ nghĩa Xã hội Khoa học (MLN131) tại FPT University.

NHIỆM VỤ: Cho một tình huống xã hội số (macro event), tạo 3 lựa chọn (A, B, C) cho MỖI vai trò trong 4 giai cấp. Tổng cộng 12 lựa chọn (4 roles × 3 choices).

4 VAI TRÒ:
- cong-nhan (Công nhân Nền tảng): Góc nhìn lao động — việc làm, lương, bảo hiểm, quyền lợi gig worker, đình công, liên đoàn
- nong-dan (Nông dân 4.0): Góc nhìn nông nghiệp — đất đai, mùa vụ, hợp tác xã, chuỗi cung ứng, nông thôn số
- tri-thuc (Trí thức Công nghệ): Góc nhìn tri thức — nghiên cứu, giáo dục, mã nguồn mở, chính sách công nghệ, đạo đức AI
- startup (Chủ Startup): Góc nhìn kinh doanh — đầu tư, cạnh tranh, mở rộng, lợi nhuận, thị trường

CẤU TRÚC LỰA CHỌN:
- A = Tư lợi/Tư bản: Ưu tiên lợi ích cá nhân/nhóm, chấp nhận bất bình đẳng
- B = Cộng đồng/Xã hội chủ nghĩa: Hy sinh lợi ích cá nhân vì tập thể, đoàn kết giai cấp
- C = Cải lương/Trung dung: Dung hòa, thực dụng, cải cách dần dần

MỖI CHOICE CÓ 10 EFFECTS:
- wealthDelta: -12 → +22 (A: dương cao, B: âm, C: vừa phải)
- controlDelta: -20 → +20 (quyền kiểm soát tư liệu sản xuất)
- influenceDelta: -5 → +8 (tiếng nói chính trị — MỚI)
- resilienceDelta: -8 → +10 (sức chống chịu rủi ro — MỚI. A: thường âm, B: dương, C: vừa)
- allianceDelta: -20 → +22 (A: âm sâu, B: dương mạnh, C: dương vừa)
- stratificationDelta: -15 → +18 (A: dương/tăng phân hóa, B: âm/giảm, C: nhẹ)
- productionDelta: -3 → +20
- innovationDelta: -8 → +20
- welfareDelta: -18 → +22 (A: âm, B: dương mạnh)
- democracyDelta: -20 → +22

QUY TẮC:
1. Text lựa chọn bằng tiếng Việt, 1-2 câu ngắn gọn, cụ thể theo vai trò
2. Mỗi vai trò phải có góc nhìn ĐẶC THÙ — Công nhân lo về việc làm, Nông dân lo về đất/mùa vụ, Trí thức lo về tri thức/đạo đức, Startup lo về thị trường
3. Effects phải hợp lý với lập trường A/B/C và vai trò
4. KHÔNG có text/emoji tiếng Anh trong lựa chọn
5. influenceDelta và resilienceDelta phải luôn có giá trị (không bỏ trống)

OUTPUT FORMAT: JSON array đúng cấu trúc, KHÔNG có markdown code block, KHÔNG có text giải thích.
[
  {"role":"cong-nhan","choices":[
    {"id":"A","text":"...","effects":{"wealthDelta":...,"controlDelta":...,"influenceDelta":...,"resilienceDelta":...,"allianceDelta":...,"stratificationDelta":...,"productionDelta":...,"innovationDelta":...,"welfareDelta":...,"democracyDelta":...}},
    {"id":"B","text":"...","effects":{...}},
    {"id":"C","text":"...","effects":{...}}
  ]},
  {"role":"nong-dan","choices":[...]},
  {"role":"tri-thuc","choices":[...]},
  {"role":"startup","choices":[...]}
]`

async function generateForScenario(scenario) {
  const userPrompt = `TÌNH HUỐNG: "${scenario.title}"
BỐI CẢNH: ${scenario.context}

Tạo 12 lựa chọn (4 vai trò × 3 choices A/B/C) cho tình huống trên. Trả về JSON.`

  const res = await client.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  })

  const text = res.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response')

  // Parse JSON (strip markdown fences if any)
  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  return JSON.parse(clean)
}

function buildRoleSpecificChoices(genResult) {
  const map = {}
  for (const entry of genResult) {
    map[entry.role] = entry.choices
  }
  // Validate all 4 roles present
  for (const role of ['cong-nhan', 'nong-dan', 'tri-thuc', 'startup']) {
    if (!map[role] || map[role].length !== 3) {
      throw new Error(`Missing or incomplete choices for role: ${role}`)
    }
    // Ensure influenceDelta and resilienceDelta exist
    for (const choice of map[role]) {
      if (choice.effects.influenceDelta === undefined) choice.effects.influenceDelta = 0
      if (choice.effects.resilienceDelta === undefined) choice.effects.resilienceDelta = 0
    }
  }
  return map
}

// Check if already has roleSpecificChoices (resume support)
const pending = scenarios.filter(s => !s.roleSpecificChoices)
if (pending.length === 0) {
  console.log('All scenarios already have roleSpecificChoices! Nothing to do.')
  process.exit(0)
}

console.log(`\nGenerating role-specific choices for ${pending.length}/${scenarios.length} scenarios...`)
console.log(`Concurrency: batches of 20 (25 req/min rate limit)\n`)

const BATCH_SIZE = 20

async function processOne(s, idx) {
  try {
    const result = await generateForScenario(s)
    s.roleSpecificChoices = buildRoleSpecificChoices(result)
    delete s.choices
    console.log(`  [${idx + 1}/${scenarios.length}] "${s.title}" — OK`)
    return true
  } catch (err) {
    console.log(`  [${idx + 1}/${scenarios.length}] "${s.title}" — FAIL: ${err.message}`)
    return false
  }
}

// Process in batches of BATCH_SIZE concurrently
const pendingWithIdx = scenarios.map((s, i) => ({ s, i })).filter(({ s }) => !s.roleSpecificChoices)
let failed = 0

for (let b = 0; b < pendingWithIdx.length; b += BATCH_SIZE) {
  const batch = pendingWithIdx.slice(b, b + BATCH_SIZE)
  console.log(`\n  Batch ${Math.floor(b / BATCH_SIZE) + 1}/${Math.ceil(pendingWithIdx.length / BATCH_SIZE)} (${batch.length} requests)...`)

  const results = await Promise.all(batch.map(({ s, i }) => processOne(s, i)))
  failed += results.filter(r => !r).length

  // Save progress after each batch
  writeFileSync(dataPath, JSON.stringify(scenarios, null, 2), 'utf8')

  // Wait between batches to respect rate limit (5 requests done, wait ~12s for safety)
  if (b + BATCH_SIZE < pendingWithIdx.length) {
    console.log(`  Waiting 12s for rate limit...`)
    await new Promise(r => setTimeout(r, 12000))
  }
}

// Final validation
let totalChoices = 0
for (const s of scenarios) {
  if (!s.roleSpecificChoices) {
    console.error(`\nERROR: Scenario "${s.title}" missing roleSpecificChoices!`)
    process.exit(1)
  }
  for (const role of ['cong-nhan', 'nong-dan', 'tri-thuc', 'startup']) {
    totalChoices += s.roleSpecificChoices[role]?.length || 0
  }
}

writeFileSync(dataPath, JSON.stringify(scenarios, null, 2), 'utf8')
console.log(`\nDone! ${totalChoices} total choices across ${scenarios.length} scenarios. Failed: ${failed}`)
if (failed > 0) console.log('Re-run to retry failed scenarios.')
console.log('Written to data/scenarios.json')
