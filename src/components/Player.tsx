import React from 'react';
import { useStore } from '../store/useStore';
import { Star } from 'lucide-react';

interface PlayerProps {
  channelId: string;
  isMain?: boolean;
}

const Player: React.FC<PlayerProps> = ({ channelId, isMain = false }) => {
  const setMainChannel = useStore((state) => state.setMainChannel);

  return (
    <div 
      className={`relative w-full h-full bg-[#0A0514] rounded-lg overflow-hidden border transition-all duration-300 group shadow-lg ${
        isMain 
          ? 'border-[#D8B4FE] ring-2 ring-[#A855F7] shadow-[0_0_25px_rgba(168,85,247,0.4)] z-10' 
          : 'border-white/10 shadow-[0_4px_30px_rgba(139,92,246,0.15)] hover:border-[#8B5CF6]/50'
      }`}
    >
      <iframe
        src={`https://chzzk.naver.com/live/${channelId}`}
        title={`Stelview Player - ${channelId}`}
        allow="autoplay; fullscreen"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full border-none object-cover"
      />
      
      {/* 메인 채널 지정 오버레이 버튼 (마우스 호버 시 표시되거나 메인이면 항상 빛나게 표시) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMainChannel(isMain ? null : channelId); // 이미 메인이면 해제, 아니면 이 채널을 메인으로 등록
        }}
        className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all z-20 ${
          isMain 
            ? 'bg-[#A855F7]/90 text-white shadow-[0_0_15px_rgba(168,85,247,0.8)] opacity-100 scale-110' 
            : 'bg-black/40 text-white/50 hover:bg-[#8B5CF6]/70 hover:text-white hover:shadow-[0_0_10px_rgba(139,92,246,0.5)] opacity-0 group-hover:opacity-100 scale-100'
        }`}
        title={isMain ? "메인 화면에서 해제하기" : "이 채널을 메인 화면으로 고정"}
      >
        <Star size={20} fill={isMain ? "currentColor" : "none"} />
      </button>
    </div>
  );
};

export default Player;
