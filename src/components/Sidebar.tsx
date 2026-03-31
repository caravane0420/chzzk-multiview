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
            ? 'border-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-[1.02] bg-[#A855F7]/10' 
            : 'border-white/5 hover:border-[#D8B4FE]/40 bg-white/5'
        } ${!isLive ? 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}
      >
        <div className="relative w-full aspect-video bg-[#0B0813] overflow-hidden">
          <img
            src={isLive ? (data.liveThumbnailImageUrl?.replace('{type}', '480') || placeholderImg) : placeholderImg}
            alt="Thumbnail"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = placeholderImg; }}
          />
          {isLive && (
            <>
              <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider backdrop-blur-sm">
                LIVE
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1.5 shadow-xl border border-white/10">
                <span className="w-1.5 h-1.5 bg-[#ff3b30] rounded-full animate-pulse shadow-[0_0_8px_#ff3b30]" />
                {formatViewers(data.concurrentUserCount)}
              </div>
            </>
          )}
          {!isLive && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0B0813]/80 text-[#BCA5FF]/60 text-sm font-medium backdrop-blur-sm">
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

        <div className={`p-3 flex items-start gap-3 relative ${isLive ? 'bg-gradient-to-b from-transparent to-[#2E1065]/30' : 'bg-transparent'}`}>
          <img
            src={isLive ? (data.channelImageUrl || placeholderImg) : placeholderImg}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover bg-[#1E1B4B] border border-[#A855F7]/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
            onError={(e) => { (e.target as HTMLImageElement).src = placeholderImg; }}
          />
          <div className="flex-1 min-w-0 flex flex-col gap-0.5 pr-1">
            <span className="text-sm text-white font-medium truncate leading-tight mt-0.5">
              {defaultTitle}
            </span>
            <span className="text-xs text-[#D8B4FE]/70 font-medium truncate">
              {defaultSubtitle}
            </span>
            {isLive && data.liveCategoryValue && (
              <span className="text-[10px] text-[#A855F7] font-bold mt-1 tracking-wide">
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
      <div className="mb-8">
        <h3 className="text-sm font-bold text-[#F3E8FF] mb-4 px-1 flex items-center gap-2">
          <span className="w-1 h-3.5 bg-gradient-to-b from-[#D8B4FE] to-[#9333EA] rounded-full inline-block"></span>
          {title}
        </h3>
        <div className="flex flex-col gap-3">
          {mems.map((member) => renderChannelCard(member.id, member.name, false))}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-[320px] h-screen bg-[#0A0514]/80 backdrop-blur-xl border-r border-[#6D28D9]/20 flex flex-col p-5 overflow-y-auto shrink-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.5)] relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black tracking-tighter bg-gradient-to-br from-[#F3E8FF] via-[#D8B4FE] to-[#A855F7] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(168,85,247,0.4)]">
          Stelview
        </h2>
        <button 
          onClick={handleManualRefresh}
          className={`p-2 rounded-lg hover:bg-[#A855F7]/20 transition-all text-[#D8B4FE]/60 hover:text-[#F3E8FF] border border-transparent hover:border-[#A855F7]/30 ${isLoading ? 'animate-spin opacity-50 cursor-not-allowed text-[#A855F7]' : ''}`}
          disabled={isLoading}
          title="새로고침"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {renderGenerationSection('1기생 (Mystic)', 1)}
      {renderGenerationSection('2기생 (Universe)', 2)}
      {renderGenerationSection('3기생 (Cliché)', 3)}
      
      {/* 내 즐겨찾기 섹션 (스텔라이브 외 채널들) */}
      <div className="mt-2 pt-6 border-t border-[#6D28D9]/30">
        <h3 className="text-sm font-bold text-[#F3E8FF] mb-4 px-1 flex items-center gap-2 drop-shadow-md">
           <span className="w-1 h-3.5 bg-gradient-to-b from-[#A855F7] to-[#4C1D95] rounded-full inline-block"></span>
           스텔라이브 외 채널 추가
        </h3>
        <form onSubmit={handleAddChannel} className="flex gap-2 mb-5">
          <input
            type="text"
            placeholder="치지직 ID 입력"
            value={newChannelId}
            onChange={(e) => setNewChannelId(e.target.value)}
            className="flex-1 bg-[#1E1B4B]/30 border border-[#8B5CF6]/30 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#8B5CF6]/50 focus:outline-none focus:border-[#D8B4FE] focus:ring-2 focus:ring-[#A855F7]/40 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!newChannelId.trim() || isLoading}
            className="bg-[#8B5CF6]/20 text-[#D8B4FE] hover:bg-[#8B5CF6]/40 disabled:opacity-50 disabled:cursor-not-allowed p-2.5 rounded-lg transition-all flex items-center justify-center shrink-0 border border-[#8B5CF6]/40 shadow-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            title="채널 추가"
          >
            <Plus size={20} />
          </button>
        </form>

        {safeFavorites.length === 0 ? (
          <div className="text-[#8B5CF6]/50 text-xs py-6 flex flex-col items-center justify-center text-center bg-[#1E1B4B]/10 rounded-xl border border-dashed border-[#8B5CF6]/20">
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
