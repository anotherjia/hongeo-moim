export type Profile = {
  id: string
  nickname: string
  profile_image_url: string | null
  preferred_hongeo_style: string | null
  activity_score: number
  rank_tier: string
  created_at: string
}

export type Club = {
  id: string
  name: string
  description: string | null
  profile_image_url: string | null
  owner_id: string
  min_members: number
  max_members: number
  created_at: string
  member_count?: number
}

export type ClubMember = {
  club_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
  profiles?: Profile
}

export type Restaurant = {
  id: string
  club_id: string
  recorded_by: string
  name: string
  address: string | null
  rating: number
  review: string | null
  photo_urls: string[]
  visited_at: string | null
  created_at: string
}

export type MeetupSchedule = {
  id: string
  club_id: string
  created_by: string
  restaurant_id: string | null
  scheduled_at: string
  location_name: string | null
  agenda: string | null
  created_at: string
  updated_at: string
}

export type BoardPost = {
  id: string
  author_id: string
  title: string
  content: string
  tags: string[]
  status: '진행중' | '모집마감' | '모임완료'
  image_urls: string[]
  created_at: string
  profiles?: Profile
  comment_count?: number
}

export type Comment = {
  id: string
  post_id: string
  author_id: string
  parent_comment_id: string | null
  content: string
  created_at: string
  profiles?: Profile
  replies?: Comment[]
}

export type DirectMessage = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  profiles?: Profile
}

export type AppNotification = {
  id: string
  user_id: string
  type: 'invite' | 'schedule_change' | 'comment' | 'message' | 'badge'
  title: string | null
  body: string | null
  is_read: boolean
  related_id: string | null
  created_at: string
}

export type Badge = {
  id: string
  user_id: string
  badge_type: string
  earned_at: string
}

export const POST_TAGS = ['모집중', '새소모임제안', '정보공유', '후기'] as const
export type PostTag = typeof POST_TAGS[number]

export const RANK_TIERS = {
  '홍어 새내기': { min: 0, max: 99, emoji: '🐟' },
  '홍어 애호가': { min: 100, max: 299, emoji: '🦈' },
  '홍어 마스터': { min: 300, max: Infinity, emoji: '👑' },
}

export const BADGE_INFO: Record<string, { emoji: string; desc: string }> = {
  '첫모임': { emoji: '🎉', desc: '첫 소모임 참여' },
  '맛집탐방가': { emoji: '🍽️', desc: '맛집 10곳 기록' },
  '게시판스타': { emoji: '⭐', desc: '게시글 10개 작성' },
  '소통왕': { emoji: '💬', desc: '댓글 50개 작성' },
}
