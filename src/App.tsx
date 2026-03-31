import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MultiViewGrid from './components/MultiViewGrid';
import { useStore } from './store/useStore';

const App: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedChannels = useStore((state) => state.selectedChannels);
  const fetchLiveStatus = useStore((state) => state.fetchLiveStatus);

  useEffect(() => {
    const channelsParam = searchParams.get('channels');
    if (channelsParam) {
      const ids = channelsParam.split(',').filter(Boolean);
      useStore.setState({ selectedChannels: ids });
    } else {
      useStore.setState({ selectedChannels: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const currentParam = searchParams.get('channels') || '';
    const safeSelectedChannels = Array.isArray(selectedChannels) ? selectedChannels : [];
    const newParam = safeSelectedChannels.join(',');

    if (currentParam !== newParam) {
      if (safeSelectedChannels.length > 0) {
        setSearchParams({ channels: newParam }, { replace: true });
      } else {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('channels');
        setSearchParams(nextParams, { replace: true });
      }
    }
  }, [selectedChannels, searchParams, setSearchParams]);

  useEffect(() => {
    fetchLiveStatus();
  }, [fetchLiveStatus]);

  // 스텔라이브 전용 '심우주, 밤하늘' 컨셉 테마
  // w-screen h-screen overflow-hidden 으로 스크롤이나 여백 없는 하드 핏 유지
  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#05010B] text-white selection:bg-[#8B5CF6] selection:text-white relative z-0">
      {/* 백그라운드 별빛 + 보라색 성운 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#3B0764]/40 via-[#05010B] to-[#0A0514] -z-10 pointer-events-none" />
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-[#6D28D9]/10 blur-[150px] rounded-full pointer-events-none" />
      
      <Sidebar />
      <MultiViewGrid />
    </div>
  );
};

export default App;
