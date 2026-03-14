import type { Scenario } from '@/types/game'

export const SCENARIOS: Scenario[] = [
  // ─── Scenario 1: Cú sốc Tự động hóa ─────────────────────────────────────
  {
    id: 'tu-dong-hoa',
    title: 'Cú sốc Tự động hóa',
    context:
      'Năm 2026. AI và robotics thay thế 40% nhân sự cơ bản tại các khu công nghiệp và nền tảng giao hàng. Bạn là người điều hành một startup logistics — quyết định của bạn ảnh hưởng đến hàng trăm lao động.',
    choices: [
      {
        id: 'A',
        text: 'Sa thải hàng loạt, triển khai AI toàn bộ — lợi nhuận tăng 60% ngay lập tức',
        effects: { wealthDelta: 20, controlDelta: 8, allianceDelta: -10, stratificationDelta: 15, productionDelta: 5, innovationDelta: 8, welfareDelta: -12, democracyDelta: -5 },
      },
      {
        id: 'B',
        text: 'Tái đào tạo nhân sự hiện tại để vận hành hệ thống AI — tốn chi phí nhưng giữ đội ngũ',
        effects: { wealthDelta: 5, controlDelta: 4, allianceDelta: 8, stratificationDelta: -3, productionDelta: 10, innovationDelta: 12, welfareDelta: 8, democracyDelta: 5 },
      },
      {
        id: 'C',
        text: 'Liên kết với các startup khác lập quỹ chuyển đổi nghề — hi sinh tăng trưởng cá nhân',
        effects: { wealthDelta: -5, controlDelta: 2, allianceDelta: 20, stratificationDelta: -10, productionDelta: 8, innovationDelta: 6, welfareDelta: 15, democracyDelta: 10 },
      },
    ],
  },

  // ─── Scenario 2: Độc quyền Dữ liệu ─────────────────────────────────────
  {
    id: 'doc-quyen-du-lieu',
    title: 'Độc quyền Dữ liệu',
    context:
      'Tập đoàn công nghệ nước ngoài đề nghị mua toàn bộ dữ liệu người dùng nông nghiệp mà bạn (Nông dân 4.0) đã thu thập trong 3 năm. Giá đề nghị rất hấp dẫn — đủ để mở rộng trang trại gấp đôi.',
    choices: [
      {
        id: 'A',
        text: 'Bán toàn bộ dữ liệu — thu về số tiền lớn để đầu tư mở rộng trang trại cá nhân',
        effects: { wealthDelta: 18, controlDelta: -15, allianceDelta: -8, stratificationDelta: 10, productionDelta: 2, innovationDelta: -5, welfareDelta: -8, democracyDelta: -10 },
      },
      {
        id: 'B',
        text: 'Từ chối bán, tự xây nền tảng hợp tác xã số với các nông dân khác trong vùng',
        effects: { wealthDelta: -5, controlDelta: 20, allianceDelta: 15, stratificationDelta: -8, productionDelta: 12, innovationDelta: 10, welfareDelta: 12, democracyDelta: 15 },
      },
      {
        id: 'C',
        text: 'Bán một phần dữ liệu phi nhạy cảm, giữ lại dữ liệu sản xuất cốt lõi',
        effects: { wealthDelta: 8, controlDelta: 5, allianceDelta: 3, stratificationDelta: 3, productionDelta: 5, innovationDelta: 5, welfareDelta: 3, democracyDelta: 3 },
      },
    ],
  },

  // ─── Scenario 3: Bằng sáng chế vs. Mã nguồn Mở ──────────────────────
  {
    id: 'bang-sang-che',
    title: 'Bằng sáng chế vs. Mã nguồn Mở',
    context:
      'Bạn (Trí thức Công nghệ) vừa hoàn thành một thuật toán AI có thể tối ưu hóa chuỗi cung ứng nông nghiệp, tiết kiệm 30% chi phí logistics. Bây giờ phải quyết định cách phân phối.',
    choices: [
      {
        id: 'A',
        text: 'Đăng ký bằng sáng chế và bán license — thu nhập thụ động, tối đa hóa lợi ích cá nhân',
        effects: { wealthDelta: 15, controlDelta: 18, allianceDelta: -8, stratificationDelta: 8, productionDelta: 3, innovationDelta: 5, welfareDelta: -5, democracyDelta: -8 },
      },
      {
        id: 'B',
        text: 'Công bố mã nguồn mở hoàn toàn — tri thức là tài sản chung của xã hội',
        effects: { wealthDelta: -3, controlDelta: -5, allianceDelta: 18, stratificationDelta: -12, productionDelta: 15, innovationDelta: 18, welfareDelta: 10, democracyDelta: 12 },
      },
      {
        id: 'C',
        text: 'Thành lập hợp tác xã công nghệ — chia sẻ quyền sở hữu với các thành viên đóng góp',
        effects: { wealthDelta: 5, controlDelta: 8, allianceDelta: 12, stratificationDelta: -5, productionDelta: 10, innovationDelta: 12, welfareDelta: 5, democracyDelta: 8 },
      },
    ],
  },

  // ─── Scenario 4: Cuộc đình công Gig ─────────────────────────────────
  {
    id: 'dinh-cong-gig',
    title: 'Cuộc đình công Gig',
    context:
      'Chính phủ đề xuất luật mới: các nền tảng gig phải đóng bảo hiểm xã hội cho tài xế và shipper. Là công nhân nền tảng, bạn cần quyết định có tham gia phong trào vận động không.',
    choices: [
      {
        id: 'A',
        text: 'Không tham gia — sợ bị đưa vào danh sách đen của app, ưu tiên thu nhập ngắn hạn',
        effects: { wealthDelta: 5, controlDelta: -8, allianceDelta: -12, stratificationDelta: 8, productionDelta: 0, innovationDelta: 0, welfareDelta: -10, democracyDelta: -15 },
      },
      {
        id: 'B',
        text: 'Tổ chức và dẫn đầu phong trào vận động — chấp nhận rủi ro vì quyền lợi tập thể lâu dài',
        effects: { wealthDelta: -8, controlDelta: 15, allianceDelta: 20, stratificationDelta: -10, productionDelta: 5, innovationDelta: 3, welfareDelta: 12, democracyDelta: 20 },
      },
      {
        id: 'C',
        text: 'Ký kiến nghị trực tuyến và chia sẻ thông tin — hành động vừa đủ để không bị hệ quả',
        effects: { wealthDelta: 0, controlDelta: 5, allianceDelta: 8, stratificationDelta: -3, productionDelta: 2, innovationDelta: 2, welfareDelta: 5, democracyDelta: 8 },
      },
    ],
  },

  // ─── Scenario 5: Mua lại Startup ─────────────────────────────────────
  {
    id: 'mua-lai-startup',
    title: 'Đề nghị Mua lại',
    context:
      'Tập đoàn Big Tech định giá startup của bạn ở mức 50 triệu USD — gấp 10 lần vòng gọi vốn gần nhất. Chấp nhận đồng nghĩa với việc nền tảng sẽ tích hợp vào hệ sinh thái độc quyền của tập đoàn.',
    choices: [
      {
        id: 'A',
        text: 'Chấp nhận mua lại — số tiền đủ để tất cả founder sống thoải mái và khởi nghiệp lại',
        effects: { wealthDelta: 22, controlDelta: -20, allianceDelta: -10, stratificationDelta: 15, productionDelta: -3, innovationDelta: -8, welfareDelta: -5, democracyDelta: -8 },
      },
      {
        id: 'B',
        text: 'Từ chối, phát triển độc lập theo mô hình hợp tác xã kỹ thuật số có người dùng sở hữu cổ phần',
        effects: { wealthDelta: -5, controlDelta: 15, allianceDelta: 15, stratificationDelta: -8, productionDelta: 10, innovationDelta: 10, welfareDelta: 8, democracyDelta: 12 },
      },
      {
        id: 'C',
        text: 'Đàm phán mô hình đối tác chiến lược — giữ quyền kiểm soát, nhận đầu tư có điều kiện',
        effects: { wealthDelta: 12, controlDelta: 8, allianceDelta: 5, stratificationDelta: 5, productionDelta: 6, innovationDelta: 5, welfareDelta: 3, democracyDelta: 3 },
      },
    ],
  },

  // ─── Scenario 6: Hạ tầng Số Nông thôn ───────────────────────────────
  {
    id: 'ha-tang-nong-thon',
    title: 'Khoảng cách Số',
    context:
      'Nhà nước công bố chương trình đầu tư hạ tầng internet tốc độ cao cho 500 xã vùng sâu. Chương trình cần đóng góp từ doanh nghiệp công nghệ. Bạn có nguồn lực để quyết định.',
    choices: [
      {
        id: 'A',
        text: 'Không tham gia — ưu tiên mở rộng thị trường đô thị có ROI cao hơn',
        effects: { wealthDelta: 10, controlDelta: 5, allianceDelta: -10, stratificationDelta: 12, productionDelta: -2, innovationDelta: 3, welfareDelta: -10, democracyDelta: -5 },
      },
      {
        id: 'B',
        text: 'Đầu tư đáng kể vào hạ tầng nông thôn — mở rộng thị trường + thu hẹp khoảng cách số',
        effects: { wealthDelta: -2, controlDelta: 3, allianceDelta: 18, stratificationDelta: -12, productionDelta: 15, innovationDelta: 8, welfareDelta: 18, democracyDelta: 10 },
      },
      {
        id: 'C',
        text: 'Đóng góp kỹ thuật và nhân lực (không phải tiền) — chia sẻ tri thức xây dựng năng lực địa phương',
        effects: { wealthDelta: 2, controlDelta: 6, allianceDelta: 12, stratificationDelta: -6, productionDelta: 10, innovationDelta: 10, welfareDelta: 12, democracyDelta: 8 },
      },
    ],
  },

  // ─── Scenario 7: Chia sẻ Nền tảng Số ────────────────────────────────
  {
    id: 'chia-se-nen-tang',
    title: 'Chia sẻ Nền tảng Số',
    context:
      'Một nền tảng thương mại điện tử mới nổi cho phép nông dân bán trực tiếp đến người tiêu dùng, bỏ qua trung gian. Tuy nhiên, nền tảng đang tính phí hoa hồng cao dần. Bạn là người quản lý nền tảng.',
    choices: [
      {
        id: 'A',
        text: 'Tăng hoa hồng lên 25% — tối đa hóa doanh thu nền tảng, mặc kệ nông dân phản đối',
        effects: { wealthDelta: 18, controlDelta: 12, allianceDelta: -15, stratificationDelta: 12, productionDelta: -3, innovationDelta: -3, welfareDelta: -12, democracyDelta: -10 },
      },
      {
        id: 'B',
        text: 'Chuyển sang mô hình hợp tác xã — nông dân đồng sở hữu nền tảng, chia lợi nhuận',
        effects: { wealthDelta: -3, controlDelta: -8, allianceDelta: 20, stratificationDelta: -10, productionDelta: 12, innovationDelta: 5, welfareDelta: 15, democracyDelta: 18 },
      },
      {
        id: 'C',
        text: 'Giữ hoa hồng 10% cố định, đầu tư lợi nhuận vào đào tạo kỹ năng số cho nông dân',
        effects: { wealthDelta: 5, controlDelta: 5, allianceDelta: 10, stratificationDelta: -5, productionDelta: 8, innovationDelta: 8, welfareDelta: 10, democracyDelta: 8 },
      },
    ],
  },

  // ─── Scenario 8: Khủng hoảng Nhà ở ────────────────────────────────
  {
    id: 'khung-hoang-nha-o',
    title: 'Khủng hoảng Nhà ở',
    context:
      'Giá bất động sản tại các thành phố lớn tăng 300% trong 5 năm. Công nhân và trí thức trẻ không thể mua nhà. Chính phủ đề xuất đánh thuế bất động sản thứ hai trở lên để xây nhà ở xã hội.',
    choices: [
      {
        id: 'A',
        text: 'Phản đối thuế — bảo vệ quyền sở hữu tài sản cá nhân và tự do thị trường',
        effects: { wealthDelta: 12, controlDelta: 8, allianceDelta: -12, stratificationDelta: 15, productionDelta: 0, innovationDelta: 0, welfareDelta: -15, democracyDelta: -8 },
      },
      {
        id: 'B',
        text: 'Ủng hộ thuế + đầu tư nhà ở xã hội — chấp nhận thiệt hại ngắn hạn vì công bằng',
        effects: { wealthDelta: -8, controlDelta: 3, allianceDelta: 18, stratificationDelta: -12, productionDelta: 8, innovationDelta: 3, welfareDelta: 18, democracyDelta: 12 },
      },
      {
        id: 'C',
        text: 'Đề xuất mô hình nhà ở hợp tác xã — cộng đồng cùng xây, cùng quản lý, giá hợp lý',
        effects: { wealthDelta: 0, controlDelta: 10, allianceDelta: 15, stratificationDelta: -8, productionDelta: 6, innovationDelta: 5, welfareDelta: 12, democracyDelta: 15 },
      },
    ],
  },

  // ─── Scenario 9: Giáo dục Online ───────────────────────────────────
  {
    id: 'giao-duc-online',
    title: 'Giáo dục Online',
    context:
      'Một tập đoàn EdTech nước ngoài ra mắt nền tảng học miễn phí với chất lượng cao, nhưng thu thập dữ liệu học sinh làm tài sản thương mại. Hệ thống giáo dục công lập đang mất sinh viên.',
    choices: [
      {
        id: 'A',
        text: 'Hợp tác toàn diện với EdTech — sinh viên được học miễn phí, đổi lại dữ liệu cá nhân',
        effects: { wealthDelta: 8, controlDelta: -15, allianceDelta: -5, stratificationDelta: 8, productionDelta: 10, innovationDelta: 12, welfareDelta: 5, democracyDelta: -10 },
      },
      {
        id: 'B',
        text: 'Xây dựng nền tảng công lập mã nguồn mở — chậm hơn nhưng bảo vệ chủ quyền dữ liệu',
        effects: { wealthDelta: -5, controlDelta: 18, allianceDelta: 15, stratificationDelta: -8, productionDelta: 8, innovationDelta: 15, welfareDelta: 10, democracyDelta: 15 },
      },
      {
        id: 'C',
        text: 'Cho phép cạnh tranh tự do — ai muốn dùng gì thì dùng, thị trường tự điều chỉnh',
        effects: { wealthDelta: 5, controlDelta: 0, allianceDelta: -3, stratificationDelta: 10, productionDelta: 5, innovationDelta: 8, welfareDelta: 3, democracyDelta: -3 },
      },
    ],
  },

  // ─── Scenario 10: AI Tuyển dụng ────────────────────────────────────
  {
    id: 'ai-tuyen-dung',
    title: 'AI Tuyển dụng',
    context:
      'Doanh nghiệp bạn áp dụng AI để sàng lọc CV và phỏng vấn tự động. AI tăng hiệu quả 5 lần, nhưng nghiên cứu cho thấy thuật toán có thiên kiến ưu tiên ứng viên đô thị, bất lợi cho lao động nông thôn.',
    choices: [
      {
        id: 'A',
        text: 'Tiếp tục dùng AI nguyên trạng — hiệu quả là ưu tiên số 1, kinh doanh không phải từ thiện',
        effects: { wealthDelta: 15, controlDelta: 10, allianceDelta: -10, stratificationDelta: 15, productionDelta: 5, innovationDelta: 10, welfareDelta: -8, democracyDelta: -12 },
      },
      {
        id: 'B',
        text: 'Dừng AI, mời đoàn kiểm toán độc lập đánh giá thiên kiến — chấp nhận chậm lại',
        effects: { wealthDelta: -5, controlDelta: 5, allianceDelta: 15, stratificationDelta: -10, productionDelta: 3, innovationDelta: 5, welfareDelta: 10, democracyDelta: 15 },
      },
      {
        id: 'C',
        text: 'Dùng AI hỗ trợ nhưng giữ con người ra quyết định cuối — kết hợp hiệu quả và công bằng',
        effects: { wealthDelta: 5, controlDelta: 8, allianceDelta: 8, stratificationDelta: -3, productionDelta: 8, innovationDelta: 12, welfareDelta: 5, democracyDelta: 8 },
      },
    ],
  },

  // ─── Scenario 11: Blockchain Tự quản ───────────────────────────────
  {
    id: 'blockchain-tu-quan',
    title: 'Blockchain Tự quản',
    context:
      'Một nhóm lập trình viên đề xuất hệ thống DAO (Tổ chức Tự trị Phi tập trung) để quản lý quỹ phúc lợi địa phương, thay thế cơ quan hành chính. Công nghệ minh bạch nhưng loại bỏ nhiều vị trí công chức.',
    choices: [
      {
        id: 'A',
        text: 'Triển khai DAO toàn diện — loại bỏ bộ máy hành chính, tin tưởng thuật toán',
        effects: { wealthDelta: 10, controlDelta: -12, allianceDelta: -8, stratificationDelta: 12, productionDelta: 8, innovationDelta: 15, welfareDelta: -5, democracyDelta: 8 },
      },
      {
        id: 'B',
        text: 'Từ chối — giữ nguyên hệ thống hành chính truyền thống, công nghệ chưa đủ tin cậy',
        effects: { wealthDelta: 0, controlDelta: 8, allianceDelta: 5, stratificationDelta: 3, productionDelta: -3, innovationDelta: -5, welfareDelta: 5, democracyDelta: -3 },
      },
      {
        id: 'C',
        text: 'Mô hình kết hợp — DAO để giám sát minh bạch, con người vẫn ra quyết định phân bổ',
        effects: { wealthDelta: 3, controlDelta: 10, allianceDelta: 12, stratificationDelta: -5, productionDelta: 10, innovationDelta: 12, welfareDelta: 8, democracyDelta: 15 },
      },
    ],
  },

  // ─── Scenario 12: Thu nhập Cơ bản Phổ quát ─────────────────────────
  {
    id: 'ubi',
    title: 'Thu nhập Cơ bản Phổ quát',
    context:
      'Trước làn sóng thất nghiệp do tự động hóa, chính phủ thí điểm UBI (Thu nhập Cơ bản Phổ quát) — mỗi công dân nhận 5 triệu đồng/tháng vô điều kiện. Nguồn tài trợ: thuế lợi nhuận doanh nghiệp công nghệ.',
    choices: [
      {
        id: 'A',
        text: 'Phản đối UBI — khuyến khích lười biếng, phá hủy động lực lao động sáng tạo',
        effects: { wealthDelta: 10, controlDelta: 5, allianceDelta: -15, stratificationDelta: 12, productionDelta: 3, innovationDelta: 3, welfareDelta: -15, democracyDelta: -8 },
      },
      {
        id: 'B',
        text: 'Ủng hộ hoàn toàn — UBI là quyền cơ bản, bảo đảm nhân phẩm trong kỷ nguyên AI',
        effects: { wealthDelta: -8, controlDelta: -3, allianceDelta: 20, stratificationDelta: -15, productionDelta: 5, innovationDelta: -3, welfareDelta: 20, democracyDelta: 15 },
      },
      {
        id: 'C',
        text: 'Đề xuất UBI có điều kiện — gắn với đào tạo nghề hoặc đóng góp cộng đồng',
        effects: { wealthDelta: 0, controlDelta: 8, allianceDelta: 10, stratificationDelta: -5, productionDelta: 10, innovationDelta: 8, welfareDelta: 12, democracyDelta: 10 },
      },
    ],
  },
]

// ─── Utility functions ──────────────────────────────────────────────────────

const SCENARIO_MAP = new Map(SCENARIOS.map((s) => [s.id, s]))

/** Look up a scenario by its string ID */
export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIO_MAP.get(id)
}

/** Fisher-Yates shuffle → pick `count` random scenario IDs */
export function selectRandomScenarios(count = 6): string[] {
  const ids = SCENARIOS.map((s) => s.id)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return ids.slice(0, count)
}
