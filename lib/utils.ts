export function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}일 전`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}달 전`
  return `${Math.floor(months / 12)}년 전`
}

export function shortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토']

export function meetupDate(dateStr: string): string {
  const d = new Date(dateStr)
  const day = DAYS_KO[d.getDay()]
  const month = d.getMonth() + 1
  const date = d.getDate()
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${month}월 ${date}일 (${day}) ${hour}:${min}`
}

export function getRankTierEmoji(tier: string): string {
  const map: Record<string, string> = {
    '홍어 새내기': '🐟',
    '홍어 애호가': '🦈',
    '홍어 마스터': '👑',
  }
  return map[tier] ?? '🐟'
}
