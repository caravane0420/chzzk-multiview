import React from 'react';

interface PlayerProps {
  channelId: string;
}

const Player: React.FC<PlayerProps> = ({ channelId }) => {
  return (
    <div className="relative w-full h-full bg-[#0A0514] rounded-xl overflow-hidden shadow-[0_4px_30px_rgba(139,92,246,0.15)] border border-[#8B5CF6]/30 transition-all duration-300 group">
      {/* 치지직 공식 iframe 로드 */}
      <iframe
        src={`https://chzzk.naver.com/live/${channelId}/iframe?autoplay=true&muted=true&target=browser`}
        title={`Stelview Player - ${channelId}`}
        allow="autoplay; fullscreen"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full border-none"
      />
    </div>
  );
};

export default Player;
