export interface ChzzkResponse<T> {
  code: number;
  message: string | null;
  content: T;
}

export interface ChzzkPage {
  next: string | null;
}

export interface ChzzkLive {
  liveId: number;
  liveTitle: string;
  liveThumbnailImageUrl: string | null;
  concurrentUserCount: number;
  openDate: string;
  adult: boolean;
  tags: string[];
  categoryType: string | null;
  liveCategory: string | null;
  liveCategoryValue: string | null;
  channelId: string;
  channelName: string;
  channelImageUrl: string | null;
}

export interface ChzzkLiveListContent {
  data: ChzzkLive[];
  page: ChzzkPage;
}

export type ChzzkLiveListResponse = ChzzkResponse<ChzzkLiveListContent>;
