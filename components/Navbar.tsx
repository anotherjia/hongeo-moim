'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary-500">
          <span>🦈</span>
          <span>홍어 모임</span>
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
                pathname === item.href ? 'text-primary-500' : 'text-gray-600 hover:text-primary-500'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/notifications" className="text-gray-500 hover:text-primary-500">
            🔔
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-primary-500">
                {user.nickname}
              </Link>
              <button onClick={signOut} className="text-sm text-gray-400 hover:text-red-500">
                로그아웃
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="btn-primary text-sm py-1.5 px-3">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
