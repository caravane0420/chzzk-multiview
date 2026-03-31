import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chzzkFetch } from '../api/client';
import type { ChzzkLive, ChzzkResponse } from '../types/chzzk';
import { STELLIVE_MEMBERS } from '../data/stellive';

interface LiveStatusResult {
  channelId: string;
  data: ChzzkLive | null;
}

interface AppState {
  favoriteChannels: string[];
  liveData: Record<string, ChzzkLive | null>;
  selectedChannels: string[];
  isLoading: boolean;
  lastFetchTime: number;
  
  addFavoriteChannel: (channelId: string) => void;
  removeFavoriteChannel: (channelId: string) => void;
  toggleSelectedChannel: (channelId: string) => void;
  fetchLiveStatus: (force?: boolean) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      favoriteChannels: [], // 로컬스토리지 기반 커스텀 리스트
      liveData: {},
      selectedChannels: [],
      isLoading: false,
      lastFetchTime: 0,

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
            liveData: newLiveData,
          };
        }),

      toggleSelectedChannel: (channelId) =>
        set((state) => {
          const safeSelected = Array.isArray(state.selectedChannels) ? state.selectedChannels : [];
          return {
            selectedChannels: safeSelected.includes(channelId)
              ? safeSelected.filter((id) => id !== channelId)
              : [...safeSelected, channelId],
          };
        }),

      fetchLiveStatus: async (force = false) => {
        const { favoriteChannels, lastFetchTime, isLoading } = get();
        
        // 스텔라이브 멤버를 데이터 소스에 강제 통합
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
              const response = await chzzkFetch<ChzzkResponse<ChzzkLive>>(
                `/open/v1/lives/${channelId}`
              );
              return { channelId, data: response.content || null } as LiveStatusResult;
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
      partialize: (state) => ({ favoriteChannels: state.favoriteChannels }),
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
