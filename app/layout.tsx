import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { RegisterSW } from './register-sw'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '筋トレサポート',
  description: '筋トレの記録と管理をサポートするアプリ',
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '筋トレサポート',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        {children}
        <RegisterSW />
      </body>
    </html>
  )
}
