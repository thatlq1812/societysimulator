'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { StarIcon } from '@/components/icons'

const ALBUM_PHOTOS = [
  { src: '/images/theme-youth-vietnam.png', rotate: 'rotate-2', delay: '0ms' },
  { src: '/images/scenario-automation.png', rotate: '-rotate-1', delay: '60ms' },
  { src: '/images/theme-alliance.png', rotate: 'rotate-1', delay: '120ms' },
  { src: '/images/scenario-digital-union.png', rotate: '-rotate-2', delay: '180ms' },
  { src: '/images/theme-chapter5.png', rotate: 'rotate-1', delay: '240ms' },
  { src: '/images/scenario-deepfake.png', rotate: '-rotate-1', delay: '300ms' },
  { src: '/images/theme-digital-society.png', rotate: 'rotate-2', delay: '360ms' },
  { src: '/images/theme-collective-choice.png', rotate: '-rotate-1', delay: '420ms' },
  { src: '/images/theme-fpt-university.png', rotate: 'rotate-1', delay: '480ms' },
]

const GUIDE_STEPS = [
  { step: '1', title: 'Tham gia', desc: 'Quét QR hoặc nhập PIN, hệ thống phân vai tự động', color: 'bg-blue-500' },
  { step: '2', title: '10 vòng', desc: 'Đối mặt tình huống, chọn lập trường giai cấp A/B/C', color: 'bg-amber-500' },
  { step: '3', title: '6 chỉ số', desc: 'Liên minh, Phân hóa, Sản xuất, Đổi mới, Phúc lợi, Dân chủ', color: 'bg-emerald-500' },
  { step: '4', title: 'AI phân tích', desc: 'Gemini bình luận mỗi vòng + xu hướng chuyên sâu', color: 'bg-violet-500' },
  { step: '5', title: 'Bản tin', desc: 'AI tổng kết Bản tin Xã hội Số + giải thưởng', color: 'bg-pink-500' },
]

const FLOATING_PARTICLES = [
  { size: 3, top: '10%', left: '5%', delay: '0s', duration: '6s' },
  { size: 2, top: '20%', left: '85%', delay: '1s', duration: '8s' },
  { size: 4, top: '60%', left: '10%', delay: '2s', duration: '7s' },
  { size: 2, top: '75%', left: '90%', delay: '0.5s', duration: '9s' },
  { size: 3, top: '40%', left: '95%', delay: '3s', duration: '6s' },
]

export default function HomePage() {
  const router = useRouter()
  const [viewPin, setViewPin] = useState('')

  return (
    <div className="h-screen flex flex-col overflow-hidden hero-gradient relative">
      {/* Grid texture overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTEwIDEwaDQwdjQwSDEweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9Ii4wMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==')] opacity-50 pointer-events-none" />

      {/* Floating particles */}
      {FLOATING_PARTICLES.map((p, i) => (
        <div
          key={i}
          className="particle bg-blue-400 animate-float-slow"
          style={{ width: p.size, height: p.size, top: p.top, left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
        />
      ))}

      {/* Glow orbs — galaxy style */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse-soft pointer-events-none" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-[20%] right-[15%] w-72 h-72 bg-violet-500/8 rounded-full blur-[80px] animate-pulse-soft pointer-events-none" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-[30%] left-[10%] w-64 h-64 bg-cyan-500/6 rounded-full blur-[60px] animate-pulse-soft pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[50%] left-[40%] w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] animate-pulse-soft pointer-events-none" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[5%] left-[60%] w-48 h-48 bg-purple-500/8 rounded-full blur-[50px] animate-pulse-soft pointer-events-none" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-[10%] right-[40%] w-56 h-56 bg-blue-300/6 rounded-full blur-[70px] animate-pulse-soft pointer-events-none" style={{ animationDelay: '2.5s' }} />
      <div className="absolute top-[70%] left-[70%] w-40 h-40 bg-teal-500/5 rounded-full blur-[60px] animate-pulse-soft pointer-events-none" style={{ animationDelay: '4s' }} />

      {/* ─── Top Badge ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-center gap-3 pt-4 pb-2 animate-fade-in flex-shrink-0">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-400/50" />
        <div className="flex items-center gap-2 text-blue-300/80">
          <StarIcon size={18} />
          <p className="text-[18px] uppercase tracking-[0.35em] font-semibold">
            MLN131 · FPT University · Spring 2026
          </p>
          <StarIcon size={18} />
        </div>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-400/50" />
      </div>

      {/* ─── Main Content ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">

        {/* Left half: 3×3 Photo Grid with decorations */}
        <div className="hidden lg:flex items-center justify-center px-6 xl:px-10 relative">
          {/* Background glow behind grid */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[80px] animate-pulse-soft" />
          </div>

          {/* Corner decorative accents */}
          <div className="absolute top-[10%] left-[5%] w-20 h-20 border-l-2 border-t-2 border-blue-400/20 rounded-tl-2xl pointer-events-none" />
          <div className="absolute bottom-[10%] right-[5%] w-20 h-20 border-r-2 border-b-2 border-blue-400/20 rounded-br-2xl pointer-events-none" />

          {/* Connecting dots decoration */}
          <div className="absolute top-[8%] right-[15%] w-2 h-2 rounded-full bg-blue-400/30 animate-pulse-soft pointer-events-none" />
          <div className="absolute bottom-[12%] left-[12%] w-1.5 h-1.5 rounded-full bg-blue-300/25 animate-pulse-soft pointer-events-none" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[50%] left-[3%] w-1 h-1 rounded-full bg-blue-400/20 animate-pulse-soft pointer-events-none" style={{ animationDelay: '2s' }} />

          <div className="relative grid grid-cols-3 gap-3 w-full max-w-[600px]">
            {ALBUM_PHOTOS.map((p, i) => {
              const isCenter = i === 4
              const isCorner = [0, 2, 6, 8].includes(i)
              return (
                <div
                  key={i}
                  className={`${p.rotate} group relative rounded-xl overflow-hidden shadow-2xl cursor-default transition-all duration-500 hover:rotate-0 hover:scale-[1.15] hover:z-20 hover:shadow-blue-400/40 animate-stagger-in ${isCenter ? 'scale-105 z-10 ring-2 ring-blue-400/30 shadow-blue-500/20' : ''} ${isCorner ? 'opacity-90 hover:opacity-100' : ''}`}
                  style={{ animationDelay: p.delay, animationFillMode: 'both' }}
                >
                  <div className="relative w-full aspect-square bg-blue-950">
                    <Image
                      src={p.src}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="180px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors duration-300" />
                    <div className="absolute inset-0 rounded-xl ring-1 ring-white/10 group-hover:ring-blue-400/40 transition-all duration-300" />
                  </div>
                </div>
              )
            })}

            {/* Decorative line connecting grid */}
            <div className="absolute -inset-4 rounded-2xl border border-blue-400/10 pointer-events-none" />
          </div>
        </div>

        {/* Right half: Title + CTA */}
        <div className="flex flex-col justify-center pr-[8%] pl-8 space-y-6 text-center lg:text-left animate-slide-in-right">
          <div className="space-y-2">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08]">
              <span className="title-glow inline-block text-white text-shadow-blue">
                Digital Society
              </span>
            </h1>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.08]">
              <span className="gradient-text-animated inline-block">
                Simulator
              </span>
            </h1>
          </div>

          <div className="decorative-line max-w-sm mx-auto lg:mx-0" />

          <p className="text-base lg:text-lg text-blue-100/80 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Trải nghiệm cơ cấu xã hội trong kỷ nguyên chuyển đổi số.<br />
            Mô phỏng{' '}
            <span className="text-blue-200 font-semibold">10 tình huống thực tế</span>{' '}
            — quyết định tập thể định hình xã hội.
          </p>

          {/* CTA buttons */}
          <div className="space-y-3 max-w-2xl mx-auto lg:mx-0">
            <div className="flex gap-4">
              <Link
                href="/host"
                className="flex-1 text-center rounded-xl bg-white py-3 text-base font-bold text-blue-900 transition-all duration-300 hover:bg-blue-50 hover:shadow-xl hover:shadow-blue-400/20 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Tạo phòng
              </Link>
              <Link
                href="/join"
                className="flex-1 text-center rounded-xl border-2 border-blue-300/50 py-3 text-base font-bold text-blue-100 transition-all duration-300 hover:bg-white/10 hover:border-blue-300/80 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Tham gia
              </Link>
            </div>
            <div className="flex gap-2">
              <input
                value={viewPin}
                onChange={(e) => setViewPin(e.target.value.toUpperCase())}
                placeholder="Nhập mã PIN"
                maxLength={6}
                className="flex-1 rounded-xl border border-blue-400/30 bg-blue-900/40 px-4 py-2.5 text-sm font-mono tracking-widest text-center text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-400/40 backdrop-blur-sm"
              />
              <button
                onClick={() => { if (viewPin.trim()) router.push(`/screen/${viewPin.trim()}`) }}
                className="rounded-xl border border-blue-400/30 bg-blue-900/40 px-5 py-2.5 text-sm font-medium text-blue-200/80 transition-all duration-300 hover:bg-blue-900/60 hover:text-white hover:-translate-y-0.5 backdrop-blur-sm"
              >
                Xem →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom: Horizontal Guide Steps ────────────────────────────── */}
      <div className="relative z-10 flex-shrink-0 border-t border-blue-400/10 bg-blue-950/60 backdrop-blur-sm">
        <div className="px-6 lg:px-12 py-4">
          <div className="flex items-center gap-4 lg:gap-5">
            <p className="text-xs text-blue-300/60 uppercase tracking-widest font-semibold flex-shrink-0 hidden lg:block">
              Hướng dẫn
            </p>
            <div className="h-8 w-px bg-blue-400/20 flex-shrink-0 hidden lg:block" />
            <div className="flex-1 grid grid-cols-5 gap-3 lg:gap-4">
              {GUIDE_STEPS.map((item) => (
                <div key={item.step} className="flex items-start gap-2.5 rounded-xl bg-blue-900/30 border border-blue-400/10 px-3 py-2.5 hover:bg-blue-900/50 transition-colors">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full ${item.color} text-white flex items-center justify-center text-xs font-bold mt-0.5`}>
                    {item.step}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.title}</p>
                    <p className="text-[14px] text-blue-100/100 leading-snug line-clamp-2">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer strip — white text */}
        <div className="border-t border-blue-900/50 px-6 py-2 flex items-center justify-between text-[14px] text-white/60">
          <span>Nhóm 4 · GD1812 · Half 2 · Spring 2026 · MLN131 · FPT University</span>
          <span>Lê Hoàng Long · Lưu Bảo Trân · Lê Quang Thật · Lâm Thủy Tiên · Nguyễn Hoàng Nghĩa · Nguyễn Vũ Nhật Khoa</span>
        </div>
      </div>
    </div>
  )
}
