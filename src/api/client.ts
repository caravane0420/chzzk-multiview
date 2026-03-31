const clientId = import.meta.env.VITE_CHZZK_CLIENT_ID || '';
const clientSecret = import.meta.env.VITE_CHZZK_CLIENT_SECRET || '';

export async function chzzkFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // 프록시 설정에 맞추어 도메인 없이 상대 경로로 요청
  const url = endpoint.startsWith('/open') ? endpoint : `/open${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Client-Id': clientId,
      'Client-Secret': clientSecret,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Chzzk API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
