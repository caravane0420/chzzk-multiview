import React from 'react';

interface PlayerProps {
  channelId: string;
}

const Player: React.FC<PlayerProps> = ({ channelId }) => {
  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300">
      {/* 치지직 공식 iframe 로드 */}
      <iframe
        src={`https://chzzk.naver.com/live/${channelId}/iframe?autoplay=true&muted=true&target=browser`}
        title={`Chzzk Player - ${channelId}`}
        width="100%"
        height="100%"
        allow="autoplay; fullscreen"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full border-none"
      />
    </div>
  );
};

export default Player;
