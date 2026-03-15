import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GameRoom } from '@/types/game'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

const SYSTEM_PROMPT = `Bạn là nhà phân tích xu hướng xã hội cho trò chơi mô phỏng. Dựa trên lịch sử 6 chỉ số vĩ mô qua các vòng, bạn phân tích xu hướng và dự báo.

6 chỉ số: Liên minh (LM), Phân hóa (PH), Sản xuất (SX), Đổi mới (ĐM), Phúc lợi (PL), Dân chủ (DC).

Viết ĐÚNG 2-3 câu ngắn gọn bằng tiếng Việt. KHÔNG dùng emoji. KHÔNG dùng Markdown. Viết văn xuôi thuần túy.
Tập trung vào: xu hướng nổi bật nhất, mối tương quan đáng chú ý, và dự báo ngắn gọn.
TUYỆT ĐỐI KHÔNG viết quá 3 câu.`

/**
 * Tier 2: Trend analysis for host using gemini-3-flash-preview
 * Fire-and-forget after end-scenario, arrives via SSE 2-3s later
 */
export async function generateTrend(room: GameRoom): Promise<string> {
  const macro = room.macro
  if (macro.history.length === 0) return ''

  const historyStr = macro.history
    .map((h, i) => `T${i + 1}: LM=${Math.round(h.alliance)}, PH=${Math.round(h.stratification)}, SX=${Math.round(h.production)}, ĐM=${Math.round(h.innovation)}, PL=${Math.round(h.welfare)}, DC=${Math.round(h.democracy)}`)
    .join('\n')

  const prompt = `LỊCH SỬ CHỈ SỐ VĨ MÔ QUA CÁC VÒNG:
${historyStr}
Hiện tại: LM=${Math.round(macro.alliance)}, PH=${Math.round(macro.stratification)}, SX=${Math.round(macro.production)}, ĐM=${Math.round(macro.innovation)}, PL=${Math.round(macro.welfare)}, DC=${Math.round(macro.democracy)}

Tổng số vòng: ${room.scenarioIds.length}. Đã chơi: ${macro.history.length}/${room.scenarioIds.length}.
Số người chơi: ${room.players.size}.

Phân tích xu hướng và dự báo.`

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 32000,
    },
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
}

/**
 * Tier 2 streaming: generates trend and calls onChunk with accumulated text
 */
export async function streamTrend(
  room: GameRoom,
  onChunk: (accumulated: string) => void,
): Promise<string> {
  const macro = room.macro
  if (macro.history.length === 0) return ''

  const historyStr = macro.history
    .map((h, i) => `T${i + 1}: LM=${Math.round(h.alliance)}, PH=${Math.round(h.stratification)}, SX=${Math.round(h.production)}, ĐM=${Math.round(h.innovation)}, PL=${Math.round(h.welfare)}, DC=${Math.round(h.democracy)}`)
    .join('\n')

  const prompt = `LỊCH SỬ CHỈ SỐ VĨ MÔ QUA CÁC VÒNG:
${historyStr}
Hiện tại: LM=${Math.round(macro.alliance)}, PH=${Math.round(macro.stratification)}, SX=${Math.round(macro.production)}, ĐM=${Math.round(macro.innovation)}, PL=${Math.round(macro.welfare)}, DC=${Math.round(macro.democracy)}

Tổng số vòng: ${room.scenarioIds.length}. Đã chơi: ${macro.history.length}/${room.scenarioIds.length}.
Số người chơi: ${room.players.size}.

Phân tích xu hướng và dự báo.`

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { temperature: 0.6, maxOutputTokens: 32000 },
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
    console.error('Trend stream error:', err)
    return ''
  }
}
