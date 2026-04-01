import React, { useMemo } from 'react';

interface PlayerProps {
  channelId: string;
}

const Player: React.FC<PlayerProps> = ({ channelId }) => {
  const iframeSrc = useMemo(() => {
    return `https://chzzk.naver.com/live/${channelId}`;
  }, [channelId]);

  return (
    <div className="w-full h-full bg-[#0A0514] rounded-lg overflow-hidden border border-white/10 shadow-[0_4px_30px_rgba(139,92,246,0.15)] hover:border-[#8B5CF6]/50 transition-all duration-300">
      <iframe
        src={iframeSrc}
        title={`Stelview Player - ${channelId}`}
        allow="autoplay; fullscreen"
        allowFullScreen
        className="w-full h-full border-none object-cover pointer-events-auto"
      />
    </div>
  );
};

export default Player;
