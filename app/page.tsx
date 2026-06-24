'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getSupabaseClient } from '@/lib/supabase'
import type { BoardPost, Club } from '@/lib/types'
import { relativeTime } from '@/lib/utils'

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
    <div className="space-y-5 py-4">
      {/* 비로그인 환영 배너 */}
      {!user && (
        <div className="rounded-2xl p-6 text-center text-white" style={{ background: '#E84C3D' }}>
          <div className="text-4xl mb-3">🦈</div>
          <h2 className="text-xl font-bold mb-1">홍어 모임에 오신 걸 환영해요!</h2>
          <p className="text-sm opacity-80 mb-4">홍어 애호가들과 소통하고 맛집을 탐방해보세요</p>
          <Link href="/auth/signup" className="inline-block bg-white text-primary-500 font-bold px-6 py-2 rounded-xl text-sm">
            지금 시작하기
          </Link>
        </div>
      )}

      {/* 로그인 유저 랭킹 카드 */}
      {user && (
        <div className="rounded-2xl p-4 text-white flex items-center justify-between" style={{ background: '#E84C3D' }}>
          <div>
            <p className="text-xs opacity-75 mb-0.5">안녕하세요!</p>
            <p className="font-bold text-base">{user.nickname}님</p>
            <p className="text-xs opacity-80 mt-1">
              {user.rank_tier} · {user.activity_score}점
            </p>
          </div>
          <div className="bg-white/20 rounded-2xl px-4 py-3 text-center">
            <span className="text-3xl block">🦈</span>
            <Link href="/ranking" className="text-[10px] opacity-80 mt-1 block underline">랭킹 보기</Link>
          </div>
        </div>
      )}

      {/* 내 소모임 */}
      {clubs.length > 0 && (
        <section>
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
                <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-2xl">
                  🦈
                </div>
                <span className="text-xs text-center w-16 truncate text-gray-600">{club.name}</span>
              </Link>
            ))}
            <Link href="/clubs/create" className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl text-gray-400">
                +
              </div>
              <span className="text-xs text-gray-400">새 소모임</span>
            </Link>
          </div>
        </section>
      )}

      {/* 최신 게시글 */}
      <section>
        <div className="section-header">
          <h2 className="section-title">최신 게시글</h2>
          <Link href="/board" className="section-link">전체보기</Link>
        </div>
        <div className="space-y-2">
          {posts.length === 0 ? (
            <div className="card p-8 text-center text-gray-400">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm">아직 게시글이 없어요</p>
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
  )
}
