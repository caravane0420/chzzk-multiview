import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chzzkFetch } from '../api/client';
import { ChzzkLive, ChzzkResponse } from '../types/chzzk';

// 테스트를 위한 스텔라이브 등 치지직 채널 ID 예시 (32자리 문자열)
const TEST_CHANNELS = [
  'f722959d1b8e651bd56209b343932c01', // 강지(Kangji) 예시
  '8dcaeec13c10f526683f1df643c749b5', // 아야츠노 유니(Ayatsuno Yuni) 예시
  '12239d261899178ad3a778e718cc2745', // 시라유키 히나(Shirayuki Hina) 예시
];

interface LiveStatusResult {
  channelId: string;
  data: ChzzkLive | null;
}

interface AppState {
  favoriteChannels: string[];
  liveData: Record<string, ChzzkLive | null>;
  selectedChannels: string[];
  
  // Actions
  addFavoriteChannel: (channelId: string) => void;
  removeFavoriteChannel: (channelId: string) => void;
  toggleSelectedChannel: (channelId: string) => void;
  fetchLiveStatus: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      favoriteChannels: TEST_CHANNELS,
      liveData: {},
      selectedChannels: [],

      addFavoriteChannel: (channelId) =>
        set((state) => ({
          favoriteChannels: state.favoriteChannels.includes(channelId)
            ? state.favoriteChannels
            : [...state.favoriteChannels, channelId],
        })),

      removeFavoriteChannel: (channelId) =>
        set((state) => ({
          favoriteChannels: state.favoriteChannels.filter((id) => id !== channelId),
          selectedChannels: state.selectedChannels.filter((id) => id !== channelId),
        })),

      toggleSelectedChannel: (channelId) =>
        set((state) => ({
          selectedChannels: state.selectedChannels.includes(channelId)
            ? state.selectedChannels.filter((id) => id !== channelId)
            : [...state.selectedChannels, channelId],
        })),

      fetchLiveStatus: async () => {
        const { favoriteChannels } = get();
        if (favoriteChannels.length === 0) {
          set({ liveData: {} });
          return;
        }

        try {
          const promises = favoriteChannels.map(async (channelId) => {
            try {
              // 공식 API를 이용한 생방송 상태 호출
              const response = await chzzkFetch<ChzzkResponse<ChzzkLive>>(
                `/open/v1/lives/${channelId}`
              );
              return { channelId, data: response.content } as LiveStatusResult;
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
          }));
        } catch (error) {
          console.error('생방송 정보 비동기 호출 중 오류가 발생:', error);
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
