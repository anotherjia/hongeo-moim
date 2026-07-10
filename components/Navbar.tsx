'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { usePathname } from 'next/navigation'
import HsmLogo from './HsmLogo'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: '#13062E' }}>
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <HsmLogo size={30} variant="icon" />
          <span className="text-white font-bold text-lg tracking-tight">HSM</span>
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {[
            { href: '/', label: '홈' },
            { href: '/board', label: '게시판' },
            { href: '/clubs', label: '소모임' },
            { href: '/messages', label: '메시지' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-medium transition-colors ${
                pathname === item.href ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/notifications" className="text-white/60 hover:text-white transition-colors text-lg">
            🔔
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                {user.nickname}
              </Link>
              <button
                onClick={signOut}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
