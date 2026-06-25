type Props = {
  size?: number
  variant?: 'icon' | 'full'
}

export default function HsmLogo({ size = 36, variant = 'full' }: Props) {
  if (variant === 'icon') {
    return (
      <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="36" cy="36" r="34" fill="#E84C3D"/>
        <ellipse cx="33" cy="36" rx="16" ry="9" fill="white"/>
        <polygon points="49,36 58,28 58,44" fill="white"/>
        <circle cx="26" cy="33" r="2" fill="#E84C3D"/>
      </svg>
    )
  }

  // full: 원형 아이콘 + 우측 HSM 텍스트
  const h = size
  const cx = h / 2
  const r = h / 2 - 2
  const scale = h / 48

  return (
    <svg width={size * 3.3} height={h} viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="#E84C3D"/>
      <ellipse cx="22" cy="24" rx="10" ry="6" fill="white"/>
      <polygon points="32,24 39,19 39,29" fill="white"/>
      <circle cx="17" cy="22" r="1.5" fill="#E84C3D"/>
      <text
        x="56" y="31"
        fontFamily="system-ui, sans-serif"
        fontWeight="800"
        fontSize="22"
        letterSpacing="3"
        fill="#1a1a1a"
      >HSM</text>
    </svg>
  )
}
