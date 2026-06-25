'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import type { DirectMessage, Profile } from '@/lib/types'
import { relativeTime } from '@/lib/utils'
import HsmLogo from '@/components/HsmLogo'

export default function ChatPage() {
  const { userId: partnerId } = useParams<{ userId: string }>()
  const { user } = useAuth()
  const [partner, setPartner] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchPartner()
    fetchMessages()

    // Realtime 구독
    const channel = supabase
      .channel(`dm-${user?.id}-${partnerId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `receiver_id=eq.${user?.id}`,
      }, () => fetchMessages())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [partnerId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchPartner = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', partnerId).single()
    setPartner(data)
  }

  const fetchMessages = async () => {
    const { data: sent } = await supabase.from('direct_messages').select('*')
      .eq('sender_id', user!.id).eq('receiver_id', partnerId)
    const { data: received } = await supabase.from('direct_messages').select('*')
      .eq('sender_id', partnerId).eq('receiver_id', user!.id)

    const all = [...(sent ?? []), ...(received ?? [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    setMessages(all)

    // 읽음 처리
    await supabase.from('direct_messages').update({ is_read: true })
      .eq('sender_id', partnerId).eq('receiver_id', user!.id).eq('is_read', false)
  }

  const sendMessage = async () => {
    if (!text.trim() || !user) return
    const content = text.trim()
    setText('')
    await supabase.from('direct_messages').insert({
      sender_id: user.id,
      receiver_id: partnerId,
      content,
    })
    fetchMessages()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* 헤더 */}
      <div className="card p-4 flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center"><HsmLogo size={28} variant="icon" /></div>
        <p className="font-semibold">{partner?.nickname}</p>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                  isMe ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400 px-1">{relativeTime(msg.created_at)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="card p-3 flex gap-2 mt-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지 입력..."
          className="input flex-1 py-2"
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} disabled={!text.trim()} className="btn-primary px-4">
          전송
        </button>
      </div>
    </div>
  )
}
