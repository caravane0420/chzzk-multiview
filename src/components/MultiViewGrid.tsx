import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import Player from './Player';

const MultiViewGrid: React.FC = () => {
  const selectedChannels = useStore((state) => state.selectedChannels);
  
  const safeSelected = Array.isArray(selectedChannels) ? selectedChannels : [];

  const gridClass = useMemo(() => {
    const length = safeSelected.length;
    if (length === 0) return 'flex flex-1 items-center justify-center';
    if (length === 1) return 'grid grid-cols-1 grid-rows-1 w-full h-full';
    if (length === 2) return 'grid grid-cols-2 grid-rows-1 w-full h-full';
    if (length <= 4) return 'grid grid-cols-2 grid-rows-2 w-full h-full';
    if (length <= 6) return 'grid grid-cols-3 grid-rows-2 w-full h-full';
    return 'grid grid-cols-3 grid-rows-3 w-full h-full';
  }, [safeSelected.length]);

  if (safeSelected.length === 0) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-transparent text-[#BCA5FF] relative overflow-hidden h-screen w-full">
        <div className="absolute inset-0 opacity-20 blur-[120px] rounded-full bg-gradient-to-tr from-[#6D28D9] via-[#4C1D95] to-[#1E3A8A] scale-150 mix-blend-screen animate-pulse" />
        <h1 className="z-10 text-5xl md:text-6xl font-black tracking-tighter bg-gradient-to-br from-[#F3E8FF] via-[#D8B4FE] to-[#9333EA] bg-clip-text text-transparent mb-6 drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
          스텔라이브 전용 멀티뷰, 스텔뷰
        </h1>
        <p className="z-10 font-bold tracking-wide text-[#E9D5FF]/90 text-xl md:text-2xl" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.8)' }}>
          사이드바에서 시청을 원하는 스텔라이브 멤버를 선택해주세요 ✨
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 h-full w-full p-2 bg-transparent overflow-hidden">
      <div className={`${gridClass} gap-2 h-full w-full`}>
        {safeSelected.map((channelId) => (
          <Player key={channelId} channelId={channelId} />
        ))}
      </div>
    </main>
  );
};

export default MultiViewGrid;
