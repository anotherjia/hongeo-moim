'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import HsmLogo from '@/components/HsmLogo'

const STYLE_OPTIONS = ['홍어 삼합', '묵은지 홍어', '홍어 찜', '생홍어', '홍어 탕', '기타']

export default function ProfileEditPage() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [style, setStyle] = useState(user?.preferred_hongeo_style ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = getSupabaseClient()

  if (!user) { router.push('/auth/login'); return null }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (nickname.length < 2 || nickname.length > 20) {
      setError('닉네임은 2~20자여야 합니다')
      return
    }
    setLoading(true)
    const { error: err } = await supabase.from('profiles')
      .update({ nickname, preferred_hongeo_style: style || null })
      .eq('id', user.id)
    if (err) {
      setError('저장에 실패했습니다')
    } else {
      await refreshUser()
      alert('저장되었습니다')
      router.push('/profile')
    }
    setLoading(false)
  }

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold mb-4">프로필 수정</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="card p-4 space-y-4">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-2"><HsmLogo size={48} variant="icon" /></div>
            <p className="text-xs text-gray-400">프로필 사진 기능은 준비 중이에요</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">닉네임 *</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input"
              maxLength={20}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{nickname.length}/20</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">선호하는 홍어 스타일</label>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(style === s ? '' : s)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    style === s ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="btn-outline flex-1 py-3">취소</button>
          <button type="submit" className="btn-primary flex-1 py-3" disabled={loading}>
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
