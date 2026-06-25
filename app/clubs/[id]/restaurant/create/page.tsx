'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

const KAKAO_JS_KEY = 'fee767fadd980741654c1e8fb0055a1a'

declare global {
  interface Window {
    kakao: any
    daum: any
  }
}

export default function RestaurantCreatePage() {
  const { id: clubId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [rating, setRating] = useState(3)
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [postcodeReady, setPostcodeReady] = useState(false)
  const [mapsReady, setMapsReady] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const supabase = getSupabaseClient()

  // 1) Daum Postcode 스크립트 로드 (API 키 불필요)
  useEffect(() => {
    if (window.daum?.Postcode) { setPostcodeReady(true); return }
    const s = document.createElement('script')
    s.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    s.onload = () => setPostcodeReady(true)
    s.onerror = () => console.error('Postcode script 로드 실패')
    document.head.appendChild(s)
  }, [])

  // 2) 카카오 Maps SDK 로드 (지도 미리보기용)
  useEffect(() => {
    if (window.kakao?.maps) { setMapsReady(true); return }
    const s = document.createElement('script')
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services`
    s.onload = () => setMapsReady(true)
    s.onerror = () => console.error('Kakao Maps 로드 실패')
    document.head.appendChild(s)
  }, [])

  // 3) 좌표 바뀌면 지도 렌더링
  useEffect(() => {
    if (!mapsReady || !coords || !mapRef.current) return
    const { kakao } = window
    const pos = new kakao.maps.LatLng(coords.lat, coords.lng)
    const map = new kakao.maps.Map(mapRef.current, { center: pos, level: 4 })
    new kakao.maps.Marker({ map, position: pos })
  }, [mapsReady, coords])

  // 주소 검색 팝업
  const openAddressSearch = () => {
    if (!postcodeReady) { alert('주소 검색 로딩 중이에요. 잠시 후 다시 눌러주세요.'); return }
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        const fullAddress = data.roadAddress || data.jibunAddress
        setAddress(fullAddress)
        // 좌표 변환 (지도 SDK 로드된 경우에만)
        if (mapsReady && window.kakao?.maps?.services) {
          const geocoder = new window.kakao.maps.services.Geocoder()
          geocoder.addressSearch(fullAddress, (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              setCoords({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) })
            }
          })
        }
      },
    }).open()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !user) return
    setLoading(true)
    const { error } = await supabase.from('restaurants').insert({
      club_id: clubId,
      visited_by: user.id,
      name: name.trim(),
      address: address.trim() || null,
      rating,
      review: review.trim() || null,
    })
    setLoading(false)
    if (error) {
      alert('저장에 실패했습니다')
      return
    }
    alert(`🍽️ "${name}" 맛집이 기록되었어요!`)
    router.push(`/clubs/${clubId}`)
  }

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold mb-4">맛집 기록</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card p-4 space-y-4">

          {/* 가게 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">가게 이름 *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="가게 이름" className="input" />
          </div>

          {/* 주소 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
            <div className="flex gap-2">
              <input
                value={address}
                readOnly
                placeholder="주소 검색 버튼을 눌러주세요"
                className="input flex-1 bg-gray-50 cursor-pointer"
                onClick={openAddressSearch}
              />
              <button
                type="button"
                onClick={openAddressSearch}
                className="btn-primary px-3 py-2 text-sm whitespace-nowrap"
              >
                🔍 검색
              </button>
            </div>
          </div>

          {/* 지도 미리보기 */}
          {coords && (
            <div>
              <p className="text-xs text-gray-400 mb-1.5">📍 위치 확인</p>
              <div ref={mapRef} className="w-full h-44 rounded-xl overflow-hidden border border-gray-100" />
            </div>
          )}

          {/* 평점 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">평점</label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  className={`text-2xl transition-transform hover:scale-110 ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                  ★
                </button>
              ))}
              <span className="text-sm text-gray-500 ml-1">{rating}점</span>
            </div>
          </div>

          {/* 후기 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">후기</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="홍어는 어떠셨나요?"
              className="input resize-none"
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="btn-outline flex-1 py-3">취소</button>
          <button type="submit" className="btn-primary flex-1 py-3" disabled={!name.trim() || loading}>
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
