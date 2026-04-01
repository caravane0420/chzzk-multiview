import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChzzkLive } from '../types/chzzk';
import { STELLIVE_MEMBERS } from '../data/stellive';

interface LiveStatusResult {
  channelId: string;
  data: ChzzkLive | null;
}

import type { Layout } from 'react-grid-layout';
interface AppState {
  favoriteChannels: string[];
  liveData: Record<string, ChzzkLive | null>;
  selectedChannels: string[];
  gridLayouts: Layout[];
  isLoading: boolean;
  lastFetchTime: number;
  isSidebarOpen: boolean;
  
  addFavoriteChannel: (channelId: string) => void;
  removeFavoriteChannel: (channelId: string) => void;
  toggleSelectedChannel: (channelId: string) => void;
  setGridLayouts: (layouts: Layout[]) => void;
  toggleSidebar: () => void;
  fetchLiveStatus: (force?: boolean) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      favoriteChannels: [], 
      liveData: {},
      selectedChannels: [],
      gridLayouts: [],
      isLoading: false,
      lastFetchTime: 0,
      isSidebarOpen: true,

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
          
          const newSelected = safeSelected.filter((id) => id !== channelId);
          return {
            favoriteChannels: safeFavorites.filter((id) => id !== channelId),
            selectedChannels: newSelected,
            liveData: newLiveData,
          };
        }),

      toggleSelectedChannel: (channelId) =>
        set((state) => {
          const safeSelected = Array.isArray(state.selectedChannels) ? state.selectedChannels : [];
          const isRemoving = safeSelected.includes(channelId);
          
          const newSelected = isRemoving
            ? safeSelected.filter((id) => id !== channelId)
            : [...safeSelected, channelId];
            
          return {
            selectedChannels: newSelected,
          };
        }),

      setGridLayouts: (layouts) =>
        set({ gridLayouts: layouts }),

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

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
                  liveId: json.content.liveId || 0,
                  liveTitle: json.content.liveTitle || '',
                  liveThumbnailImageUrl: json.content.liveImageUrl || null,
                  concurrentUserCount: json.content.concurrentUserCount || 0,
                  openDate: json.content.openDate || '',
                  adult: json.content.adult || false,
                  tags: json.content.tags || [],
                  categoryType: json.content.categoryType || null,
                  liveCategory: json.content.liveCategory || null,
                  liveCategoryValue: json.content.liveCategoryValue || null,
                  channelId: channelId,
                  channelName: json.content.channel?.channelName || '',
                  channelImageUrl: json.content.channel?.channelImageUrl || null,
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
      // URL이 우선순위를 갖지 않는 커스텀 채널 목록, 유저 오디오 설정, 사이드바 토글 상태만 로컬스토리지에 보존
      partialize: (state) => ({ 
        favoriteChannels: state.favoriteChannels,
        gridLayouts: state.gridLayouts,
        isSidebarOpen: state.isSidebarOpen,
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
