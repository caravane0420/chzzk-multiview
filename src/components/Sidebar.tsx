import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { STELLIVE_MEMBERS } from '../data/stellive';

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

  const safeFavorites = Array.isArray(favoriteChannels) ? favoriteChannels : [];
  const safeSelected = Array.isArray(selectedChannels) ? selectedChannels : [];

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
    await fetchLiveStatus(true); 
  };

  const handleRemoveChannel = (e: React.MouseEvent, channelId: string) => {
    e.stopPropagation(); 
    removeFavoriteChannel(channelId);
  };

  const handleManualRefresh = () => {
    fetchLiveStatus(true); 
  };

  const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzY2NiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

  const renderChannelCard = (channelId: string, customName?: string, isRemovable = false) => {
    const data = liveData[channelId];
    const isLive = data !== null && data !== undefined;
    const isSelected = safeSelected.includes(channelId);

    // 에러/오프라인 시 방제 및 부제목 처리
    let defaultTitle = isLive ? data.liveTitle : '방송 중이 아니거나 없는 채널입니다';
    let defaultSubtitle = customName ? customName : (isLive ? data.channelName : channelId.substring(0, 10) + '...');
    if (!isLive && customName) {
      defaultTitle = '방송 중이 아닙니다';
    }

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
          
          {isRemovable && (
            <button
              onClick={(e) => handleRemoveChannel(e, channelId)}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white/50 hover:bg-red-500 hover:text-white rounded-md transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md z-10 shadow-lg"
              title="즐겨찾기 삭제"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div className={`p-3 flex items-start gap-3 relative ${isLive ? 'bg-white/[0.04]' : 'bg-transparent'}`}>
          <img
            src={isLive ? (data.channelImageUrl || placeholderImg) : placeholderImg}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover bg-gray-800 border border-white/10"
            onError={(e) => { (e.target as HTMLImageElement).src = placeholderImg; }}
          />
          <div className="flex-1 min-w-0 flex flex-col gap-0.5 pr-1">
            <span className="text-sm text-white font-medium truncate leading-tight">
              {defaultTitle}
            </span>
            <span className="text-xs text-gray-400 font-medium truncate">
              {defaultSubtitle}
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
  };

  const renderGenerationSection = (title: string, generation: number) => {
    const mems = STELLIVE_MEMBERS.filter((m) => m.generation === generation);
    if (!mems.length) return null;

    return (
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white/80 mb-3 px-1 border-l-2 border-[#00FF87] pl-2">{title}</h3>
        <div className="flex flex-col gap-3">
          {mems.map((member) => renderChannelCard(member.id, member.name, false))}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-[320px] h-screen bg-[#141416]/95 backdrop-blur-md border-r border-white/5 flex flex-col p-4 overflow-y-auto shrink-0 z-50 shadow-2xl relative scrollbar-thin scrollbar-thumb-white/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black tracking-tight bg-gradient-to-br from-[#00FF87] to-[#5EEAFF] bg-clip-text text-transparent">
          스텔뷰
        </h2>
        <button 
          onClick={handleManualRefresh}
          className={`p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/50 hover:text-white ${isLoading ? 'animate-spin opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
          title="새로고침"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {renderGenerationSection('1기생 (Mystic)', 1)}
      {renderGenerationSection('2기생 (Universe)', 2)}
      {renderGenerationSection('3기생 (Cliché)', 3)}
      
      {/* 내 즐겨찾기 섹션 */}
      <div className="mt-4 pt-6 border-t border-white/10">
        <h3 className="text-sm font-bold text-[#00FF87]/80 mb-4 px-1 border-l-2 border-[#00FF87]/80 pl-2">내 즐겨찾기</h3>
        <form onSubmit={handleAddChannel} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="치지직 ID 입력"
            value={newChannelId}
            onChange={(e) => setNewChannelId(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF87] focus:ring-1 focus:ring-[#00FF87]/50 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!newChannelId.trim() || isLoading}
            className="bg-[#00FF87]/10 text-[#00FF87] hover:bg-[#00FF87]/20 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 border border-[#00FF87]/30 shadow-sm"
            title="채널 추가"
          >
            <Plus size={20} />
          </button>
        </form>

        {safeFavorites.length === 0 ? (
          <div className="text-gray-500 text-xs py-4 flex flex-col items-center justify-center text-center">
            등록된 추가 채널이 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {safeFavorites.map((channelId) => renderChannelCard(channelId, undefined, true))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
