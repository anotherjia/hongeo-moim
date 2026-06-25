'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import type { Club, Restaurant, MeetupSchedule, ClubMember } from '@/lib/types'
import { useAuth } from '@/components/AuthProvider'
import { relativeTime, meetupDate, shortDate } from '@/lib/utils'
import HsmLogo from '@/components/HsmLogo'

type Tab = 'restaurants' | 'schedule' | 'members'

export default function ClubChannelPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('restaurants')
  const [club, setClub] = useState<Club | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [schedules, setSchedules] = useState<MeetupSchedule[]>([])
  const [members, setMembers] = useState<ClubMember[]>([])
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchClub()
    fetchRestaurants()
    fetchSchedules()
    fetchMembers()
  }, [id])

  const fetchClub = async () => {
    const { data } = await supabase.from('clubs').select('*').eq('id', id).single()
    setClub(data)
  }
  const fetchRestaurants = async () => {
    const { data } = await supabase.from('restaurants').select('*').eq('club_id', id).order('created_at', { ascending: false })
    setRestaurants(data ?? [])
  }
  const fetchSchedules = async () => {
    const { data } = await supabase.from('meetup_schedules').select('*').eq('club_id', id).order('scheduled_at', { ascending: true })
    setSchedules(data ?? [])
  }
  const fetchMembers = async () => {
    const { data } = await supabase.from('club_members').select('*, profiles(*)').eq('club_id', id)
    setMembers(data ?? [])
  }

  const isAdmin = members.find((m) => m.user_id === user?.id)?.role === 'admin'

  const removeMember = async (userId: string) => {
    if (!confirm('정말 내보내시겠습니까?')) return
    await supabase.from('club_members').delete().eq('club_id', id).eq('user_id', userId)
    fetchMembers()
  }

  if (!club) return <div className="text-center py-12 text-gray-400">불러오는 중...</div>

  return (
    <div className="py-4 space-y-4">
      {/* 소모임 헤더 */}
      <div className="card p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center"><HsmLogo size={36} variant="icon" /></div>
        <div>
          <h1 className="text-lg font-bold">{club.name}</h1>
          {club.description && <p className="text-sm text-gray-500">{club.description}</p>}
          <p className="text-xs text-gray-400">{members.length}/{club.max_members}명</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200">
        {([['restaurants', '맛집'], ['schedule', '일정'], ['members', '멤버']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 맛집 탭 */}
      {tab === 'restaurants' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Link href={`/clubs/${id}/restaurant/create`} className="btn-primary text-sm py-1.5 px-3">
              + 맛집 추가
            </Link>
          </div>
          {restaurants.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">🍽️</div>
              <p className="text-sm">아직 기록된 맛집이 없어요</p>
            </div>
          ) : (
            restaurants.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{r.name}</p>
                    {r.address && <p className="text-sm text-gray-500">📍 {r.address}</p>}
                    {r.review && <p className="text-sm text-gray-600 mt-1">{r.review}</p>}
                    {r.visited_at && <p className="text-xs text-gray-400 mt-1">{shortDate(r.visited_at)}</p>}
                  </div>
                  <div className="flex ml-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-sm ${i < r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 일정 탭 */}
      {tab === 'schedule' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Link href={`/clubs/${id}/schedule/create`} className="btn-primary text-sm py-1.5 px-3">
              + 일정 추가
            </Link>
          </div>
          {schedules.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-sm">예정된 일정이 없어요</p>
            </div>
          ) : (
            schedules.map((s) => (
              <div key={s.id} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary-500">📅</span>
                  <span className="font-semibold text-sm">{meetupDate(s.scheduled_at)}</span>
                </div>
                {s.location_name && (
                  <p className="text-sm text-gray-500">📍 {s.location_name}</p>
                )}
                {s.agenda && <p className="text-sm text-gray-600 mt-1">안건: {s.agenda}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* 멤버 탭 */}
      {tab === 'members' && (
        <div className="space-y-2">
          {isAdmin && (
            <div className="flex justify-end">
              <Link href={`/clubs/${id}/invite`} className="btn-primary text-sm py-1.5 px-3">
                + 멤버 초대
              </Link>
            </div>
          )}
          {members.map((m) => (
            <div key={m.user_id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center"><HsmLogo size={28} variant="icon" /></div>
              <div className="flex-1">
                <p className="font-medium">{(m.profiles as any)?.nickname}</p>
                <p className="text-xs text-gray-400">{shortDate(m.joined_at)} 참여</p>
              </div>
              {m.role === 'admin' && (
                <span className="tag bg-primary-50 text-primary-500">관리자</span>
              )}
              {isAdmin && m.user_id !== user?.id && (
                <button onClick={() => removeMember(m.user_id)} className="text-xs text-red-400 hover:text-red-600">
                  내보내기
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
