import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chzzkFetch } from '../api/client';
import { ChzzkLive, ChzzkResponse } from '../types/chzzk';

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
  
  // Actions
  addFavoriteChannel: (channelId: string) => void;
  removeFavoriteChannel: (channelId: string) => void;
  toggleSelectedChannel: (channelId: string) => void;
  fetchLiveStatus: (force?: boolean) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      favoriteChannels: [], // 초기 상태를 빈 배열로 설정 (LocalStorage에서 자동 복구됨)
      liveData: {},
      selectedChannels: [],
      isLoading: false,
      lastFetchTime: 0,

      addFavoriteChannel: (channelId) =>
        set((state) => ({
          favoriteChannels: state.favoriteChannels.includes(channelId)
            ? state.favoriteChannels
            : [...state.favoriteChannels, channelId],
        })),

      removeFavoriteChannel: (channelId) =>
        set((state) => {
          // 삭제된 채널은 liveData에서도 제거하여 정리
          const newLiveData = { ...state.liveData };
          delete newLiveData[channelId];
          
          return {
            favoriteChannels: state.favoriteChannels.filter((id) => id !== channelId),
            selectedChannels: state.selectedChannels.filter((id) => id !== channelId),
            liveData: newLiveData,
          };
        }),

      toggleSelectedChannel: (channelId) =>
        set((state) => ({
          selectedChannels: state.selectedChannels.includes(channelId)
            ? state.selectedChannels.filter((id) => id !== channelId)
            : [...state.selectedChannels, channelId],
        })),

      fetchLiveStatus: async (force = false) => {
        const { favoriteChannels, lastFetchTime, isLoading } = get();
        
        if (favoriteChannels.length === 0) {
          set({ liveData: {} });
          return;
        }

        const now = Date.now();
        // 최적화: 강제 새로고침(force)이 아니고, 마지막 호출 이후 1분이(60초) 안 지났으면 스킵
        if (!force && now - lastFetchTime < 60000) {
          return;
        }

        // 중복 호출 방어
        if (isLoading) return;

        set({ isLoading: true });

        try {
          const promises = favoriteChannels.map(async (channelId) => {
            try {
              // 공식 API 호출
              const response = await chzzkFetch<ChzzkResponse<ChzzkLive>>(
                `/open/v1/lives/${channelId}`
              );
              // 정상 응답이지만 라이브가 꺼졌거나 결과가 없을 경우를 대비해 response.content 검사 처리
              return { channelId, data: response.content || null } as LiveStatusResult;
            } catch (error) {
              // 에러 발생 혹은 404 (잘못된 채널ID 입력) 시 null 반환 처리
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
            lastFetchTime: Date.now(), // 호출 성공 시각 업데이트
          }));
        } catch (error) {
          console.error('생방송 정보 비동기 호출 중 오류가 발생:', error);
          set({ isLoading: false }); // 에러 시에도 로딩 해제
        }
      },
    }),
    {
      name: 'chzzk-store',
      // favoriteChannels 배열만 로컬 스토리지에 저장하여 테스트 채널 유지
      partialize: (state) => ({ favoriteChannels: state.favoriteChannels }),
    }
  )
);
