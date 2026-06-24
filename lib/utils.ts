import { formatDistanceToNow, format } from 'date-fns'
import { ko } from 'date-fns/locale'

export function relativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ko })
}

export function shortDate(dateStr: string): string {
  return format(new Date(dateStr), 'yyyy.MM.dd', { locale: ko })
}

export function meetupDate(dateStr: string): string {
  return format(new Date(dateStr), 'M월 d일 (EEE) HH:mm', { locale: ko })
}

export function getRankTierEmoji(tier: string): string {
  const map: Record<string, string> = {
    '홍어 새내기': '🐟',
    '홍어 애호가': '🦈',
    '홍어 마스터': '👑',
  }
  return map[tier] ?? '🐟'
}
