import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChzzkLive } from '../types/chzzk';
import { STELLIVE_MEMBERS } from '../data/stellive';

interface LiveStatusResult {
  channelId: string;
  data: ChzzkLive | null;
}

export type LayoutMode = 'grid' | 'main-sub';

interface AppState {
  favoriteChannels: string[];
  liveData: Record<string, ChzzkLive | null>;
  selectedChannels: string[];
  mainChannelId: string | null;
  layoutMode: LayoutMode;
  isLoading: boolean;
  lastFetchTime: number;
  isSingleAudioMode: boolean;
  
  addFavoriteChannel: (channelId: string) => void;
  removeFavoriteChannel: (channelId: string) => void;
  toggleSelectedChannel: (channelId: string) => void;
  setMainChannel: (channelId: string | null) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  toggleAudioMode: () => void;
  fetchLiveStatus: (force?: boolean) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      favoriteChannels: [], 
      liveData: {},
      selectedChannels: [],
      mainChannelId: null,      // 메인 채널 지정
      layoutMode: 'grid',       // 초기 레이아웃 모드
      isLoading: false,
      lastFetchTime: 0,
      isSingleAudioMode: true,

      addFavoriteChannel: (channelId) =>
        set((state) => {
          const safeFavorites = Array.isArray(state.favoriteChannels) ? state.favoriteChannels : [];
          return {
            favoriteChannels: safeFavorites.includes(channelId)
              ? safeFavorites
              : [...safeFavorites, channelId],
          };
        }),

      removeFavoriteChannel: (channelId) =>
        set((state) => {
          const newLiveData = { ...state.liveData };
          delete newLiveData[channelId];
          
          const safeFavorites = Array.isArray(state.favoriteChannels) ? state.favoriteChannels : [];
          const safeSelected = Array.isArray(state.selectedChannels) ? state.selectedChannels : [];
          
          return {
            favoriteChannels: safeFavorites.filter((id) => id !== channelId),
            selectedChannels: safeSelected.filter((id) => id !== channelId),
            mainChannelId: state.mainChannelId === channelId ? null : state.mainChannelId,
            liveData: newLiveData,
          };
        }),

      toggleSelectedChannel: (channelId) =>
        set((state) => {
          const safeSelected = Array.isArray(state.selectedChannels) ? state.selectedChannels : [];
          const isRemoving = safeSelected.includes(channelId);
          
          return {
            selectedChannels: isRemoving
              ? safeSelected.filter((id) => id !== channelId)
              : [...safeSelected, channelId],
            // 만약 해제되는 채널이 메인 채널이라면, 메인 채널 여부도 초기화
            mainChannelId: isRemoving && state.mainChannelId === channelId ? null : state.mainChannelId,
          };
        }),

      setMainChannel: (channelId) =>
        set({ mainChannelId: channelId }),

      setLayoutMode: (mode) =>
        set({ layoutMode: mode }),

      toggleAudioMode: () =>
        set((state) => ({ isSingleAudioMode: !state.isSingleAudioMode })),

      fetchLiveStatus: async (force = false) => {
        const { favoriteChannels, lastFetchTime, isLoading } = get();
        
        const stelliveIds = STELLIVE_MEMBERS.map(member => member.id);
        const safeFavorites = Array.isArray(favoriteChannels) ? favoriteChannels : [];
        const allTargetIds = Array.from(new Set([...stelliveIds, ...safeFavorites]));
        
        if (allTargetIds.length === 0) {
          set({ liveData: {} });
          return;
        }

        const now = Date.now();
        if (!force && now - lastFetchTime < 60000) {
          return;
        }

        if (isLoading) return;

        set({ isLoading: true });

        try {
          const promises = allTargetIds.map(async (channelId) => {
            try {
              const response = await fetch(`/api/service/v2/channels/${channelId}/live-detail`);
              
              if (!response.ok) throw new Error('API Error');
              
              const json = await response.json();

              if (json?.content?.status === 'OPEN') {
                const data: ChzzkLive = {
                  liveTitle: json.content.liveTitle,
                  liveThumbnailImageUrl: json.content.liveImageUrl,
                  concurrentUserCount: json.content.concurrentUserCount,
                  channelName: json.content.channel.channelName,
                  channelImageUrl: json.content.channel.channelImageUrl,
                  liveCategoryValue: json.content.liveCategoryValue,
                  
                  liveId: json.content.liveId || 0,
                  defaultThumbnailImageUrl: json.content.defaultThumbnailImageUrl || '',
                  openDate: json.content.openDate || '',
                  closeDate: json.content.closeDate || '',
                  chatChannelId: json.content.chatChannelId || '',
                  categoryType: json.content.categoryType || '',
                };

                return { channelId, data } as LiveStatusResult;
              }
              
              return { channelId, data: null } as LiveStatusResult;

            } catch (error) {
              return { channelId, data: null } as LiveStatusResult;
            }
          });

          const results = await Promise.all(promises);

          const newLiveData = results.reduce((acc, curr) => {
            acc[curr.channelId] = curr.data;
            return acc;
          }, {} as Record<string, ChzzkLive | null>);

          set((state) => ({
            ...state,
            liveData: newLiveData,
            isLoading: false,
            lastFetchTime: Date.now(),
          }));
        } catch (error) {
          console.error('생방송 정보 비동기 호출 중 오류가 발생:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'chzzk-store',
      // URL이 우선순위를 갖지 않는 커스텀 채널 목록과 유저 오디오 설정만 로컬스토리지에 보존
      partialize: (state) => ({ 
        favoriteChannels: state.favoriteChannels,
        isSingleAudioMode: state.isSingleAudioMode,
      }),
      merge: (persistedState: any, currentState) => {
        return {
          ...currentState,
          ...persistedState,
          favoriteChannels: Array.isArray(persistedState?.favoriteChannels)
            ? persistedState.favoriteChannels
            : [],
        };
      },
    }
  )
);
