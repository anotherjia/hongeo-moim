'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import type { Profile, Badge } from '@/lib/types'
import { BADGE_INFO } from '@/lib/types'
import { getRankTierEmoji } from '@/lib/utils'

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const supabase = getSupabaseClient()

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', userId).single().then(({ data }) => setProfile(data))
    supabase.from('badges').select('*').eq('user_id', userId).then(({ data }) => setBadges(data ?? []))
  }, [userId])

  if (!profile) return <div className="text-center py-12 text-gray-400">불러오는 중...</div>

  return (
    <div className="py-4 space-y-4">
      <div className="card p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-4xl mx-auto mb-3">🦈</div>
        <h1 className="text-xl font-bold">{profile.nickname}</h1>
        <p className="text-primary-500 font-medium mt-1">
          {getRankTierEmoji(profile.rank_tier)} {profile.rank_tier}
        </p>
        <p className="text-2xl font-bold text-primary-500 mt-3">{profile.activity_score}</p>
        <p className="text-xs text-gray-500">활동 점수</p>

        {user && user.id !== userId && (
          <Link href={`/messages/${userId}`} className="btn-primary mt-4 inline-block w-full py-2">
            💬 메시지 보내기
          </Link>
        )}
      </div>

      {badges.length > 0 && (
        <div className="card p-4">
          <h2 className="font-bold mb-3">획득한 뱃지</h2>
          <div className="grid grid-cols-4 gap-3">
            {badges.map((b) => (
              <div key={b.id} className="flex flex-col items-center gap-1 p-2 bg-primary-50 rounded-xl">
                <span className="text-2xl">{BADGE_INFO[b.badge_type]?.emoji ?? '🏅'}</span>
                <span className="text-xs text-center">{b.badge_type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
