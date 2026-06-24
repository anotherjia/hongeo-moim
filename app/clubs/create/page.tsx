'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

export default function ClubCreatePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [maxMembers, setMaxMembers] = useState(10)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = getSupabaseClient()

  if (!user) { router.push('/auth/login'); return null }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    const { data: club, error: clubError } = await supabase.from('clubs').insert({
      name: name.trim(),
      description: description.trim() || null,
      created_by: user.id,
      max_members: maxMembers,
    }).select().single()

    if (clubError || !club) {
      setError('소모임 생성에 실패했습니다.')
      setLoading(false)
      return
    }

    // 생성자를 admin으로 추가
    await supabase.from('club_members').insert({
      club_id: club.id,
      user_id: user.id,
      role: 'admin',
    })
    setLoading(false)
    alert(`🦈 "${club.name}" 소모임이 생성되었어요!`)
    router.push(`/clubs/${club.id}`)
  }

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold mb-4">소모임 만들기</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">소모임 이름 *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름 입력" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">소개</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="소모임을 소개해주세요"
              className="input resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">최대 인원</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setMaxMembers(Math.max(2, maxMembers - 1))}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-lg">−</button>
              <span className="font-bold text-lg w-8 text-center">{maxMembers}</span>
              <button type="button" onClick={() => setMaxMembers(Math.min(20, maxMembers + 1))}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-lg">+</button>
              <span className="text-xs text-gray-400">명 (최대 20명)</span>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="btn-outline flex-1 py-3">취소</button>
          <button type="submit" className="btn-primary flex-1 py-3" disabled={!name.trim() || loading}>
            {loading ? '만드는 중...' : '만들기'}
          </button>
        </div>
      </form>
    </div>
  )
}
