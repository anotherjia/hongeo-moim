# Supabase DB 재연동 작업 정리

## 상황

기존 Supabase 프로젝트(`vntzcyugofmjivpsnfzm`)가 삭제되어 DB가 사라짐. 로컬 저장소에 스키마 백업(migration, schema.sql 등)이 없어, 코드베이스(`app/`, `lib/`)에서 실제 사용 중인 테이블/컬럼/쿼리 패턴을 역추적해 스키마를 재구성함.

## 새 Supabase 프로젝트

- URL: `https://bjrinravcbjmbgelsink.supabase.co`
- anon key: 새로 발급받은 값으로 교체 완료

## 완료한 작업

1. **스키마 분석 및 재작성**
   - `app/`, `lib/types.ts` 전체를 훑어 실제 사용 중인 테이블 10개(profiles, clubs, club_members, restaurants, meetup_schedules, board_posts, comments, direct_messages, notifications, badges) 확인
   - 테이블 정의, 외래키, 인덱스, RLS(Row Level Security) 정책까지 포함한 `schema.sql` 작성 → 프로젝트 폴더에 저장
   - 발견된 불일치: `lib/types.ts`의 `Club` 타입은 `owner_id`로 정의되어 있으나, 실제 코드(`app/clubs/create/page.tsx`)는 `created_by` 컬럼에 insert함. 스키마는 실제 동작 코드(`created_by`) 기준으로 작성
   - 이미지 업로드(Storage) 기능은 코드상 미구현(전부 텍스트 URL 필드)이라 Storage 버킷은 생성하지 않음

2. **환경변수 갱신**
   - `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 새 프로젝트 값으로 교체
   - `VERCEL_배포가이드.md`의 예시 URL도 새 값으로 갱신

3. **배포 가이드 안내**
   - 로컬 테스트 → GitHub push → Vercel 연결 → 환경변수 등록 → Supabase Auth URL 설정 순서 안내
   - 이미 GitHub/Vercel에 연결되어 있던 상황이라, 로컬 폴더를 기존 원격 저장소에 연결하는 방법(`git remote`, `git fetch`, `git reset --mixed origin/main` 등) 안내
   - **중요**: `.env.local`은 `.gitignore`에 포함되어 git push로는 절대 전달되지 않음 → Vercel 프로젝트의 Environment Variables에서 직접 값을 바꾸고, **Redeploy를 별도로 실행**해야 실제 배포본에 반영됨 (환경변수 저장만으로는 이미 빌드된 배포에 적용되지 않음)

## 남은 확인사항 / 다음 단계

- [ ] 새 Supabase 프로젝트의 **SQL Editor**에서 `schema.sql` 실행 여부 확인
- [ ] Vercel **Environment Variables**가 새 URL/anon key로 되어 있는지 확인
- [ ] 값 변경 후 Vercel에서 **Redeploy** 실행 여부 확인
- [ ] Supabase **Authentication → URL Configuration**에서 Site URL / Redirect URL을 Vercel 배포 주소로 설정했는지 확인
- [ ] 배포된 사이트에서 회원가입 재테스트 → 실패 시 브라우저 F12 → Network 탭에서 `signup` 요청의 실제 응답 확인

## 참고 파일 위치

- `schema.sql` — 새 프로젝트에 실행할 전체 스키마
- `.env.local` — 로컬 개발용 Supabase 접속 정보 (git에는 올라가지 않음)
- `VERCEL_배포가이드.md` — 배포 절차 문서
