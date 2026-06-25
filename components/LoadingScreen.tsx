'use client'

import HsmLogo from './HsmLogo'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]">
      <div className="flex flex-col items-center gap-6">
        {/* 로고 */}
        <div className="flex flex-col items-center gap-3">
          <HsmLogo size={72} variant="icon" />
          <span className="text-sm font-medium text-gray-500">불러오는 중...</span>
        </div>

        {/* 로딩바 */}
        <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full animate-loading-bar" />
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0%; }
          40% { width: 60%; margin-left: 10%; }
          70% { width: 30%; margin-left: 60%; }
          100% { width: 0%; margin-left: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
