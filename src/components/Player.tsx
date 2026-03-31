import React from 'react';

interface PlayerProps {
  channelId: string;
}

const Player: React.FC<PlayerProps> = ({ channelId }) => {
  return (
    <div className="relative w-full h-full bg-[#0A0514] rounded-lg overflow-hidden border border-white/10 shadow-[0_4px_30px_rgba(139,92,246,0.15)] transition-all duration-300">
      {/* 치지직 공식 iframe 로드 */}
      <iframe
        src={`https://chzzk.naver.com/live/${channelId}/iframe?autoplay=true&muted=true&target=browser`}
        title={`Stelview Player - ${channelId}`}
        allow="autoplay; fullscreen"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full border-none object-cover"
      />
    </div>
  );
};

export default Player;
