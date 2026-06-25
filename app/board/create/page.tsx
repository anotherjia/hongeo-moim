'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { POST_TAGS } from '@/lib/types'
import { useAuth } from '@/components/AuthProvider'

export default function BoardCreatePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = getSupabaseClient()

  if (!user) {
    router.push('/auth/login')
    return null
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase.from('board_posts').insert({
      author_id: user.id,
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      status: '진행중',
    }).select().single()
    setLoading(false)
    if (err || !data) {
      console.error('게시글 등록 실패:', err?.message, err?.code, err?.details, err?.hint)
      setError('게시글 등록에 실패했습니다')
      return
    }
    alert('게시글이 등록되었습니다')
    router.push(`/board/${data.id}`)
  }

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold mb-4">글쓰기</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              placeholder="제목을 입력하세요"
              className="input"
              maxLength={100}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{title.length}/100</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
            <div className="flex flex-wrap gap-2">
              {POST_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-primary-500'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">내용 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 2000))}
              placeholder="내용을 입력하세요"
              className="input resize-none"
              rows={8}
              maxLength={2000}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{content.length}/2000</p>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline flex-1 py-3"
          >
            취소
          </button>
          <button
            type="submit"
            className="btn-primary flex-1 py-3"
            disabled={!title.trim() || !content.trim() || loading}
          >
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
