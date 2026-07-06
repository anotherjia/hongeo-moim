# Vercel 배포 가이드 (무료, 10분)

## 1. Node.js 설치 (이미 있으면 스킵)
https://nodejs.org → LTS 버전 다운로드 및 설치

---

## 2. 프로젝트 실행 테스트 (로컬)

터미널(명령 프롬프트)에서:

```bash
# 이 폴더로 이동
cd hongeo-moim-web

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속하여 확인

---

## 3. GitHub에 올리기

1. https://github.com 가입
2. **New repository** 클릭 → 이름: `hongeo-moim` → **Create**
3. 터미널에서:

```bash
cd hongeo-moim-web

git init
git add .
git commit -m "첫 번째 커밋"
git remote add origin https://github.com/YOUR_USERNAME/hongeo-moim.git
git push -u origin main
```

---

## 4. Vercel 배포

1. https://vercel.com 접속 → GitHub으로 로그인
2. **New Project** → `hongeo-moim` 저장소 선택
3. **Environment Variables** 추가:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://bjrinravcbjmbgelsink.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOi...` (전체 키)
4. **Deploy** 클릭

배포 완료 후 `https://hongeo-moim.vercel.app` 형태의 URL 발급됨 🎉

---

## 5. Supabase 인증 URL 설정

Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://hongeo-moim.vercel.app`
- **Redirect URLs**: `https://hongeo-moim.vercel.app/auth/callback`

---

## 나중에 모바일 앱으로 전환하려면?

웹 코드를 그대로 활용하는 방법:
- **React Native + Expo**: JS/TS 코드 일부 재사용, Supabase SDK 그대로 사용 가능
- **Capacitor**: Next.js 웹을 그대로 iOS/Android 앱으로 래핑 (가장 빠름)

Supabase DB/Auth는 웹이든 앱이든 동일하게 사용하므로 데이터는 공유됩니다.
