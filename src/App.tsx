import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const fetchLiveStatus = useStore((state) => state.fetchLiveStatus);

  // 마운트 시 최초 데이터 로드
  useEffect(() => {
    fetchLiveStatus();
  }, [fetchLiveStatus]);

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-black text-white selection:bg-[#00FF87] selection:text-black">
      {/* 1. 스트리머 목록을 렌더링할 사이드바 컨테이너 */}
      <Sidebar />

      {/* 2. 메인 컨텐츠 영역 (방송 화면이 추가될 영역) */}
      <main className="flex-1 flex flex-col items-center justify-center bg-[#09090b] relative z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,135,0.06)_0%,transparent_50%)] pointer-events-none" />
        
        <div className="flex flex-col items-center text-center gap-4 z-10 px-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            치지직 화면을 예쁘게
          </h1>
          <p className="text-lg text-gray-400 max-w-lg">
            좌측 사이드바에서 시청을 원하는 스트리머를 선택해주세요. 상태 관리와 UI 기초 공사가 완료되었습니다!
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
