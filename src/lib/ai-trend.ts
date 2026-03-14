import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GameRoom } from '@/types/game'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

const SYSTEM_PROMPT = `Bạn là nhà phân tích xu hướng xã hội cho trò chơi mô phỏng. Dựa trên lịch sử 6 chỉ số vĩ mô qua các vòng, bạn phân tích xu hướng và dự báo.

6 chỉ số: Liên minh (LM), Phân hóa (PH), Sản xuất (SX), Đổi mới (ĐM), Phúc lợi (PL), Dân chủ (DC).

Viết 3-5 câu bằng tiếng Việt. KHÔNG dùng emoji. Phong cách: Phân tích dữ liệu, nhận diện pattern.

Nội dung cần có:
1. Xu hướng chính (tăng/giảm/ổn định) của 6 chỉ số
2. Mối tương quan giữa các cặp chỉ số (LM–DC, SX–ĐM, PL–PH)
3. Dự báo kịch bản kết thúc nếu xu hướng tiếp tục`

/**
 * Tier 2: Trend analysis for host using gemini-2.5-flash
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
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 640,
    },
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
}
