import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MultiViewGrid from './components/MultiViewGrid';
import { useStore } from './store/useStore';

const App: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedChannels = useStore((state) => state.selectedChannels);
  const fetchLiveStatus = useStore((state) => state.fetchLiveStatus);

  // 1. URL의 ?channels= 파라미터가 바뀌면 Zustand의 selectedChannels 업데이트 (URL -> Store 양방향 방어코드 추가)
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

  // 2. 사이드바 등에서 클릭으로 selectedChannels 변경 시 URL 실시간 업데이트 (Store -> URL 양방향)
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

  // 3. 앱 마운트 시 최초 데이터 로드 (딱 한 번)
  useEffect(() => {
    fetchLiveStatus();
  }, [fetchLiveStatus]);

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-black text-white selection:bg-[#00FF87] selection:text-black">
      <Sidebar />
      <MultiViewGrid />
    </div>
  );
};

export default App;
