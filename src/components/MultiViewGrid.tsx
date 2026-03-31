import React, { useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Player from './Player';

const MultiViewGrid: React.FC = () => {
  const { selectedChannels, mainChannelId, layoutMode, setLayoutMode, setMainChannel } = useStore();
  
  const safeSelected = Array.isArray(selectedChannels) ? selectedChannels : [];

  // 자동 레이아웃 방어 코드: 5개 이상일 때 강제로 집중 뷰로 전환
  useEffect(() => {
    if (safeSelected.length >= 5 && layoutMode !== 'main-sub') {
      setLayoutMode('main-sub');
      // 집중 뷰 전환 시 메인 채널이 없으면 리스트 첫번째 채널을 메인으로 자동 배정
      if (!mainChannelId || !safeSelected.includes(mainChannelId)) {
        setMainChannel(safeSelected[0]);
      }
    }
  }, [safeSelected, layoutMode, mainChannelId, setLayoutMode, setMainChannel]);

  // 채널이 1개일 땐 사용자가 main-sub 모드라고 하더라도 무조건 화면을 가득 채우는 Grid 모드로 인터페이스 고정
  const effectiveLayoutMode = safeSelected.length === 1 ? 'grid' : layoutMode;

  const gridClass = useMemo(() => {
    const length = safeSelected.length;
    if (length === 0) return 'flex flex-1 items-center justify-center';
    if (length === 1) return 'grid grid-cols-1 w-full h-full';
    if (length === 2) return 'grid grid-cols-2 w-full h-full';
    if (length <= 4) return 'grid grid-cols-2 grid-rows-2 w-full h-full';
    if (length <= 6) return 'grid grid-cols-3 grid-rows-2 w-full h-full';
    return 'grid grid-cols-3 grid-rows-3 w-full h-full';
  }, [safeSelected.length]);

  if (safeSelected.length === 0) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-transparent text-[#BCA5FF] relative overflow-hidden h-full w-full">
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

  // ✨ Main-Sub 레이아웃 분기
  if (effectiveLayoutMode === 'main-sub' && mainChannelId && safeSelected.includes(mainChannelId)) {
    const subChannels = safeSelected.filter((id) => id !== mainChannelId);
    
    return (
      <main className="flex-1 flex flex-col xl:flex-row bg-transparent h-full w-full overflow-hidden p-2 gap-2">
        {/* 1. 좌측 거대한 메인 시야 영역 (너비 75% 비율 => flex-[3]) */}
        <div className="flex-[3] h-full w-full relative">
          <Player channelId={mainChannelId} isMain={true} />
        </div>
        
        {/* 2. 우측 좁은 서브 시야 영역 (너비 25% 비율 => flex-[1], 세로 스크롤 리스트) */}
        {subChannels.length > 0 && (
          <div className="flex-[1] h-full w-full overflow-hidden bg-[#0A0514]/30 rounded-lg border border-white/5 p-1.5 shadow-inner relative flex flex-col">
            <div className="flex flex-col gap-2 h-full w-full overflow-y-auto custom-scrollbar pr-1 pb-1">
              {subChannels.map((channelId) => (
                <div key={channelId} className="w-full h-1/2 min-h-[300px] shrink-0">
                  <Player channelId={channelId} isMain={false} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    );
  }

  // ⏹️ 기본 등분할 Grid 레이아웃 (layout === 'grid' 거나 메인 채널이 지정 안 된 경우)
  return (
    <main className="flex-1 h-full w-full p-2 bg-transparent overflow-hidden">
      <div className={`${gridClass} gap-2 h-full w-full`}>
        {safeSelected.map((channelId) => (
          <Player key={channelId} channelId={channelId} isMain={channelId === mainChannelId} />
        ))}
      </div>
    </main>
  );
};

export default MultiViewGrid;
