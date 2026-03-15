import { GoogleGenerativeAI } from '@google/generative-ai'
import type { MacroState, OutcomeId, GameRoom, ChoiceId } from '@/types/game'
import { getScenarioById } from '@/lib/scenarios'
import { ROLES } from '@/lib/roles'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

const SYSTEM_PROMPT = `Bạn là một nhà phân tích xã hội học chuyên về chuyển đổi số. Bạn được giao nhiệm vụ viết "Bản tin Xã hội Số" — một bản tổng hợp học thuật về hình thái xã hội mà lớp học vừa tạo ra thông qua quyết định tập thể trong kỷ nguyên chuyển đổi số.

Nền tảng lý luận của bạn là Chủ nghĩa Xã hội Khoa học, đặc biệt Chương 5: Cơ cấu xã hội – giai cấp và liên minh giai cấp, tầng lớp trong thời kỳ quá độ lên chủ nghĩa xã hội (Giáo trình Bộ GD&ĐT 2021).

Các khái niệm cốt lõi bạn phải áp dụng:
- Mâu thuẫn lợi ích cá nhân vs. lợi ích giai cấp
- Liên minh công–nông–trí thức như điều kiện sống còn của phát triển bền vững
- Quan hệ sở hữu tư liệu sản xuất trong kinh tế số
- Chỉ số phân hóa xã hội và ổn định cơ cấu
- Vai trò lịch sử của từng giai cấp/tầng lớp trong thời kỳ quá độ
- Đổi mới công nghệ như động lực phát triển lực lượng sản xuất
- Phúc lợi xã hội như thước đo tiến bộ xã hội chủ nghĩa
- Dân chủ và minh bạch trong quản trị xã hội số

Phong cách viết: Chuyên nghiệp, học thuật nhưng sinh động. Viết bằng tiếng Việt. Viết đúng 5 câu, mỗi câu có chiều sâu phân tích. Ngắn gọn, súc tích, tập trung vào insight chính.

QUAN TRỌNG:
- VIẾT ĐÚNG 5 CÂU. Không hơn, không kém. Mỗi câu phải hoàn chỉnh và có ý nghĩa phân tích riêng.
- TUYỆT ĐỐI KHÔNG dùng định dạng Markdown (**, ***, #, ##, -, danh sách). Chỉ viết văn xuôi thuần túy, chia đoạn bằng xuống dòng.
- Không phán xét đạo đức cá nhân. Phân tích hệ quả của cấu trúc, không phải ý định cá nhân.
- Kết thúc với một câu kết nối sang lý luận Mác–Lênin thế kỷ XIX.`

interface SummaryInput {
  macro: MacroState
  outcome: OutcomeId
  room: GameRoom
}

function buildChoiceStats(room: GameRoom): string {
  const stats: string[] = []

  for (const scenarioId of room.scenarioIds) {
    const scenario = getScenarioById(scenarioId)
    if (!scenario) continue
    const choices = { A: 0, B: 0, C: 0 }
    for (const player of room.players.values()) {
      const choice = player.choices[scenario.id] as ChoiceId | undefined
      if (choice && choices[choice] !== undefined) {
        choices[choice]++
      }
    }
    const total = choices.A + choices.B + choices.C
    if (total === 0) continue
    stats.push(
      `"${scenario.title}": A=${choices.A}/${total} (${Math.round((choices.A/total)*100)}%), B=${choices.B}/${total} (${Math.round((choices.B/total)*100)}%), C=${choices.C}/${total} (${Math.round((choices.C/total)*100)}%)`,
    )
  }

  return stats.join('\n')
}

function buildRoleStats(room: GameRoom): string {
  const roleCount: Record<string, number> = {}
  for (const player of room.players.values()) {
    roleCount[player.roleId] = (roleCount[player.roleId] ?? 0) + 1
  }
  return Object.entries(roleCount)
    .map(([rid, count]) => `${ROLES[rid as keyof typeof ROLES]?.name ?? rid}: ${count} người`)
    .join(', ')
}

export async function generateSocialNews(input: SummaryInput): Promise<string> {
  const { macro, outcome, room } = input

  const outcomes: Record<OutcomeId, string> = {
    'ben-vung': 'Chuyển đổi số Bền vững — Phân hóa thấp, Liên minh mạnh',
    'dut-gay': 'Đứt gãy Cơ cấu — Phân hóa cao nguy hiểm, Liên minh sụp đổ',
    'trung-tinh': 'Trạng thái Bất ổn — Xã hội chưa tìm được hướng đi',
  }

  const userMessage = `DỮ LIỆU HÀNH VI TẬP THỂ — LỚP ${room.players.size} SINH VIÊN

KẾT QUẢ VĨ MÔ CUỐI CỦA XÃ HỘI GIẢ LẬP:
- Chỉ số Liên minh Công–Nông–Trí thức: ${Math.round(macro.alliance)}/100
- Chỉ số Phân hóa Xã hội: ${Math.round(macro.stratification)}/100
- Lực lượng Sản xuất Quốc gia: ${Math.round(macro.production)}/100
- Chỉ số Đổi mới Công nghệ: ${Math.round(macro.innovation)}/100
- Chỉ số Phúc lợi Xã hội: ${Math.round(macro.welfare)}/100
- Chỉ số Dân chủ & Minh bạch: ${Math.round(macro.democracy)}/100
- Kịch bản kết thúc: ${outcomes[outcome]}

CƠ CẤU NGƯỜI CHƠI:
${buildRoleStats(room)}

PHÂN BỐ LỰA CHỌN THEO TÌNH HUỐNG:
${buildChoiceStats(room)}

Hãy viết Bản tin Xã hội Số dựa trên dữ liệu trên. Phân tích hệ quả cơ cấu xã hội của những lựa chọn này theo lý luận Chương 5. Viết đúng 5 câu. Đây là dữ liệu từ hành vi thực tế của lớp học — hãy phản ánh trung thực kết quả đó.`

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 32000,
      topP: 0.9,
    },
  })

  const result = await model.generateContent(userMessage)
  const text = result.response.text()

  return (
    text +
    '\n\n*Bản tin được tổng hợp bởi AI từ dữ liệu hành vi tập thể của lớp, phục vụ mục đích học thuật. Nội dung phản ánh hành động của người tham gia, không phải phán xét cá nhân.*'
  )
}

const DISCLAIMER = '\n\n*Bản tin được tổng hợp bởi AI từ dữ liệu hành vi tập thể của lớp, phục vụ mục đích học thuật. Nội dung phản ánh hành động của người tham gia, không phải phán xét cá nhân.*'

/**
 * Tier 3 streaming: generates social news and calls onChunk with accumulated text
 */
export async function streamSocialNews(
  input: SummaryInput,
  onChunk: (accumulated: string) => void,
): Promise<string> {
  const { macro, outcome, room } = input

  const outcomes: Record<OutcomeId, string> = {
    'ben-vung': 'Chuyển đổi số Bền vững — Phân hóa thấp, Liên minh mạnh',
    'dut-gay': 'Đứt gãy Cơ cấu — Phân hóa cao nguy hiểm, Liên minh sụp đổ',
    'trung-tinh': 'Trạng thái Bất ổn — Xã hội chưa tìm được hướng đi',
  }

  const userMessage = `DỮ LIỆU HÀNH VI TẬP THỂ — LỚP ${room.players.size} SINH VIÊN

KẾT QUẢ VĨ MÔ CUỐI CỦA XÃ HỘI GIẢ LẬP:
- Chỉ số Liên minh Công–Nông–Trí thức: ${Math.round(macro.alliance)}/100
- Chỉ số Phân hóa Xã hội: ${Math.round(macro.stratification)}/100
- Lực lượng Sản xuất Quốc gia: ${Math.round(macro.production)}/100
- Chỉ số Đổi mới Công nghệ: ${Math.round(macro.innovation)}/100
- Chỉ số Phúc lợi Xã hội: ${Math.round(macro.welfare)}/100
- Chỉ số Dân chủ & Minh bạch: ${Math.round(macro.democracy)}/100
- Kịch bản kết thúc: ${outcomes[outcome]}

CƠ CẤU NGƯỜI CHƠI:
${buildRoleStats(room)}

PHÂN BỐ LỰA CHỌN THEO TÌNH HUỐNG:
${buildChoiceStats(room)}

Hãy viết Bản tin Xã hội Số dựa trên dữ liệu trên. Phân tích hệ quả cơ cấu xã hội của những lựa chọn này theo lý luận Chương 5. Viết đúng 5 câu. Đây là dữ liệu từ hành vi thực tế của lớp học — hãy phản ánh trung thực kết quả đó.`

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { temperature: 0.7, maxOutputTokens: 32000, topP: 0.9 },
  })

  const stream = await model.generateContentStream(userMessage)
  let accumulated = ''
  for await (const chunk of stream.stream) {
    accumulated += chunk.text()
    onChunk(accumulated)
  }
  return accumulated + DISCLAIMER
}
