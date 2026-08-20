import type { Metadata, Viewport } from 'next'
import { Noto_Sans_SC, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-noto-sans-sc',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: '辩论赛评审投票 · 现场揭晓',
  description: '印象票、分数票、决选票，三局两胜归一 — 可嵌入 Canva 的现场揭晓工具',
  generator: 'v0.app',
  alternates: {
    types: {
      'application/json+oembed': 'https://chinesedebate-tarumt-yb.vercel.app/api/oembed',
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#0f1424',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`dark bg-background ${notoSansSC.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}