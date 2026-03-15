import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GameRoom, ChoiceBreakdown, RoleBreakdown, MacroDelta, RoleId } from '@/types/game'
import { getScenarioById } from '@/lib/scenarios'
import { ROLES } from '@/lib/roles'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

const SYSTEM_PROMPT = `Bạn là nhà phân tích xã hội học bình luận trò chơi mô phỏng cơ cấu xã hội số.

NHIỆM VỤ: Sau mỗi tình huống, viết ĐÚNG 2 câu INSIGHT sắc bén, ngắn gọn. KHÔNG mô tả lại dữ liệu. KHÔNG nói "nhóm X đã chọn phương án A/B/C".

PHONG CÁCH BẮT BUỘC:
- Phân tích HỆ QUẢ của lựa chọn, không liệt kê lựa chọn
- Dùng ngôn ngữ phân tích xã hội học: "mâu thuẫn giai cấp", "phân hóa cơ cấu", "liên minh bị xói mòn", "lực lượng sản xuất"
- Liên hệ lý luận Chương 5: mâu thuẫn cá nhân vs. tập thể, vai trò liên minh công–nông–trí thức

VÍ DỤ TỐT (2 câu):
"Sự phân tách lợi ích giữa nhóm nắm tư liệu sản xuất số và người lao động nền tảng đang đẩy chỉ số phân hóa lên ngưỡng cảnh báo. Nhóm Trí thức đứng giữa hai chiến tuyến, và lựa chọn của họ ở vòng tới sẽ quyết định liên minh nghiêng về phía nào."

TUYỆT ĐỐI CHỈ VIẾT 2 CÂU. Không viết 3 câu trở lên.
6 chỉ số vĩ mô: Liên minh (LM), Phân hóa (PH), Sản xuất (SX), Đổi mới (ĐM), Phúc lợi (PL), Dân chủ (DC).
Viết bằng tiếng Việt. KHÔNG dùng emoji. KHÔNG dùng ký hiệu A/B/C. KHÔNG dùng Markdown. Viết văn xuôi thuần túy.`

/**
 * Tier 1: Enhanced per-round commentary using gemini-2.0-flash
 * Includes role breakdown for class-specific analysis
 */
export async function generateCommentary(
  room: GameRoom,
  scenarioIndex: number,
  breakdown: ChoiceBreakdown,
  roleBreakdown?: RoleBreakdown[],
  macroDelta?: MacroDelta,
): Promise<string> {
  const prompt = buildPrompt(room, scenarioIndex, breakdown, roleBreakdown, macroDelta)
  if (!prompt) return ''

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 400,
    },
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
}

const ROLE_IDS: RoleId[] = ['cong-nhan', 'nong-dan', 'tri-thuc', 'startup']

/** Build the prompt with choice descriptions for context */
function buildPrompt(
  room: GameRoom,
  scenarioIndex: number,
  breakdown: ChoiceBreakdown,
  roleBreakdown?: RoleBreakdown[],
  macroDelta?: MacroDelta,
): string | null {
  const scenarioId = room.scenarioIds[scenarioIndex]
  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined
  if (!scenario) return null

  const pctA = breakdown.total > 0 ? Math.round((breakdown.A / breakdown.total) * 100) : 0
  const pctB = breakdown.total > 0 ? Math.round((breakdown.B / breakdown.total) * 100) : 0
  const pctC = breakdown.total > 0 ? Math.round((breakdown.C / breakdown.total) * 100) : 0
  const macro = room.macro

  // Build rich role breakdown with actual choice descriptions
  const roleLines = ROLE_IDS.map((rid) => {
    const role = ROLES[rid]
    const rb = roleBreakdown?.find((r) => r.roleId === rid)
    const choices = scenario.roleSpecificChoices[rid]
    const [choiceA, choiceB, choiceC] = choices

    // Find dominant choice for this role
    const dominant = rb && rb.total > 0
      ? (['A', 'B', 'C'] as const).reduce((best, opt) => rb[opt] > rb[best] ? opt : best, 'A' as 'A'|'B'|'C')
      : null
    const dominantText = dominant === 'A' ? choiceA.text : dominant === 'B' ? choiceB.text : dominant === 'C' ? choiceC.text : ''
    const dominantCount = dominant && rb ? rb[dominant] : 0
    const totalCount = rb?.total ?? 0

    return `${role.name} (${totalCount} người): Đa số chọn "${dominantText}" (${dominantCount}/${totalCount}).
  Ba lựa chọn: "${choiceA.text}" / "${choiceB.text}" / "${choiceC.text}"`
  }).join('\n')

  // Macro delta summary
  const deltaLines = macroDelta
    ? [
        { key: 'alliance', label: 'Liên minh', val: macroDelta.alliance },
        { key: 'stratification', label: 'Phân hóa', val: macroDelta.stratification },
        { key: 'production', label: 'Sản xuất', val: macroDelta.production },
        { key: 'innovation', label: 'Đổi mới', val: macroDelta.innovation },
        { key: 'welfare', label: 'Phúc lợi', val: macroDelta.welfare },
        { key: 'democracy', label: 'Dân chủ', val: macroDelta.democracy },
      ]
        .filter((d) => Math.abs(d.val) >= 0.5)
        .map((d) => `${d.label}: ${d.val > 0 ? '+' : ''}${d.val.toFixed(1)}`)
        .join(', ')
    : ''

  // Find the biggest macro change
  const biggestChange = macroDelta
    ? [
        { label: 'Liên minh', val: macroDelta.alliance },
        { label: 'Phân hóa', val: macroDelta.stratification },
        { label: 'Sản xuất', val: macroDelta.production },
        { label: 'Đổi mới', val: macroDelta.innovation },
        { label: 'Phúc lợi', val: macroDelta.welfare },
        { label: 'Dân chủ', val: macroDelta.democracy },
      ].sort((a, b) => Math.abs(b.val) - Math.abs(a.val))[0]
    : null

  return `BỐI CẢNH: "${scenario.title}" — ${scenario.context}

HÀNH VI TỪNG GIAI CẤP (${breakdown.total} người tham gia):
${roleLines}

TỔNG: Tư bản hóa=${breakdown.A} (${pctA}%) | Tập thể=${breakdown.B} (${pctB}%) | Thỏa hiệp=${breakdown.C} (${pctC}%)

BIẾN ĐỘNG CHỈ SỐ: ${deltaLines || 'Không đáng kể'}
${biggestChange ? `CHỈ SỐ BIẾN ĐỘNG MẠNH NHẤT: ${biggestChange.label} (${biggestChange.val > 0 ? '+' : ''}${biggestChange.val.toFixed(1)})` : ''}
TRẠNG THÁI XÃ HỘI: LM=${Math.round(macro.alliance)}, PH=${Math.round(macro.stratification)}, SX=${Math.round(macro.production)}, ĐM=${Math.round(macro.innovation)}, PL=${Math.round(macro.welfare)}, DC=${Math.round(macro.democracy)}.
Vòng ${scenarioIndex + 1}/${room.scenarioIds.length}.

Viết 3-4 câu INSIGHT: phân tích mâu thuẫn lợi ích giữa các giai cấp, hệ quả cơ cấu xã hội, và dự đoán xu hướng. KHÔNG liệt kê lại dữ liệu.`
}

/**
 * Tier 1 streaming: generates commentary and calls onChunk with accumulated text
 */
export async function streamCommentary(
  room: GameRoom,
  scenarioIndex: number,
  breakdown: ChoiceBreakdown,
  onChunk: (accumulated: string) => void,
  roleBreakdown?: RoleBreakdown[],
  macroDelta?: MacroDelta,
): Promise<string> {
  const prompt = buildPrompt(room, scenarioIndex, breakdown, roleBreakdown, macroDelta)
  if (!prompt) return ''

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { temperature: 0.8, maxOutputTokens: 32000 },
  })

  try {
    const stream = await model.generateContentStream(prompt)
    let accumulated = ''
    for await (const chunk of stream.stream) {
      const text = chunk.text()
      if (text) {
        accumulated += text
        onChunk(accumulated)
      }
    }
    return accumulated
  } catch (err) {
    console.error('Commentary stream error:', err)
    // If we have partial text, return it
    return ''
  }
}
