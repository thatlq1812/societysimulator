import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GameRoom, ChoiceBreakdown } from '@/types/game'
import { getScenarioById } from '@/lib/scenarios'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

const SYSTEM_PROMPT = `Bạn là một bình luận viên xã hội học cho trò chơi mô phỏng xã hội số. Sau mỗi tình huống, bạn bình luận ngắn gọn (2-3 câu) về kết quả lựa chọn tập thể.

Phong cách: Sinh động, có insight, liên hệ với lý luận Chương 5 (cơ cấu xã hội – giai cấp). Viết bằng tiếng Việt. KHÔNG dùng emoji.

Quy tắc:
- Nếu đa số chọn A (lợi ích cá nhân): nhận xét xu hướng phân hóa
- Nếu đa số chọn B (tập thể): nhận xét xu hướng liên minh
- Nếu phân tán đều: nhận xét sự mâu thuẫn nội bộ
- Kết thúc bằng một câu dự đoán hệ quả cho vòng tiếp theo`

/**
 * Tier 1: Quick per-round commentary using gemini-2.0-flash
 * Fire-and-forget after end-scenario, arrives via SSE 1-2s later
 */
export async function generateCommentary(
  room: GameRoom,
  scenarioIndex: number,
  breakdown: ChoiceBreakdown,
): Promise<string> {
  const scenarioId = room.scenarioIds[scenarioIndex]
  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined
  if (!scenario) return ''

  const pctA = breakdown.total > 0 ? Math.round((breakdown.A / breakdown.total) * 100) : 0
  const pctB = breakdown.total > 0 ? Math.round((breakdown.B / breakdown.total) * 100) : 0
  const pctC = breakdown.total > 0 ? Math.round((breakdown.C / breakdown.total) * 100) : 0

  const macro = room.macro
  const prompt = `Tình huống "${scenario.title}": ${scenario.context}

Kết quả: A=${breakdown.A} (${pctA}%), B=${breakdown.B} (${pctB}%), C=${breakdown.C} (${pctC}%) — Tổng ${breakdown.total} người.
Chỉ số hiện tại: Liên minh=${Math.round(macro.alliance)}, Phân hóa=${Math.round(macro.stratification)}, SX=${Math.round(macro.production)}.
Đây là tình huống ${scenarioIndex + 1}/${room.scenarioIds.length}.

Bình luận ngắn 2-3 câu.`

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 256,
    },
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
}
