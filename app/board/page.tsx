'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import type { BoardPost } from '@/lib/types'
import { POST_TAGS } from '@/lib/types'
import { relativeTime } from '@/lib/utils'
import { useAuth } from '@/components/AuthProvider'

export default function BoardPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  const fetchPosts = async (tag: string | null = null) => {
    setLoading(true)
    let query = supabase
      .from('board_posts')
      .select('*, profiles(nickname)')
      .order('created_at', { ascending: false })
      .limit(30)

    if (tag) query = query.contains('tags', [tag])

    const { data } = await query
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts(selectedTag) }, [selectedTag])

  return (
    <div className="py-4 space-y-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">게시판</h1>
        {user && (
          <Link href="/board/create" className="btn-primary text-sm py-1.5 px-4">
            + 글쓰기
          </Link>
        )}
      </div>

      {/* 검색바 (디자인용) */}
      <div className="search-bar">
        <span>🔍</span>
        <span>게시글 검색</span>
      </div>

      {/* 태그 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setSelectedTag(null)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedTag === null ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
          }`}
        >
          전체
        </button>
        {POST_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedTag === tag ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 게시글 목록 */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-sm">게시글이 없어요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Link key={post.id} href={`/board/${post.id}`}>
              <div className="card p-4 active:scale-[0.99] transition-transform">
                <div className="flex items-center gap-1.5 mb-1.5">
                  {post.tags?.map((tag) => (
                    <span key={tag} className="tag bg-primary-50 text-primary-600 text-[11px]">{tag}</span>
                  ))}
                  <span className={`tag ml-auto text-[11px] ${
                    post.status === '진행중' ? 'bg-green-50 text-green-600' :
                    post.status === '모집마감' ? 'bg-orange-50 text-orange-500' :
                    'bg-gray-100 text-gray-500'
                  }`}>{post.status}</span>
                </div>
                <p className="font-semibold text-sm mb-1 line-clamp-2 text-gray-900">{post.title}</p>
                <p className="text-gray-400 text-xs line-clamp-1 mb-2">{post.content}</p>
                <div className="flex justify-between text-xs text-gray-400">
                  <span className="font-medium">{(post.profiles as any)?.nickname}</span>
                  <span>{relativeTime(post.created_at)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
