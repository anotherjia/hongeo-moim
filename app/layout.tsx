import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'

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
          {/* 모바일 하단 탭바 */}
          <MobileTabBar />
        </AuthProvider>
      </body>
    </html>
  )
}

function MobileTabBar() {
  const tabs = [
    { href: '/', icon: '🏠', label: '홈' },
    { href: '/board', icon: '📋', label: '게시판' },
    { href: '/clubs', icon: '👥', label: '소모임' },
    { href: '/messages', icon: '💬', label: '메시지' },
    { href: '/profile', icon: '👤', label: '프로필' },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 flex md:hidden z-50 safe-area-inset-bottom">
      {tabs.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="tab-item text-gray-400 hover:text-primary-500"
        >
          <span className="tab-icon">{item.icon}</span>
          <span className="tab-label">{item.label}</span>
        </a>
      ))}
    </nav>
  )
}
