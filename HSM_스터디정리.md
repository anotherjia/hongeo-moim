# HSM 바이브 코딩 스터디 정리

> 홍어를 좋아하는 사람들의 소셜 커뮤니티 앱 **HSM(홍어소모임)** 을 처음부터 직접 만들어본 스터디 기록

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | HSM (홍어소모임) |
| 서비스 유형 | 소셜 커뮤니티 웹앱 (모바일 우선) |
| 개발 방식 | 바이브 코딩 (AI 페어 프로그래밍) |
| 개발 도구 | Claude Cowork 모드 |
| 결과물 | 웹앱 (Vercel 배포 완료) |

### 주요 기능
- 회원가입 / 로그인 (이메일 인증)
- 전체 게시판 (태그 필터, 댓글/대댓글)
- 소모임 생성 및 채널 (맛집 기록 / 일정 / 멤버)
- 맛집 기록 + 카카오 지도 주소 검색 및 미리보기
- 1:1 다이렉트 메시지 (실시간)
- 알림 센터
- 활동 점수 기반 랭킹 시스템
- 뱃지 시스템

---

## 2. 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js | 15.x |
| 언어 | TypeScript | 5.x |
| 스타일링 | Tailwind CSS | 3.x |
| 백엔드/DB | Supabase | - |
| 인증 | Supabase Auth | - |
| 실시간 | Supabase Realtime | - |
| 지도 API | 카카오 지도 API | - |
| 배포 | Vercel | - |
| 버전 관리 | Git + GitHub | - |

---

## 3. 플랫폼별 설정

### Supabase

**프로젝트 생성**
- URL: `https://vntzcyugofmjivpsnfzm.supabase.co`
- 인증 방식: 이메일/패스워드
- Email Confirm: 테스트 단계에서 OFF (Authentication → Providers → Email)

**생성한 테이블**

| 테이블명 | 용도 |
|---------|------|
| `profiles` | 유저 프로필 (닉네임, 활동점수, 랭크) |
| `clubs` | 소모임 정보 |
| `club_members` | 소모임 멤버 관계 |
| `restaurants` | 소모임별 맛집 기록 |
| `meetup_schedules` | 소모임 일정 |
| `board_posts` | 게시판 글 |
| `comments` | 댓글/대댓글 |
| `direct_messages` | 1:1 메시지 |
| `notifications` | 알림 |
| `badges` | 뱃지 |

**RLS(Row Level Security) 정책 적용**
- 모든 테이블에 RLS 활성화
- 기본 원칙: 누구나 조회 / 본인만 수정·삭제
- profiles INSERT 정책: `with check (true)` (회원가입 직후 세션 생성 전 삽입 허용)

**트러블슈팅**
- 회원가입 실패 원인: `handle_new_user` 트리거가 nickname NOT NULL 제약 위반 → 트리거 삭제 후 코드에서 직접 삽입으로 해결
- profiles INSERT 정책 누락 → 정책 추가로 해결

---

### 카카오 지도 API

**발급 경로**
- https://developers.kakao.com → 내 애플리케이션 → 앱 추가
- **JavaScript 키** 사용

**플랫폼 등록**
- 개발: `http://localhost:3000`
- 운영: Vercel 배포 URL (예: `https://hongeo-moim.vercel.app`)

**사용한 기능**
- Daum Postcode API (주소 검색 팝업) — API 키 불필요
- Kakao Maps SDK (좌표 변환 + 지도 미리보기) — JavaScript 키 필요

**로드 방식**
```js
// 주소 검색 (Daum Postcode)
<script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js">

// 지도 미리보기 (Kakao Maps)
<script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey={JS_KEY}&libraries=services">
```

---

### Vercel 배포

**연동 방법**
1. GitHub 저장소 생성 후 코드 push
2. vercel.com → GitHub 계정 연동 → 저장소 선택
3. 환경변수 3개 설정 후 Deploy

**환경변수 설정값**

| 변수명 | 값 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_KAKAO_KEY` | 카카오 JavaScript 키 |

**배포 후 추가 설정**
- Supabase → Authentication → URL Configuration → Site URL에 Vercel URL 등록
- 카카오 개발자 콘솔 → 플랫폼 → Web → Vercel URL 추가

---

## 4. 프로젝트 파일 구조

```
hongeo-moim-web/
├── app/
│   ├── page.tsx              # 홈 피드
│   ├── layout.tsx            # 공통 레이아웃 + 하단 탭바
│   ├── globals.css           # 전역 스타일
│   ├── auth/
│   │   ├── login/            # 로그인
│   │   └── signup/           # 회원가입
│   ├── board/
│   │   ├── page.tsx          # 게시판 목록
│   │   ├── create/           # 글 작성
│   │   └── [id]/             # 게시글 상세 + 댓글
│   ├── clubs/
│   │   ├── page.tsx          # 내 소모임 목록
│   │   ├── create/           # 소모임 생성
│   │   └── [id]/
│   │       ├── page.tsx      # 소모임 채널 (맛집/일정/멤버)
│   │       ├── restaurant/create/  # 맛집 기록 + 카카오 지도
│   │       └── schedule/create/    # 일정 생성
│   ├── messages/
│   │   ├── page.tsx          # 대화 목록
│   │   └── [userId]/         # 1:1 채팅 (실시간)
│   ├── notifications/        # 알림 센터
│   ├── profile/
│   │   ├── page.tsx          # 내 프로필
│   │   ├── edit/             # 프로필 수정
│   │   └── [userId]/         # 타 유저 프로필
│   └── ranking/              # 랭킹 순위
├── components/
│   ├── AuthProvider.tsx       # 인증 상태 전역 관리 (React Context)
│   ├── Navbar.tsx             # 상단 네비게이션
│   ├── HsmLogo.tsx            # HSM 로고 컴포넌트 (icon / full)
│   └── LoadingScreen.tsx      # 인증 로딩 화면
├── lib/
│   ├── supabase.ts            # Supabase 클라이언트
│   ├── types.ts               # TypeScript 타입 정의
│   └── utils.ts               # 날짜 포맷 유틸
├── .env.local                 # 환경변수 (로컬용, git 제외)
├── .gitignore
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 5. 랭킹 시스템

| 등급 | 조건 |
|------|------|
| 🐟 홍어 새내기 | 0 ~ 99점 |
| 🦈 홍어 애호가 | 100 ~ 299점 |
| 👑 홍어 마스터 | 300점 이상 |

**활동 점수 기준**

| 활동 | 점수 |
|------|------|
| 게시글 작성 | +10점 |
| 댓글 작성 | +3점 |
| 소모임 참여 | +20점 |
| 맛집 기록 | +15점 |

---

## 6. 트러블슈팅 모음

| 문제 | 원인 | 해결 |
|------|------|------|
| `Module not found: @/components/AuthProvider` | tsconfig.json path alias 누락 | `"paths": { "@/*": ["./*"] }` 추가 |
| `Can't resolve './addMinutes.mjs'` | date-fns v2 + v3 혼재 | date-fns 제거, 네이티브 JS로 대체 |
| 회원가입 실패 | DB 트리거가 nickname NOT NULL 위반 | 트리거 삭제 |
| 프로필 생성 실패 | profiles INSERT RLS 정책 없음 | `with check (true)` 정책 추가 |
| 소모임 생성 실패 | 컬럼명 불일치 (`owner_id` vs `created_by`) | 코드 컬럼명 수정 |
| Vercel 빌드 실패 | Next.js 14.2.5 보안 취약점 버그 | Next.js 15로 업그레이드 |
| 카카오 지도 로딩 실패 | Daum Postcode와 Maps SDK 혼용 타이밍 문제 | 두 스크립트를 분리해서 각각 로드 |
| `MapIterator` 타입 에러 | ES2015 미만 타겟 설정 | `[...map.values()]` → `map.forEach()` 로 대체 |

---

## 7. 로컬 개발 실행 방법

```bash
# 프로젝트 폴더로 이동
cd "C:\02. code\hongeo-moim-web"

# 패키지 설치 (최초 1회)
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

> 터미널을 닫으면 서버도 꺼짐. 브라우저 사용 중에는 터미널 유지 필요.

---

## 8. 배포 업데이트 방법

```bash
git add .
git commit -m "변경 내용 설명"
git push
```

push 완료 시 Vercel이 자동으로 재배포 시작.
