import Link from 'next/link'
import { StarIcon } from '@/components/icons'
import { FramedImage } from '@/components/game/FramedImage'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-10">
        {/* Hero illustration */}
        <FramedImage
          src="/images/hero-network.png"
          alt="Digital Society Network"
          variant="hero"
          frameClassName="w-full max-w-md aspect-square animate-scale-in"
        />

        {/* Title block */}
        <div className="text-center space-y-4 max-w-2xl animate-slide-up">
          <div className="flex items-center justify-center gap-2 text-accent">
            <StarIcon size={16} />
            <p className="text-sm uppercase tracking-[0.3em] font-medium">
              MLN131 — FPT University
            </p>
            <StarIcon size={16} />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Digital Society
            <br />
            <span className="text-primary">Simulator</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Trải nghiệm cơ cấu xã hội trong kỷ nguyên chuyển đổi số.
            Mô phỏng 6 tình huống — quyết định của bạn định hình xã hội.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm animate-fade-in">
          <Link
            href="/host"
            className="flex-1 text-center rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Tạo phòng
          </Link>
          <Link
            href="/join"
            className="flex-1 text-center rounded-xl border-2 border-accent py-4 text-base font-bold text-accent transition-all hover:bg-accent/10 active:scale-[0.98]"
          >
            Vào game
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground/70">Nhóm 4 — Lớp GD1812 — Half 2</p>
        <p>Chủ nghĩa Xã hội Khoa học (MLN131) — Đại học FPT</p>
        <p>Chủ đề: Thanh niên Việt Nam trong cơ cấu xã hội</p>
        <p className="text-[10px]">Lê Hoàng Long · Lưu Bảo Trân · Lê Quang Thật · Lâm Thủy Tiên · Nguyễn Hoàng Nghĩa · Nguyễn Vũ Nhật Khoa</p>
      </footer>
    </div>
  )
}
