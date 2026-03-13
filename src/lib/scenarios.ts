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
        effects: { wealthDelta: 20, controlDelta: 8, allianceDelta: -10, stratificationDelta: 15, productionDelta: 5 },
      },
      {
        id: 'B',
        text: 'Tái đào tạo nhân sự hiện tại để vận hành hệ thống AI — tốn chi phí nhưng giữ đội ngũ',
        effects: { wealthDelta: 5, controlDelta: 4, allianceDelta: 8, stratificationDelta: -3, productionDelta: 10 },
      },
      {
        id: 'C',
        text: 'Liên kết với các startup khác lập quỹ chuyển đổi nghề — hi sinh tăng trưởng cá nhân',
        effects: { wealthDelta: -5, controlDelta: 2, allianceDelta: 20, stratificationDelta: -10, productionDelta: 8 },
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
        effects: { wealthDelta: 18, controlDelta: -15, allianceDelta: -8, stratificationDelta: 10, productionDelta: 2 },
      },
      {
        id: 'B',
        text: 'Từ chối bán, tự xây nền tảng hợp tác xã số với các nông dân khác trong vùng',
        effects: { wealthDelta: -5, controlDelta: 20, allianceDelta: 15, stratificationDelta: -8, productionDelta: 12 },
      },
      {
        id: 'C',
        text: 'Bán một phần dữ liệu phi nhạy cảm, giữ lại dữ liệu sản xuất cốt lõi',
        effects: { wealthDelta: 8, controlDelta: 5, allianceDelta: 3, stratificationDelta: 3, productionDelta: 5 },
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
        effects: { wealthDelta: 15, controlDelta: 18, allianceDelta: -8, stratificationDelta: 8, productionDelta: 3 },
      },
      {
        id: 'B',
        text: 'Công bố mã nguồn mở hoàn toàn — tri thức là tài sản chung của xã hội',
        effects: { wealthDelta: -3, controlDelta: -5, allianceDelta: 18, stratificationDelta: -12, productionDelta: 15 },
      },
      {
        id: 'C',
        text: 'Thành lập hợp tác xã công nghệ — chia sẻ quyền sở hữu với các thành viên đóng góp',
        effects: { wealthDelta: 5, controlDelta: 8, allianceDelta: 12, stratificationDelta: -5, productionDelta: 10 },
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
        effects: { wealthDelta: 5, controlDelta: -8, allianceDelta: -12, stratificationDelta: 8, productionDelta: 0 },
      },
      {
        id: 'B',
        text: 'Tổ chức và dẫn đầu phong trào vận động — chấp nhận rủi ro vì quyền lợi tập thể lâu dài',
        effects: { wealthDelta: -8, controlDelta: 15, allianceDelta: 20, stratificationDelta: -10, productionDelta: 5 },
      },
      {
        id: 'C',
        text: 'Ký kiến nghị trực tuyến và chia sẻ thông tin — hành động vừa đủ để không bị hệ quả',
        effects: { wealthDelta: 0, controlDelta: 5, allianceDelta: 8, stratificationDelta: -3, productionDelta: 2 },
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
        effects: { wealthDelta: 22, controlDelta: -20, allianceDelta: -10, stratificationDelta: 15, productionDelta: -3 },
      },
      {
        id: 'B',
        text: 'Từ chối, phát triển độc lập theo mô hình hợp tác xã kỹ thuật số có người dùng sở hữu cổ phần',
        effects: { wealthDelta: -5, controlDelta: 15, allianceDelta: 15, stratificationDelta: -8, productionDelta: 10 },
      },
      {
        id: 'C',
        text: 'Đàm phán mô hình đối tác chiến lược — giữ quyền kiểm soát, nhận đầu tư có điều kiện',
        effects: { wealthDelta: 12, controlDelta: 8, allianceDelta: 5, stratificationDelta: 5, productionDelta: 6 },
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
        effects: { wealthDelta: 10, controlDelta: 5, allianceDelta: -10, stratificationDelta: 12, productionDelta: -2 },
      },
      {
        id: 'B',
        text: 'Đầu tư đáng kể vào hạ tầng nông thôn — mở rộng thị trường + thu hẹp khoảng cách số',
        effects: { wealthDelta: -2, controlDelta: 3, allianceDelta: 18, stratificationDelta: -12, productionDelta: 15 },
      },
      {
        id: 'C',
        text: 'Đóng góp kỹ thuật và nhân lực (không phải tiền) — chia sẻ tri thức xây dựng năng lực địa phương',
        effects: { wealthDelta: 2, controlDelta: 6, allianceDelta: 12, stratificationDelta: -6, productionDelta: 10 },
      },
    ],
  },
]
