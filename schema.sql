-- ============================================================
-- 홍어 모임(HSM) 웹앱 — Supabase 스키마 재구성 스크립트
-- 기존 프로젝트(vntzcyugofmjivpsnfzm)가 삭제되어, 코드베이스(app/, lib/)에서
-- 실제로 사용 중인 테이블/컬럼/쿼리 패턴을 역추적해 재작성했습니다.
-- 새 프로젝트의 SQL Editor에서 전체를 한 번에 실행하세요.
-- ============================================================

-- 확장 기능
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. profiles (auth.users 1:1 확장 테이블)
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  profile_image_url text,
  preferred_hongeo_style text,
  activity_score integer not null default 0,
  rank_tier text not null default '홍어 새내기',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. clubs (소모임)
--    * 코드(app/clubs/create/page.tsx)는 owner_id가 아니라 created_by 컬럼에 insert합니다.
-- ------------------------------------------------------------
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  profile_image_url text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  min_members integer not null default 2,
  max_members integer not null default 10,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. club_members
-- ------------------------------------------------------------
create table public.club_members (
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

-- ------------------------------------------------------------
-- 4. restaurants (맛집 기록)
-- ------------------------------------------------------------
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  recorded_by uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  address text,
  rating integer not null default 3 check (rating between 1 and 5),
  review text,
  photo_urls text[] not null default '{}',
  visited_at timestamptz,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5. meetup_schedules (모임 일정)
-- ------------------------------------------------------------
create table public.meetup_schedules (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  restaurant_id uuid references public.restaurants(id) on delete set null,
  scheduled_at timestamptz not null,
  location_name text,
  agenda text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 6. board_posts (게시판)
-- ------------------------------------------------------------
create table public.board_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  tags text[] not null default '{}',
  status text not null default '진행중' check (status in ('진행중', '모집마감', '모임완료')),
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7. comments (게시글 댓글 / 대댓글)
-- ------------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.board_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 8. direct_messages (1:1 쪽지)
-- ------------------------------------------------------------
create table public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 9. notifications (알림)
-- ------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('invite', 'schedule_change', 'comment', 'message', 'badge')),
  title text,
  body text,
  is_read boolean not null default false,
  related_id uuid,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 10. badges (뱃지)
-- ------------------------------------------------------------
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_type text not null,
  earned_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 인덱스
-- ------------------------------------------------------------
create index idx_club_members_user_id on public.club_members(user_id);
create index idx_restaurants_club_id on public.restaurants(club_id);
create index idx_meetup_schedules_club_id on public.meetup_schedules(club_id);
create index idx_board_posts_author_id on public.board_posts(author_id);
create index idx_board_posts_created_at on public.board_posts(created_at desc);
create index idx_comments_post_id on public.comments(post_id);
create index idx_direct_messages_sender_id on public.direct_messages(sender_id);
create index idx_direct_messages_receiver_id on public.direct_messages(receiver_id);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_badges_user_id on public.badges(user_id);

-- ------------------------------------------------------------
-- RLS 활성화
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.restaurants enable row level security;
alter table public.meetup_schedules enable row level security;
alter table public.board_posts enable row level security;
alter table public.comments enable row level security;
alter table public.direct_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.badges enable row level security;

-- profiles: 랭킹/프로필 화면은 비로그인 상태에서도 조회하므로 전체 공개, 본인만 쓰기
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);

-- clubs: 전체 공개 조회, 생성자만 생성/수정/삭제
create policy "clubs_select_all" on public.clubs for select using (true);
create policy "clubs_insert_self" on public.clubs for insert with check (auth.uid() = created_by);
create policy "clubs_update_owner" on public.clubs for update using (auth.uid() = created_by);
create policy "clubs_delete_owner" on public.clubs for delete using (auth.uid() = created_by);

-- club_members: 전체 공개 조회(멤버 목록 표시), 본인 가입/탈퇴, 관리자는 멤버 관리
create policy "club_members_select_all" on public.club_members for select using (true);
create policy "club_members_insert_self_or_admin" on public.club_members for insert
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.club_members m
      where m.club_id = club_members.club_id and m.user_id = auth.uid() and m.role = 'admin'
    )
  );
create policy "club_members_delete_self_or_admin" on public.club_members for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.club_members m
      where m.club_id = club_members.club_id and m.user_id = auth.uid() and m.role = 'admin'
    )
  );
create policy "club_members_update_admin" on public.club_members for update
  using (
    exists (
      select 1 from public.club_members m
      where m.club_id = club_members.club_id and m.user_id = auth.uid() and m.role = 'admin'
    )
  );

-- restaurants: 전체 공개 조회, 작성자만 쓰기
create policy "restaurants_select_all" on public.restaurants for select using (true);
create policy "restaurants_insert_self" on public.restaurants for insert with check (auth.uid() = recorded_by);
create policy "restaurants_update_self" on public.restaurants for update using (auth.uid() = recorded_by);
create policy "restaurants_delete_self" on public.restaurants for delete using (auth.uid() = recorded_by);

-- meetup_schedules: 전체 공개 조회, 작성자만 쓰기
create policy "meetup_schedules_select_all" on public.meetup_schedules for select using (true);
create policy "meetup_schedules_insert_self" on public.meetup_schedules for insert with check (auth.uid() = created_by);
create policy "meetup_schedules_update_self" on public.meetup_schedules for update using (auth.uid() = created_by);
create policy "meetup_schedules_delete_self" on public.meetup_schedules for delete using (auth.uid() = created_by);

-- board_posts: 전체 공개 조회, 작성자만 쓰기
create policy "board_posts_select_all" on public.board_posts for select using (true);
create policy "board_posts_insert_self" on public.board_posts for insert with check (auth.uid() = author_id);
create policy "board_posts_update_self" on public.board_posts for update using (auth.uid() = author_id);
create policy "board_posts_delete_self" on public.board_posts for delete using (auth.uid() = author_id);

-- comments: 전체 공개 조회, 작성자만 쓰기/삭제
create policy "comments_select_all" on public.comments for select using (true);
create policy "comments_insert_self" on public.comments for insert with check (auth.uid() = author_id);
create policy "comments_delete_self" on public.comments for delete using (auth.uid() = author_id);

-- direct_messages: 보낸/받은 사람만 조회, 본인이 보낸 것만 insert, 받은 사람만 읽음처리 update
create policy "dm_select_participant" on public.direct_messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "dm_insert_self" on public.direct_messages for insert with check (auth.uid() = sender_id);
create policy "dm_update_receiver" on public.direct_messages for update using (auth.uid() = receiver_id);

-- notifications: 본인 알림만 조회/수정, 로그인 사용자는 생성 가능(추후 알림 발송 기능용)
create policy "notifications_select_self" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications_insert_authenticated" on public.notifications for insert with check (auth.uid() is not null);
create policy "notifications_update_self" on public.notifications for update using (auth.uid() = user_id);

-- badges: 전체 공개 조회(프로필 화면에 노출), 쓰기는 서비스 역할(백엔드)에서만 — 별도 insert 정책 없음
create policy "badges_select_all" on public.badges for select using (true);

-- ============================================================
-- 참고
-- 1) lib/types.ts의 Club 타입은 owner_id로 되어 있지만 실제 코드(clubs/create)는
--    created_by 컬럼에 insert합니다. 이 스크립트는 실제 동작 코드 기준(created_by)으로
--    작성했습니다. 타입을 owner_id로 맞추고 싶다면 이 스크립트의 created_by를 모두
--    owner_id로 바꾸거나, lib/types.ts 쪽을 created_by로 수정하세요.
-- 2) 이미지 업로드(Storage) 기능은 코드상 아직 구현되어 있지 않아(모두 텍스트 URL 필드)
--    Storage 버킷은 생성하지 않았습니다. 추후 프로필/게시글/맛집 사진 업로드 기능을
--    추가할 때 별도로 버킷과 정책이 필요합니다.
-- 3) badges, notifications 자동 생성(활동점수 증가, 뱃지 지급 등) 로직은 기존 코드에서
--    발견되지 않아 트리거를 추가하지 않았습니다. 필요하면 별도로 작성해 드릴 수 있습니다.
-- ============================================================
