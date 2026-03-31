import React from 'react';
import { useStore } from '../store/useStore';

const Sidebar: React.FC = () => {
  const { favoriteChannels, liveData, selectedChannels, toggleSelectedChannel } = useStore();

  const formatViewers = (count: number) => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}만명`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}천명`;
    return `${count}명`;
  };

  const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzY2NiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

  return (
    <aside className="w-[320px] h-screen bg-[#141416]/95 backdrop-blur-md border-r border-white/5 flex flex-col p-4 overflow-y-auto shrink-0 z-50 shadow-2xl">
      <h2 className="text-xl font-bold mb-6 bg-gradient-to-br from-[#00FF87] to-[#5EEAFF] bg-clip-text text-transparent">
        즐겨찾기 채널
      </h2>
      
      {favoriteChannels.length === 0 ? (
        <div className="text-gray-500 text-sm py-10 flex text-center justify-center">
          등록된 채널이 없습니다.
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
                } ${!isLive && 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100 bg-white/[0.02]'}`}
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
                  {!isLive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white/70 text-sm font-medium">
                      오프라인
                    </div>
                  )}
                </div>

                {/* 프로필 및 방제 정보 */}
                <div className={`p-3 flex items-start gap-3 ${isLive ? 'bg-white/[0.04]' : 'bg-transparent'}`}>
                  <img
                    src={isLive ? (data.channelImageUrl || placeholderImg) : placeholderImg}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover bg-gray-800 border border-white/10"
                  />
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-sm text-white font-medium truncate leading-tight">
                      {isLive ? data.liveTitle : '방송 중이 아닙니다'}
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
