'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import type { Restaurant } from '@/lib/types'

export default function ScheduleCreatePage() {
  const { id: clubId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const [scheduledAt, setScheduledAt] = useState('')
  const [locationName, setLocationName] = useState('')
  const [agenda, setAgenda] = useState('')
  const [restaurantId, setRestaurantId] = useState('')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    supabase.from('restaurants').select('*').eq('club_id', clubId).then(({ data }) => {
      setRestaurants(data ?? [])
    })
  }, [clubId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduledAt || !user) return
    setLoading(true)
    await supabase.from('meetup_schedules').insert({
      club_id: clubId,
      created_by: user.id,
      scheduled_at: scheduledAt,
      restaurant_id: restaurantId || null,
      location_name: locationName.trim() || null,
      agenda: agenda.trim() || null,
    })
    router.push(`/clubs/${clubId}`)
  }

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold mb-4">일정 추가</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">날짜 & 시간 *</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="input"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
            {restaurants.length > 0 && (
              <select
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                className="input mb-2"
              >
                <option value="">기록된 맛집에서 선택</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            )}
            {!restaurantId && (
              <input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="장소 직접 입력"
                className="input"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">안건 (선택)</label>
            <input value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder="모임 안건" className="input" />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="btn-outline flex-1 py-3">취소</button>
          <button type="submit" className="btn-primary flex-1 py-3" disabled={!scheduledAt || loading}>
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
