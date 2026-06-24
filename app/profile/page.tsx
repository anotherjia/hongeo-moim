'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getSupabaseClient } from '@/lib/supabase'
import type { Badge } from '@/lib/types'
import { BADGE_INFO, RANK_TIERS } from '@/lib/types'
import { getRankTierEmoji } from '@/lib/utils'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [badges, setBadges] = useState<Badge[]>([])
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!user) return
    supabase.from('badges').select('*').eq('user_id', user.id).then(({ data }) => setBadges(data ?? []))
  }, [user])

  if (!user) return (
    <div className="text-center py-16 space-y-4">
      <div className="text-5xl">🦈</div>
      <Link href="/auth/login" className="btn-primary inline-block">로그인하기</Link>
    </div>
  )

  const tierEmoji = getRankTierEmoji(user.rank_tier)

  return (
    <div className="py-4 space-y-4">
      {/* 프로필 헤더 */}
      <div className="card p-5 text-center">
        <div className="w-20 h-20 rounded-full bg-primary-50 border-2 border-primary-100 flex items-center justify-center text-4xl mx-auto mb-3">
          🦈
        </div>
        <h1 className="text-lg font-bold text-gray-900">{user.nickname}</h1>
        <p className="text-primary-500 text-sm font-medium mt-0.5">{tierEmoji} {user.rank_tier}</p>
        {user.preferred_hongeo_style && (
          <p className="text-xs text-gray-400 mt-1">선호: {user.preferred_hongeo_style}</p>
        )}

        {/* 통계 3박스 */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-primary-50 rounded-xl py-3">
            <p className="text-xl font-bold text-primary-500">{user.activity_score}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">활동점수</p>
          </div>
          <div className="bg-gray-50 rounded-xl py-3">
            <p className="text-xl font-bold text-gray-700">{badges.length}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">뱃지</p>
          </div>
          <div className="bg-gray-50 rounded-xl py-3">
            <p className="text-xl font-bold text-gray-700">🦈</p>
            <p className="text-[10px] text-gray-400 mt-0.5">홍어러버</p>
          </div>
        </div>

        <Link href="/profile/edit" className="btn-outline mt-4 w-full py-2.5 block text-sm">
          ✏️ 프로필 수정
        </Link>
      </div>

      {/* 뱃지 */}
      <div className="card p-4">
        <h2 className="font-bold text-sm mb-3">획득한 뱃지</h2>
        {badges.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-2xl mb-1">🔒</p>
            <p className="text-xs text-gray-400">아직 뱃지가 없어요<br/>활동하면 뱃지를 얻을 수 있어요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {badges.map((b) => (
              <div key={b.id} className="flex flex-col items-center gap-1 p-2.5 bg-primary-50 rounded-xl">
                <span className="text-2xl">{BADGE_INFO[b.badge_type]?.emoji ?? '🏅'}</span>
                <span className="text-[10px] text-center leading-tight text-primary-700">{b.badge_type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 메뉴 */}
      <div className="card overflow-hidden">
        <Link href="/ranking" className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">🏆</span>
            <span className="text-sm font-medium">랭킹 순위</span>
          </div>
          <span className="text-gray-300 text-lg">›</span>
        </Link>
        <div className="border-t border-gray-100" />
        <Link href="/notifications" className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">🔔</span>
            <span className="text-sm font-medium">알림</span>
          </div>
          <span className="text-gray-300 text-lg">›</span>
        </Link>
        <div className="border-t border-gray-100" />
        <button onClick={signOut} className="flex items-center w-full p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">🚪</span>
            <span className="text-sm font-medium text-red-500">로그아웃</span>
          </div>
        </button>
      </div>
    </div>
  )
}
