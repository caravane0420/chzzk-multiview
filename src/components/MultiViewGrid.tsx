import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import Player from './Player';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const MultiViewGrid: React.FC = () => {
  const { selectedChannels, gridLayouts, setGridLayouts } = useStore();
  const safeSelected = Array.isArray(selectedChannels) ? selectedChannels : [];

  const defaultLayout = useMemo(() => {
    return safeSelected.map((channelId, index) => {
      const existing = gridLayouts.find((l) => l.i === channelId);
      if (existing) return existing;
      return {
        i: channelId,
        x: (index % 3) * 4,
        y: Math.floor(index / 3) * 4,
        w: 4,
        h: 3,
        minW: 2,
        minH: 2
      };
    });
  }, [safeSelected, gridLayouts]);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setGridLayouts(newLayout);
  };

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

  return (
    <main className="flex-1 h-full w-full bg-transparent overflow-y-auto overflow-x-hidden custom-scrollbar relative p-2">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: defaultLayout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        isResizable={true}
        margin={[8, 8]}
        containerPadding={[0, 0]}
      >
        {safeSelected.map((channelId) => (
          <div key={channelId} className="group flex flex-col w-full h-full relative z-10 transition-shadow">
            {/* 드래그 핸들 (상단) */}
            <div 
              className="drag-handle absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#A855F7]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-50 cursor-grab active:cursor-grabbing flex items-start justify-center pt-1.5 pointer-events-auto"
              title="드래그하여 뷰포트 이동"
            >
              <div className="w-12 h-1.5 bg-white/80 rounded-full shadow-lg" />
            </div>
            
            {/* 실제 플레이어 컨테이너 */}
            <div className="flex-1 w-full h-full relative pointer-events-auto">
              <Player channelId={channelId} />
            </div>
            
            {/* iframe 드래그 끊김 방지 투명 오버레이 (드래그 중에만 사용할수 없으나 css hover로 어느정도 보완) */}
            <div className="absolute inset-0 z-40 pointer-events-none group-active:pointer-events-auto" />
          </div>
        ))}
      </ResponsiveGridLayout>
    </main>
  );
};

export default MultiViewGrid;
