'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import type { AppNotification } from '@/lib/types'
import { relativeTime } from '@/lib/utils'

const ICONS: Record<string, string> = {
  invite: '👋',
  schedule_change: '📅',
  comment: '💬',
  message: '✉️',
  badge: '⭐',
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!user) return
    supabase.from('notifications').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => setNotifications(data ?? []))
  }, [user])

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
  }

  return (
    <div className="py-4 space-y-4">
      <h1 className="text-xl font-bold">알림</h1>
      {notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">🔔</div>
          <p className="text-sm">새로운 알림이 없어요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((noti) => (
            <div
              key={noti.id}
              onClick={() => !noti.is_read && markRead(noti.id)}
              className={`card p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                !noti.is_read ? 'bg-primary-50' : ''
              }`}
            >
              <span className="text-2xl">{ICONS[noti.type] ?? '🔔'}</span>
              <div className="flex-1">
                {noti.title && <p className="font-medium text-sm">{noti.title}</p>}
                {noti.body && <p className="text-sm text-gray-600">{noti.body}</p>}
                <p className="text-xs text-gray-400 mt-1">{relativeTime(noti.created_at)}</p>
              </div>
              {!noti.is_read && (
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
