import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GameRoom, ChoiceBreakdown, RoleBreakdown, MacroDelta } from '@/types/game'
import { getScenarioById } from '@/lib/scenarios'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

const SYSTEM_PROMPT = `Bạn là một bình luận viên xã hội học cho trò chơi mô phỏng xã hội số. Sau mỗi tình huống, bạn bình luận ngắn gọn (3-4 câu) về kết quả lựa chọn tập thể.

Phong cách: Sinh động, có insight, liên hệ với lý luận Chương 5 (cơ cấu xã hội – giai cấp). Viết bằng tiếng Việt. KHÔNG dùng emoji.

6 chỉ số vĩ mô: Liên minh (LM), Phân hóa (PH), Sản xuất (SX), Đổi mới Công nghệ (ĐM), Phúc lợi Xã hội (PL), Dân chủ & Minh bạch (DC).

Cấu trúc nhận xét (3-4 câu):
1. Nhận xét cụ thể về nhóm vai trò nào (Công nhân, Nông dân, Trí thức, Startup) đã chọn gì — có sự đồng thuận hay phân tách giai cấp?
2. Phân tích chỉ số nào thay đổi mạnh nhất và ý nghĩa cơ cấu xã hội của điều đó
3. Liên hệ với lý luận giai cấp Chương 5 (mâu thuẫn lợi ích cá nhân vs. tập thể, liên minh công–nông–trí thức)
4. Dự đoán hệ quả cho tình trạng xã hội ở các vòng tiếp theo

Quy tắc bổ sung:
- Đề cập tên cụ thể của nhóm vai trò khi nói về xu hướng lựa chọn
- Nếu một nhóm chọn khác với các nhóm còn lại: nhận xét về sự phân tách giai cấp
- Nếu phần lớn chọn A: nhận xét về xu hướng cá nhân chủ nghĩa, phân hóa gia tăng
- Nếu phần lớn chọn B: nhận xét về tinh thần đoàn kết, liên minh giai cấp được củng cố
- Nếu phân tán: nhận xét về mâu thuẫn nội bộ trong cấu trúc xã hội`

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
  const scenarioId = room.scenarioIds[scenarioIndex]
  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined
  if (!scenario) return ''

  const pctA = breakdown.total > 0 ? Math.round((breakdown.A / breakdown.total) * 100) : 0
  const pctB = breakdown.total > 0 ? Math.round((breakdown.B / breakdown.total) * 100) : 0
  const pctC = breakdown.total > 0 ? Math.round((breakdown.C / breakdown.total) * 100) : 0

  const macro = room.macro

  // Role breakdown summary
  const roleLines = roleBreakdown && roleBreakdown.length > 0
    ? roleBreakdown.map((rb) => {
        const dominant = rb.total > 0
          ? (['A', 'B', 'C'] as const).reduce((best, opt) => rb[opt] > rb[best] ? opt : best, 'A' as 'A'|'B'|'C')
          : null
        return `${rb.roleName}: A=${rb.A}/${rb.total}, B=${rb.B}/${rb.total}, C=${rb.C}/${rb.total}${dominant ? ` (xu hướng ${dominant})` : ''}`
      }).join('\n')
    : 'Không có dữ liệu phân vai'

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

  const prompt = `Tình huống "${scenario.title}": ${scenario.context}

KẾT QUẢ TỔNG: A=${breakdown.A} (${pctA}%), B=${breakdown.B} (${pctB}%), C=${breakdown.C} (${pctC}%) — Tổng ${breakdown.total} người.

PHÂN BỐ THEO NHÓM XÃ HỘI:
${roleLines}

THAY ĐỔI CHỈ SỐ VÒNG NÀY: ${deltaLines || 'Không đáng kể'}
CHỈ SỐ HIỆN TẠI: LM=${Math.round(macro.alliance)}, PH=${Math.round(macro.stratification)}, SX=${Math.round(macro.production)}, ĐM=${Math.round(macro.innovation)}, PL=${Math.round(macro.welfare)}, DC=${Math.round(macro.democracy)}.
Đây là tình huống ${scenarioIndex + 1}/${room.scenarioIds.length}.

Bình luận 3-4 câu: nhận xét lựa chọn cụ thể của từng nhóm vai trò, chỉ số thay đổi mạnh nhất, và dự đoán hệ quả.`

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.0-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 400,
    },
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
}
