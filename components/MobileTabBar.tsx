'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', icon: '🏠', label: '홈' },
  { href: '/board', icon: '📋', label: '게시판' },
  { href: '/clubs', icon: '👥', label: '소모임' },
  { href: '/messages', icon: '💬', label: '메시지' },
  { href: '/profile', icon: '👤', label: '프로필' },
]

export default function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary-100 flex md:hidden z-50">
      {tabs.map((item) => {
        const isActive = item.href === '/'
          ? pathname === '/'
          : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`tab-item ${isActive ? 'text-primary-500' : 'text-gray-400'}`}
          >
            <span className="tab-icon">{item.icon}</span>
            <span className="tab-label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
