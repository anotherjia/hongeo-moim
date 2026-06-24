'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import type { Profile } from '@/lib/types'
import { getRankTierEmoji } from '@/lib/utils'

export default function RankingPage() {
  const [ranking, setRanking] = useState<Profile[]>([])
  const supabase = getSupabaseClient()

  useEffect(() => {
    supabase.from('profiles').select('*').order('activity_score', { ascending: false }).limit(50)
      .then(({ data }) => setRanking(data ?? []))
  }, [])

  const RANK_EMOJI = ['🥇', '🥈', '🥉']

  return (
    <div className="py-4 space-y-4">
      <h1 className="text-xl font-bold">랭킹 순위</h1>
      <div className="space-y-2">
        {ranking.map((profile, index) => (
          <Link key={profile.id} href={`/profile/${profile.id}`}>
            <div className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <span className="text-xl w-8 text-center">{RANK_EMOJI[index] ?? `${index + 1}`}</span>
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">🦈</div>
              <div className="flex-1">
                <p className="font-medium">{profile.nickname}</p>
                <p className="text-xs text-gray-500">{getRankTierEmoji(profile.rank_tier)} {profile.rank_tier}</p>
              </div>
              <span className="font-bold text-primary-500">{profile.activity_score}점</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
