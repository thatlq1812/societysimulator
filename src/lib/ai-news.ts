import Anthropic from '@anthropic-ai/sdk'
import type { MacroState, OutcomeId, GameRoom, ChoiceId } from '@/types/game'
import { SCENARIOS } from '@/lib/scenarios'
import { ROLES } from '@/lib/roles'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Bạn là một nhà phân tích xã hội học của Viện Nghiên cứu Xã hội Việt Nam năm 2030. Bạn được giao nhiệm vụ viết "Bản tin Xã hội 2030" — một bản tổng hợp học thuật về hình thái xã hội mà lớp học vừa tạo ra thông qua quyết định tập thể.

Nền tảng lý luận của bạn là Chủ nghĩa Xã hội Khoa học, đặc biệt Chương 5: Cơ cấu xã hội – giai cấp và liên minh giai cấp, tầng lớp trong thời kỳ quá độ lên chủ nghĩa xã hội (Giáo trình Bộ GD&ĐT 2021).

Các khái niệm cốt lõi bạn phải áp dụng:
- Mâu thuẫn lợi ích cá nhân vs. lợi ích giai cấp
- Liên minh công–nông–trí thức như điều kiện sống còn của phát triển bền vững
- Quan hệ sở hữu tư liệu sản xuất trong kinh tế số
- Chỉ số phân hóa xã hội và ổn định cơ cấu
- Vai trò lịch sử của từng giai cấp/tầng lớp trong thời kỳ quá độ

Phong cách viết: Chuyên nghiệp, học thuật nhưng sinh động. Viết bằng tiếng Việt. Độ dài 350-450 từ.

QUAN TRỌNG: Không phán xét đạo đức cá nhân. Phân tích hệ quả của cấu trúc, không phải ý định cá nhân. Kết thúc với một câu kết nối sang lý luận Mác–Lênin thế kỷ XIX.`

interface SummaryInput {
  macro: MacroState
  outcome: OutcomeId
  room: GameRoom
}

function buildChoiceStats(room: GameRoom): string {
  const stats: string[] = []

  for (const scenario of SCENARIOS) {
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
- Kịch bản kết thúc: ${outcomes[outcome]}

CƠ CẤU NGƯỜI CHƠI:
${buildRoleStats(room)}

PHÂN BỐ LỰA CHỌN THEO TÌNH HUỐNG:
${buildChoiceStats(room)}

Hãy viết Bản tin Xã hội 2030 dựa trên dữ liệu trên. Phân tích hệ quả cơ cấu xã hội của những lựa chọn này theo lý luận Chương 5. Đây là dữ liệu từ hành vi thực tế của lớp học — hãy phản ánh trung thực kết quả đó.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 700,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = message.content.find((b) => b.type === 'text')?.text ?? ''
  return (
    text +
    '\n\n*Bản tin được tổng hợp bởi AI từ dữ liệu hành vi tập thể của lớp, phục vụ mục đích học thuật. Nội dung phản ánh hành động của người tham gia, không phải phán xét cá nhân.*'
  )
}
