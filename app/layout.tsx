import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import MobileTabBar from '@/components/MobileTabBar'

export const metadata: Metadata = {
  title: 'HSM',
  description: '홍어 애호가들의 소셜 커뮤니티',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="max-w-2xl mx-auto px-4 pb-24 pt-16 min-h-screen">
            {children}
          </main>
          <MobileTabBar />
        </AuthProvider>
      </body>
    </html>
  )
}
