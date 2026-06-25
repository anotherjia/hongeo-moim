'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import type { DirectMessage, Profile } from '@/lib/types'
import { relativeTime } from '@/lib/utils'
import HsmLogo from '@/components/HsmLogo'

type Conversation = {
  partnerId: string
  partnerNickname: string
  lastMessage: string
  lastAt: string
  unread: number
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!user) return
    fetchConversations()
  }, [user])

  const fetchConversations = async () => {
    const { data: sent } = await supabase.from('direct_messages').select('*, profiles!receiver_id(nickname)').eq('sender_id', user!.id)
    const { data: received } = await supabase.from('direct_messages').select('*, profiles!sender_id(nickname)').eq('receiver_id', user!.id)

    const map = new Map<string, Conversation>()
    ;[...(sent ?? []), ...(received ?? [])].forEach((msg: any) => {
      const isMe = msg.sender_id === user!.id
      const partnerId = isMe ? msg.receiver_id : msg.sender_id
      const partnerNickname = isMe ? msg.profiles?.nickname : msg.profiles?.nickname
      const existing = map.get(partnerId)
      if (!existing || new Date(msg.created_at) > new Date(existing.lastAt)) {
        map.set(partnerId, {
          partnerId,
          partnerNickname: partnerNickname ?? '알 수 없음',
          lastMessage: msg.content,
          lastAt: msg.created_at,
          unread: !isMe && !msg.is_read ? (existing?.unread ?? 0) + 1 : existing?.unread ?? 0,
        })
      }
    })

    const convList: Conversation[] = []
    map.forEach((v) => convList.push(v))
    setConversations(convList.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()))
    setLoading(false)
  }

  if (!user) return (
    <div className="text-center py-16">
      <Link href="/auth/login" className="btn-primary">로그인</Link>
    </div>
  )

  return (
    <div className="py-4 space-y-4">
      <h1 className="text-xl font-bold">메시지</h1>
      {loading ? <div className="text-center py-12 text-gray-400">불러오는 중...</div> :
      conversations.length === 0 ? (
        <div className="text-center py-16 space-y-2 text-gray-400">
          <div className="text-4xl">💬</div>
          <p className="text-sm">아직 대화가 없어요</p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => (
            <Link key={conv.partnerId} href={`/messages/${conv.partnerId}`}>
              <div className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0"><HsmLogo size={32} variant="icon" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{conv.partnerNickname}</p>
                    <p className="text-xs text-gray-400">{relativeTime(conv.lastAt)}</p>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="bg-primary-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
