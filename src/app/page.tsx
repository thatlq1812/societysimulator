import Link from 'next/link'
import Image from 'next/image'
import { StarIcon, GlobeIcon, BrainIcon, ChartIcon, GamepadIcon } from '@/components/icons'

const ALBUM_PHOTOS = [
  { src: '/images/theme-youth-vietnam.png', caption: 'Thanh niên Việt Nam', rotate: 'rotate-3', delay: '0ms' },
  { src: '/images/scenario-automation.png', caption: 'Cú sốc Tự động hóa', rotate: '-rotate-2', delay: '100ms' },
  { src: '/images/theme-alliance.png', caption: 'Liên minh Giai cấp', rotate: 'rotate-1', delay: '200ms' },
  { src: '/images/scenario-digital-union.png', caption: 'Liên đoàn Lao động Số', rotate: '-rotate-3', delay: '300ms' },
  { src: '/images/theme-chapter5.png', caption: 'Cơ cấu Xã hội', rotate: 'rotate-2', delay: '400ms' },
  { src: '/images/scenario-deepfake.png', caption: 'Thao túng Truyền thông', rotate: '-rotate-1', delay: '500ms' },
  { src: '/images/theme-digital-society.png', caption: 'Xã hội Số', rotate: 'rotate-3', delay: '600ms' },
  { src: '/images/theme-collective-choice.png', caption: 'Quyết định Tập thể', rotate: '-rotate-2', delay: '700ms' },
  { src: '/images/scenario-metaverse.png', caption: 'Bất động sản Ảo', rotate: 'rotate-2', delay: '800ms' },
  { src: '/images/theme-fpt-university.png', caption: 'FPT University', rotate: '-rotate-3', delay: '900ms' },
]

const FLOATING_PARTICLES = [
  { size: 3, top: '10%', left: '5%', delay: '0s', duration: '6s' },
  { size: 2, top: '20%', left: '85%', delay: '1s', duration: '8s' },
  { size: 4, top: '60%', left: '10%', delay: '2s', duration: '7s' },
  { size: 2, top: '75%', left: '90%', delay: '0.5s', duration: '9s' },
  { size: 3, top: '40%', left: '95%', delay: '3s', duration: '6s' },
  { size: 2, top: '85%', left: '50%', delay: '1.5s', duration: '8s' },
  { size: 3, top: '15%', left: '45%', delay: '2.5s', duration: '7s' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* ─── Hero Section — Deep Blue Photo Album ────────────────────────── */}
      <section className="relative flex-1 hero-gradient overflow-hidden">
        {/* Grid texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTEwIDEwaDQwdjQwSDEweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9Ii4wMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==')] opacity-50" />

        {/* Floating particles */}
        {FLOATING_PARTICLES.map((p, i) => (
          <div
            key={i}
            className="particle bg-blue-400 animate-float-slow"
            style={{
              width: p.size,
              height: p.size,
              top: p.top,
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}

        {/* Decorative glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-16">
          {/* Top badge */}
          <div className="flex items-center justify-center gap-3 mb-10 animate-fade-in">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-400/50" />
            <div className="flex items-center gap-2 text-blue-300/80">
              <StarIcon size={12} />
              <p className="text-[10px] uppercase tracking-[0.35em] font-semibold">
                MLN131 · FPT University · Spring 2026
              </p>
              <StarIcon size={12} />
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-400/50" />
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            {/* Left: Photo Album Grid */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 lg:gap-4">
                {ALBUM_PHOTOS.map((p, i) => (
                  <div
                    key={i}
                    className={`${p.rotate} group relative bg-white/95 p-1.5 pb-6 shadow-2xl rounded-sm cursor-default transition-all duration-500 hover:rotate-0 hover:scale-110 hover:z-20 hover:shadow-blue-400/30 hover:shadow-2xl animate-stagger-in`}
                    style={{ animationDelay: p.delay, animationFillMode: 'both' }}
                  >
                    <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                      <Image
                        src={p.src}
                        alt={p.caption}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 18vw, 12vw"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/20 transition-colors duration-300" />
                    </div>
                    <p className="text-center text-[8px] font-medium text-blue-900/60 mt-1 leading-tight px-0.5 truncate">
                      {p.caption}
                    </p>
                    {/* Tape decoration on some cards */}
                    {i % 3 === 0 && (
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-blue-200/40 rounded-sm rotate-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Title + CTA */}
            <div className="flex-shrink-0 w-full lg:w-[420px] space-y-8 text-center lg:text-left animate-slide-in-right">
              <div className="space-y-5">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] text-shadow-blue">
                  Digital
                  <br />
                  Society
                  <br />
                  <span className="gradient-text">Simulator</span>
                </h1>

                <div className="decorative-line max-w-xs mx-auto lg:mx-0" />

                <p className="text-base text-blue-100/80 leading-relaxed max-w-sm mx-auto lg:mx-0">
                  Trải nghiệm cơ cấu xã hội trong kỷ nguyên chuyển đổi số.
                  Mô phỏng{' '}
                  <span className="text-blue-200 font-semibold">10 tình huống thực tế</span>{' '}
                  — quyết định tập thể của bạn định hình xã hội.
                </p>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto lg:mx-0">
                <Link
                  href="/host"
                  className="flex-1 text-center rounded-xl bg-white py-4 text-sm font-bold text-blue-900 transition-all duration-300 hover:bg-blue-50 hover:shadow-xl hover:shadow-blue-400/20 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Tạo phòng
                </Link>
                <Link
                  href="/join"
                  className="flex-1 text-center rounded-xl border-2 border-blue-300/50 py-4 text-sm font-bold text-blue-100 transition-all duration-300 hover:bg-white/10 hover:border-blue-300/80 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Vào game
                </Link>
              </div>

              {/* Stat chips */}
              <div className="flex justify-center lg:justify-start gap-3 flex-wrap">
                {[
                  { value: '10', label: 'tình huống', color: 'text-blue-200' },
                  { value: '4', label: 'giai cấp', color: 'text-amber-300' },
                  { value: '6', label: 'chỉ số vĩ mô', color: 'text-cyan-300' },
                ].map((s) => (
                  <div key={s.label} className="rounded-full border border-blue-400/20 bg-blue-900/40 backdrop-blur-sm px-4 py-1.5 text-center hover-lift">
                    <span className={`text-lg font-bold ${s.color} tabular-nums`}>{s.value}</span>
                    <span className="text-xs text-blue-300/70 ml-1.5">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V20C240 40 480 0 720 20C960 40 1200 0 1440 20V60H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* ─── Features Section ────────────────────────────────────────────── */}
      <section className="bg-background px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2">Cách hoạt động</p>
            <h2 className="text-2xl font-bold">Mô phỏng xã hội bằng quyết định tập thể</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <GlobeIcon size={28} className="text-blue-600" />,
                title: '20 Kịch bản',
                desc: 'Pool 20 tình huống xã hội — mỗi game chọn ngẫu nhiên 10, không bao giờ lặp lại.',
                delay: '0s',
              },
              {
                icon: <ChartIcon size={28} className="text-amber-600" />,
                title: '4 Giai cấp',
                desc: 'Công nhân · Nông dân · Trí thức · Startup — mỗi giai cấp có sứ mệnh lịch sử riêng.',
                delay: '0.15s',
              },
              {
                icon: <BrainIcon size={28} className="text-violet-600" />,
                title: 'AI 3 tầng',
                desc: 'Bình luận từng vòng, phân tích xu hướng, Bản tin Xã hội Số cuối game.',
                delay: '0.3s',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 space-y-3 hover-lift animate-stagger-in"
                style={{ animationDelay: f.delay, animationFillMode: 'both' }}
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  {f.icon}
                </div>
                <p className="font-bold text-lg">{f.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Game Guide Section ──────────────────────────────────────────── */}
      <section className="bg-muted/30 px-6 py-14 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <GamepadIcon size={28} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Hướng dẫn chơi</h2>
            <p className="text-sm text-muted-foreground">Cơ chế game mô phỏng xã hội số</p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Tham gia phòng',
                desc: 'Host tạo phòng, chia sẻ mã PIN. Mỗi người chơi quét QR hoặc nhập mã PIN để vào game. Hệ thống tự động phân vai: Công nhân, Nông dân, Trí thức, hoặc Startup.',
                color: 'bg-blue-500',
              },
              {
                step: '2',
                title: '10 vòng quyết định',
                desc: 'Mỗi vòng, xã hội đối mặt một tình huống thời sự (tự động hóa, dữ liệu, bất động sản, deepfake...). Mỗi người chọn A, B hoặc C — đại diện cho lập trường giai cấp trước sự kiện vĩ mô.',
                color: 'bg-amber-500',
              },
              {
                step: '3',
                title: '6 chỉ số vĩ mô biến động',
                desc: 'Quyết định tập thể ảnh hưởng 6 chỉ số: Liên minh, Phân hóa, Sản xuất, Đổi mới, Phúc lợi, Dân chủ. Hệ thống có cơ chế giảm tốc — càng gần cực trị (0 hoặc 100) càng khó thay đổi.',
                color: 'bg-emerald-500',
              },
              {
                step: '4',
                title: 'AI bình luận mỗi vòng',
                desc: 'Sau mỗi vòng, AI (Gemini) phân tích lựa chọn của từng giai cấp, so sánh xu hướng liên minh vs phân hóa, và nhận xét tình hình xã hội. Host nhận thêm phân tích xu hướng chuyên sâu.',
                color: 'bg-violet-500',
              },
              {
                step: '5',
                title: 'Bản tin Xã hội Số',
                desc: 'Kết thúc game, AI tự động sinh "Bản tin Xã hội Số" — bài báo tổng kết toàn bộ hành trình xã hội, phân tích kết cục: Bền vững, Bất ổn, hay Sụp đổ. Kèm giải thưởng cho người chơi nổi bật.',
                color: 'bg-pink-500',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-4 items-start rounded-xl border border-border bg-card p-5 hover-lift"
              >
                <div className={`flex-shrink-0 w-9 h-9 rounded-full ${item.color} text-white flex items-center justify-center text-sm font-bold`}>
                  {item.step}
                </div>
                <div>
                  <p className="font-bold text-base mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Gallery Strip ────────────────────────────────────────────────── */}
      <section className="bg-blue-950 py-8 overflow-hidden">
        <div className="flex gap-4 animate-ticker" style={{ animationDuration: '40s' }}>
          {[
            '/images/scenario-algorithm.png',
            '/images/scenario-green.png',
            '/images/scenario-dao-governance.png',
            '/images/scenario-data-leak.png',
            '/images/scenario-generation-gap.png',
            '/images/scenario-blockchain.png',
            '/images/scenario-data.png',
            '/images/scenario-platform.png',
            '/images/scenario-rural.png',
            '/images/scenario-hiring.png',
            '/images/scenario-opensource.png',
            '/images/scenario-acquisition.png',
            '/images/hero-network.png',
            '/images/scenario-algorithm.png',
            '/images/scenario-green.png',
            '/images/scenario-dao-governance.png',
          ].map((src, i) => (
            <div key={i} className="flex-shrink-0 w-32 h-20 relative rounded-lg overflow-hidden border border-blue-800/50 opacity-70 hover:opacity-100 transition-opacity duration-300">
              <Image src={src} alt="" fill className="object-cover" sizes="128px" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 px-6 py-6 text-center text-xs space-y-1.5 border-t border-blue-900/50">
        <p className="font-semibold text-blue-200/80">Nhóm 4 — Lớp GD1812 — Half 2 · Spring 2026</p>
        <p className="text-blue-300/50">Chủ nghĩa Xã hội Khoa học (MLN131) — Đại học FPT</p>
        <p className="text-blue-300/50">Chủ đề: Thanh niên Việt Nam trong cơ cấu xã hội</p>
        <div className="decorative-line max-w-xs mx-auto my-2" />
        <p className="text-[10px] text-blue-400/40">Lê Hoàng Long · Lưu Bảo Trân · Lê Quang Thật · Lâm Thủy Tiên · Nguyễn Hoàng Nghĩa · Nguyễn Vũ Nhật Khoa</p>
      </footer>
    </div>
  )
}
