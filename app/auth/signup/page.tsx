'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const isValid =
    email && password.length >= 8 && password === confirm &&
    nickname.length >= 2 && nickname.length <= 20

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError || !data.user) {
      setError('회원가입에 실패했습니다. 이미 사용 중인 이메일일 수 있습니다.')
      setLoading(false)
      return
    }

    // profiles 테이블에 레코드 생성
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      nickname,
    })

    if (profileError) {
      setError('프로필 생성에 실패했습니다.')
      setLoading(false)
      return
    }

    alert('가입 완료! 이메일 인증 링크를 확인해주세요.')
    router.push('/auth/login')
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🦈</div>
          <h1 className="text-2xl font-bold">회원가입</h1>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="2~20자"
              className="input"
              maxLength={20}
            />
            {nickname && (nickname.length < 2 || nickname.length > 20) && (
              <p className="text-red-500 text-xs mt-1">닉네임은 2~20자여야 합니다</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상"
              className="input"
            />
            {password && password.length < 8 && (
              <p className="text-red-500 text-xs mt-1">비밀번호는 8자 이상이어야 합니다</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="비밀번호 재입력"
              className="input"
            />
            {confirm && password !== confirm && (
              <p className="text-red-500 text-xs mt-1">비밀번호가 일치하지 않습니다</p>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={!isValid || loading}
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="text-primary-500 font-medium">로그인</Link>
        </p>
      </div>
    </div>
  )
}
