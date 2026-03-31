import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MultiViewGrid from './components/MultiViewGrid';
import { useStore, LayoutMode } from './store/useStore';

const App: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    selectedChannels, 
    mainChannelId, 
    layoutMode, 
    fetchLiveStatus 
  } = useStore();

  const isInitialMount = useRef(true);

  // 1. URL -> Store 동기화 (최초 접속 또는 뒤로가기 시 URL 값을 Zustand에 덮어씌움)
  useEffect(() => {
    const channelsParam = searchParams.get('channels');
    const mainParam = searchParams.get('main');
    const layoutParam = searchParams.get('layout') as LayoutMode;

    const ids = channelsParam ? channelsParam.split(',').filter(Boolean) : [];
    
    // 상태 병합. 배열 및 문자열 타입에 유의하여 안전하게 주입.
    useStore.setState({ 
      selectedChannels: ids,
      mainChannelId: mainParam || null,
      layoutMode: (layoutParam === 'grid' || layoutParam === 'main-sub') ? layoutParam : 'grid',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 2. Store -> URL 동기화 (유저가 UI를 통해 상태를 변경했을 때 URL 공유용 파라미터 최신화)
  useEffect(() => {
    const safeSelectedChannels = Array.isArray(selectedChannels) ? selectedChannels : [];
    const newChannelsStr = safeSelectedChannels.join(',');
    
    const currentChannelsParam = searchParams.get('channels') || '';
    const currentMainParam = searchParams.get('main') || '';
    const currentLayoutParam = searchParams.get('layout') || '';

    // 상태와 URL 파라미터가 실제로 변했을 때만 주소줄 변경
    if (
      currentChannelsParam !== newChannelsStr ||
      currentMainParam !== (mainChannelId || '') ||
      currentLayoutParam !== layoutMode
    ) {
      const nextParams = new URLSearchParams(searchParams);
      
      // 채널 배열이 비어있으면 쿼리 파라미터 전부 청소 (초기화)
      if (safeSelectedChannels.length === 0) {
        nextParams.delete('channels');
        nextParams.delete('main');
        nextParams.delete('layout');
      } else {
        nextParams.set('channels', newChannelsStr);

        if (mainChannelId) {
          nextParams.set('main', mainChannelId);
        } else {
          nextParams.delete('main');
        }

        // 레이아웃이 grid라도 기본 명시, 혹은 main-sub일 때 적용
        nextParams.set('layout', layoutMode);
      }

      setSearchParams(nextParams, { replace: true });
    }
  }, [selectedChannels, mainChannelId, layoutMode, searchParams, setSearchParams]);

  // 3. 앱 마운트 시 최초 데이터 로드
  useEffect(() => {
    fetchLiveStatus();
  }, [fetchLiveStatus]);

  // w-screen h-[100dvh] overflow-hidden flex 로 스크롤이나 여백 없는 하드 핏 유지
  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#05010B] text-white selection:bg-[#8B5CF6] selection:text-white relative z-0">
      {/* 백그라운드 별빛 + 보라색 성운 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#3B0764]/40 via-[#05010B] to-[#0A0514] -z-10 pointer-events-none" />
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-[#6D28D9]/10 blur-[150px] rounded-full pointer-events-none" />
      
      <Sidebar />
      <MultiViewGrid />
    </div>
  );
};

export default App;
