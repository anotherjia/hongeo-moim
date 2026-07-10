'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getSupabaseClient } from '@/lib/supabase'
import type { BoardPost, Club } from '@/lib/types'
import { relativeTime } from '@/lib/utils'
import HsmLogo from '@/components/HsmLogo'

export default function HomePage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: postsData } = await supabase
        .from('board_posts')
        .select('*, profiles(nickname)')
        .order('created_at', { ascending: false })
        .limit(5)
      setPosts(postsData ?? [])

      if (user) {
        const { data: memberData } = await supabase
          .from('club_members')
          .select('club_id')
          .eq('user_id', user.id)
        const clubIds = memberData?.map((m) => m.club_id) ?? []
        if (clubIds.length > 0) {
          const { data: clubData } = await supabase
            .from('clubs')
            .select('*')
            .in('id', clubIds)
            .limit(6)
          setClubs(clubData ?? [])
        }
      }
    }
    fetchData()
  }, [user])

  return (
    <div>
      {/* ── 다크 히어로 (네비바와 seamless 연결) ── */}
      <div className="-mx-4 -mt-2" style={{ background: '#13062E' }}>

        {/* 히어로 콘텐츠 */}
        <div className="px-4 pt-5 pb-12">
          {!user ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-3">
                <HsmLogo size={52} variant="icon" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">홍어 모임에 오신 걸 환영해요!</h2>
              <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                홍어 애호가들과 소통하고 맛집을 탐방해보세요
              </p>
              <Link
                href="/auth/signup"
                className="inline-block font-bold px-6 py-2.5 rounded-xl text-sm text-white"
                style={{ background: '#7C3AED' }}
              >
                지금 시작하기
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                안녕하세요,
              </p>
              <p className="text-[22px] font-bold text-white mb-1 tracking-tight">
                {user.nickname}님 👋
              </p>
              <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {user.rank_tier} · 활동 점수 {user.activity_score}점
              </p>

              {/* AI 인사이트 카드 */}
              <div
                className="rounded-2xl p-4 flex items-start gap-3"
                style={{
                  background: 'rgba(124,58,237,0.18)',
                  border: '1px solid rgba(139,92,246,0.35)',
                }}
              >
                <span className="text-base mt-0.5 flex-shrink-0" style={{ color: '#C4B5FD' }}>✦</span>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#C4B5FD' }}>AI 추천</p>
                  <p className="text-xs text-white leading-relaxed">
                    활동이 활발한 소모임에 참여해서 점수를 올려보세요!
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── 화이트 컨텐츠 패널 (다크 위에 overlap) ── */}
        <div
          className="bg-white px-4 pt-6"
          style={{
            borderRadius: '28px 28px 0 0',
            marginTop: '-24px',
            minHeight: '60vh',
          }}
        >

          {/* 스탯 카드 (로그인 시) */}
          {user && (
            <div className="flex gap-3 mb-6">
              <Link href="/ranking" className="flex-1 rounded-2xl p-3.5" style={{ background: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                <p className="text-xl font-bold tracking-tight" style={{ color: '#7C3AED' }}>{user.activity_score}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: '#A78BFA' }}>활동 점수</p>
              </Link>
              <Link href="/clubs" className="flex-1 rounded-2xl p-3.5" style={{ background: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                <p className="text-xl font-bold tracking-tight" style={{ color: '#7C3AED' }}>{clubs.length}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: '#A78BFA' }}>내 소모임</p>
              </Link>
              <Link href="/board" className="flex-1 rounded-2xl p-3.5" style={{ background: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                <p className="text-xl font-bold tracking-tight" style={{ color: '#7C3AED' }}>{posts.length}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: '#A78BFA' }}>최신 글</p>
              </Link>
            </div>
          )}

          {/* 내 소모임 */}
          {clubs.length > 0 && (
            <section className="mb-6">
              <div className="section-header">
                <h2 className="section-title">내 소모임</h2>
                <Link href="/clubs" className="section-link">전체보기</Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                {clubs.map((club) => (
                  <Link
                    key={club.id}
                    href={`/clubs/${club.id}`}
                    className="flex-shrink-0 flex flex-col items-center gap-1.5"
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                      <HsmLogo size={34} variant="icon" />
                    </div>
                    <span className="text-xs text-center w-16 truncate text-gray-600">{club.name}</span>
                  </Link>
                ))}
                <Link href="/clubs/create" className="flex-shrink-0 flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: '#F5F3FF', border: '1px solid #EDE9FE', color: '#C4B5FD' }}>
                    +
                  </div>
                  <span className="text-xs" style={{ color: '#C4B5FD' }}>새 소모임</span>
                </Link>
              </div>
            </section>
          )}

          {/* 최신 게시글 */}
          <section className="pb-6">
            <div className="section-header">
              <h2 className="section-title">최신 게시글</h2>
              <Link href="/board" className="section-link">전체보기</Link>
            </div>
            <div className="space-y-2">
              {posts.length === 0 ? (
                <div className="rounded-2xl p-8 text-center" style={{ background: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                  <div className="text-3xl mb-2">📝</div>
                  <p className="text-sm text-gray-400">아직 게시글이 없어요</p>
                </div>
              ) : (
                posts.map((post) => (
                  <Link key={post.id} href={`/board/${post.id}`}>
                    <div className="feed-card">
                      <div className="flex items-center gap-1.5 mb-2">
                        {post.tags?.map((tag) => (
                          <span key={tag} className="tag bg-primary-50 text-primary-600">{tag}</span>
                        ))}
                        <span className={`tag ml-auto ${
                          post.status === '진행중' ? 'bg-green-50 text-green-600' :
                          post.status === '모집마감' ? 'bg-orange-50 text-orange-500' :
                          'bg-gray-100 text-gray-500'
                        }`}>{post.status}</span>
                      </div>
                      <p className="font-semibold text-sm line-clamp-2 mb-2 text-gray-900">{post.title}</p>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{(post.profiles as any)?.nickname}</span>
                        <span>{relativeTime(post.created_at)}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
