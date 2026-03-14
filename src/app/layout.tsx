import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata: Metadata = {
  title: 'Digital Society Simulator',
  description:
    'Mô phỏng cơ cấu xã hội trong kỷ nguyên chuyển đổi số — MLN131, FPT University',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Digital Society Simulator',
    description: 'Trải nghiệm sự phân hóa giai cấp trong nền kinh tế số',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
