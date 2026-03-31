import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, RefreshCw } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { 
    favoriteChannels, 
    liveData, 
    selectedChannels, 
    isLoading,
    toggleSelectedChannel,
    addFavoriteChannel,
    removeFavoriteChannel,
    fetchLiveStatus
  } = useStore();

  const [newChannelId, setNewChannelId] = useState('');

  const formatViewers = (count: number) => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}만명`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}천명`;
    return `${count}명`;
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = newChannelId.trim();
    if (!trimmedId) return;

    addFavoriteChannel(trimmedId);
    setNewChannelId('');
    await fetchLiveStatus(true); // 채널 추가 시 1분 쿨링타임을 무시하고 강제로 즉시 업데이트 (force = true)
  };

  const handleRemoveChannel = (e: React.MouseEvent, channelId: string) => {
    e.stopPropagation(); // 오동작(토글) 방지
    removeFavoriteChannel(channelId);
  };

  const handleManualRefresh = () => {
    fetchLiveStatus(true); // 수동 새로고침 클릭 시 강제 업데이트
  };

  const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzY2NiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

  return (
    <aside className="w-[320px] h-screen bg-[#141416]/95 backdrop-blur-md border-r border-white/5 flex flex-col p-4 overflow-y-auto shrink-0 z-50 shadow-2xl relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-br from-[#00FF87] to-[#5EEAFF] bg-clip-text text-transparent">
          즐겨찾기 채널
        </h2>
        {/* 우측 상단 수동 새로고침 버튼 (API 로딩 상태 시 회전 애니메이션) */}
        <button 
          onClick={handleManualRefresh}
          className={`p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/50 hover:text-white ${isLoading ? 'animate-spin opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
          title="새로고침 (1분 쿨링 무시)"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      
      {/* 채널 추가 폼 */}
      <form onSubmit={handleAddChannel} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="치지직 ID 입력 (32자리)"
          value={newChannelId}
          onChange={(e) => setNewChannelId(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF87] focus:ring-1 focus:ring-[#00FF87]/50 transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={!newChannelId.trim() || isLoading} // 로딩 중이거나 값이 없으면 버튼 비활성화
          className="bg-[#00FF87]/10 text-[#00FF87] hover:bg-[#00FF87]/20 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 border border-[#00FF87]/30 shadow-sm"
          title="채널 추가"
        >
          <Plus size={20} />
        </button>
      </form>

      {favoriteChannels.length === 0 ? (
        <div className="text-gray-500 text-sm py-10 flex flex-col items-center justify-center text-center gap-2">
          <span>등록된 채널이 없습니다.</span>
          <span className="text-xs text-gray-600">상단에 채널 ID를 입력해 추가해보세요.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {favoriteChannels.map((channelId) => {
            const data = liveData[channelId];
            const isLive = data !== null && data !== undefined;
            const isSelected = selectedChannels.includes(channelId);

            return (
              <div
                key={channelId}
                onClick={() => toggleSelectedChannel(channelId)}
                className={`group relative flex flex-col rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                  isSelected 
                    ? 'border-[#00FF87] shadow-[0_0_15px_rgba(0,255,135,0.2)] scale-[1.02]' 
                    : 'border-white/5 hover:border-white/20'
                } ${!isLive ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100 bg-white/[0.02]' : ''}`}
              >
                {/* 썸네일 */}
                <div className="relative w-full aspect-video bg-[#1e1e24] overflow-hidden">
                  <img
                    src={isLive ? (data.liveThumbnailImageUrl?.replace('{type}', '480') || placeholderImg) : placeholderImg}
                    alt="Thumbnail"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = placeholderImg; }}
                  />
                  {isLive && (
                    <>
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider">
                        LIVE
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#ff3b30] rounded-full animate-pulse shadow-[0_0_6px_#ff3b30]" />
                        {formatViewers(data.concurrentUserCount)}
                      </div>
                    </>
                  )}
                  {/* 방어 코드 처리 (에러 OR 단순히 방송 꺼짐) */}
                  {!isLive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white/70 text-sm font-medium">
                      오프라인 / 혹은 알 수 없는 채널
                    </div>
                  )}
                  
                  {/* 휴지통 버튼 */}
                  <button
                    onClick={(e) => handleRemoveChannel(e, channelId)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white/50 hover:bg-red-500 hover:text-white rounded-md transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md z-10 shadow-lg"
                    title="즐겨찾기 삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* 프로필 및 방제 정보 */}
                <div className={`p-3 flex items-start gap-3 relative ${isLive ? 'bg-white/[0.04]' : 'bg-transparent'}`}>
                  <img
                    src={isLive ? (data.channelImageUrl || placeholderImg) : placeholderImg}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover bg-gray-800 border border-white/10"
                    onError={(e) => { (e.target as HTMLImageElement).src = placeholderImg; }}
                  />
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5 pr-1">
                    <span className="text-sm text-white font-medium truncate leading-tight">
                      {isLive ? data.liveTitle : '방송 중이 아니거나 없는 채널입니다'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium truncate">
                      {isLive ? data.channelName : channelId.substring(0, 10) + '...'}
                    </span>
                    {isLive && data.liveCategoryValue && (
                      <span className="text-[10px] text-[#00FF87] font-semibold mt-1">
                        {data.liveCategoryValue}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
