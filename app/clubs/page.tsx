'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import type { Club } from '@/lib/types'
import { useAuth } from '@/components/AuthProvider'
import HsmLogo from '@/components/HsmLogo'

export default function ClubsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!user) return
    fetchMyClubs()
  }, [user])

  const fetchMyClubs = async () => {
    const { data: members } = await supabase
      .from('club_members')
      .select('club_id')
      .eq('user_id', user!.id)

    const ids = members?.map((m) => m.club_id) ?? []
    if (ids.length === 0) { setLoading(false); return }

    const { data } = await supabase.from('clubs').select('*').in('id', ids)
    setClubs(data ?? [])
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="flex justify-center"><HsmLogo size={56} variant="icon" /></div>
        <p className="text-gray-500">로그인이 필요합니다</p>
        <Link href="/auth/login" className="btn-primary inline-block">로그인</Link>
      </div>
    )
  }

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">소모임</h1>
        <Link href="/clubs/create" className="btn-primary text-sm py-1.5 px-3">
          + 만들기
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">불러오는 중...</div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="flex justify-center"><HsmLogo size={56} variant="icon" /></div>
          <p className="text-gray-500">아직 참여 중인 소모임이 없어요</p>
          <Link href="/clubs/create" className="btn-primary inline-block">소모임 만들기</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {clubs.map((club) => (
            <Link key={club.id} href={`/clubs/${club.id}`}>
              <div className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0"><HsmLogo size={36} variant="icon" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{club.name}</p>
                  {club.description && (
                    <p className="text-sm text-gray-500 truncate">{club.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">최대 {club.max_members}명</p>
                </div>
                <span className="text-gray-300">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
