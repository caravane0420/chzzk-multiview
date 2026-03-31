import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import Player from './Player';

const MultiViewGrid: React.FC = () => {
  const { selectedChannels } = useStore();

  const gridClass = useMemo(() => {
    const length = selectedChannels.length;
    if (length === 0) return 'flex flex-1 items-center justify-center';
    if (length === 1) return 'grid grid-cols-1 w-full h-full';
    if (length === 2) return 'grid grid-cols-2 w-full h-full';
    if (length <= 4) return 'grid grid-cols-2 grid-rows-2 w-full h-full';
    if (length <= 6) return 'grid grid-cols-3 grid-rows-2 w-full h-full';
    return 'grid grid-cols-3 grid-rows-3 w-full h-full'; // Default fallback for many
  }, [selectedChannels.length]);

  if (selectedChannels.length === 0) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-[#0e0e11] text-gray-500 text-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 blur-3xl rounded-full bg-gradient-to-tr from-[#00FF87] to-blue-500 scale-150 mix-blend-screen animate-pulse" />
        <p className="z-10 font-semibold tracking-wide" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          사이드바에서 시청할 채널을 선택해주세요.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 bg-[#0e0e11] h-screen overflow-hidden">
      <div className={`${gridClass} gap-4`}>
        {selectedChannels.map((channelId) => (
          <Player key={channelId} channelId={channelId} />
        ))}
      </div>
    </main>
  );
};

export default MultiViewGrid;
