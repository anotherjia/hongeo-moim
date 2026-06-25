'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import type { BoardPost, Comment } from '@/lib/types'
import { relativeTime, shortDate } from '@/lib/utils'
import { useAuth } from '@/components/AuthProvider'
import HsmLogo from '@/components/HsmLogo'

export default function BoardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [post, setPost] = useState<BoardPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [id])

  const fetchPost = async () => {
    const { data } = await supabase
      .from('board_posts')
      .select('*, profiles(*)')
      .eq('id', id)
      .single()
    setPost(data)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(*)')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
    const all = data ?? []
    const roots = all.filter((c) => !c.parent_comment_id)
    const withReplies = roots.map((root) => ({
      ...root,
      replies: all.filter((c) => c.parent_comment_id === root.id),
    }))
    setComments(withReplies)
  }

  const submitComment = async () => {
    if (!user || !commentText.trim()) return
    await supabase.from('comments').insert({
      post_id: id,
      author_id: user.id,
      content: commentText,
      parent_comment_id: replyTo?.id ?? null,
    })
    setCommentText('')
    setReplyTo(null)
    fetchComments()
  }

  const updateStatus = async (status: string) => {
    await supabase.from('board_posts').update({ status }).eq('id', id)
    fetchPost()
  }

  const deleteComment = async (commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId)
    fetchComments()
  }

  if (!post) return <div className="text-center py-12 text-gray-400">불러오는 중...</div>

  const isAuthor = user?.id === post.author_id

  return (
    <div className="py-4 space-y-4">
      <div className="card p-5 space-y-4">
        {/* 태그 & 상태 */}
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <span key={tag} className="tag bg-primary-50 text-primary-500">{tag}</span>
          ))}
          <span className={`tag ml-auto ${
            post.status === '진행중' ? 'bg-green-50 text-green-600' :
            post.status === '모집마감' ? 'bg-orange-50 text-orange-600' :
            'bg-gray-100 text-gray-500'
          }`}>{post.status}</span>
        </div>

        {/* 제목 */}
        <h1 className="text-xl font-bold">{post.title}</h1>

        {/* 작성자 & 날짜 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <Link href={`/profile/${post.author_id}`} className="text-primary-500 font-medium hover:underline">
            {(post.profiles as any)?.nickname}
          </Link>
          <span>{shortDate(post.created_at)}</span>
        </div>

        <hr />

        {/* 본문 */}
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>

        {/* 상태 변경 (작성자만) */}
        {isAuthor && (
          <div className="flex gap-2 pt-2">
            {['진행중', '모집마감', '모임완료'].map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  post.status === s
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'border-gray-300 text-gray-500 hover:border-primary-500 hover:text-primary-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 댓글 섹션 */}
      <div className="card p-5 space-y-4">
        <h2 className="font-bold">댓글 {comments.length}개</h2>

        {comments.map((comment) => (
          <div key={comment.id} className="space-y-2">
            <CommentItem
              comment={comment}
              userId={user?.id}
              onReply={() => setReplyTo(comment)}
              onDelete={() => deleteComment(comment.id)}
            />
            {comment.replies?.map((reply) => (
              <div key={reply.id} className="ml-8">
                <CommentItem
                  comment={reply}
                  userId={user?.id}
                  onReply={() => setReplyTo(comment)}
                  onDelete={() => deleteComment(reply.id)}
                />
              </div>
            ))}
          </div>
        ))}

        {/* 댓글 입력 */}
        {user ? (
          <div className="space-y-2 pt-2 border-t">
            {replyTo && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>↩ {(replyTo.profiles as any)?.nickname}에게 답글</span>
                <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-red-400">✕</button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyTo ? '답글 입력...' : '댓글 입력...'}
                className="input flex-1"
                onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              />
              <button onClick={submitComment} className="btn-primary px-4">등록</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center pt-2 border-t">
            <Link href="/auth/login" className="text-primary-500">로그인</Link>하면 댓글을 작성할 수 있어요
          </p>
        )}
      </div>
    </div>
  )
}

function CommentItem({
  comment, userId, onReply, onDelete
}: {
  comment: Comment
  userId?: string
  onReply: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0"><HsmLogo size={22} variant="icon" /></div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Link href={`/profile/${comment.author_id}`} className="text-sm font-medium hover:text-primary-500">
            {(comment.profiles as any)?.nickname}
          </Link>
          <span className="text-xs text-gray-400">{relativeTime(comment.created_at)}</span>
        </div>
        <p className="text-sm text-gray-700">{comment.content}</p>
        <div className="flex gap-3 mt-1">
          <button onClick={onReply} className="text-xs text-gray-400 hover:text-primary-500">답글</button>
          {userId === comment.author_id && (
            <button onClick={onDelete} className="text-xs text-gray-400 hover:text-red-500">삭제</button>
          )}
        </div>
      </div>
    </div>
  )
}
