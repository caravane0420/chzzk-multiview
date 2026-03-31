const CHZZK_API_BASE_URL = 'https://openapi.chzzk.naver.com';

export const chzzkFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const clientId = import.meta.env.VITE_CHZZK_CLIENT_ID;

  if (!clientId) {
    console.warn('VITE_CHZZK_CLIENT_ID is not defined in environment variables.');
  }

  const defaultHeaders = {
    'Client-Id': clientId || '',
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${CHZZK_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Naver Chzzk API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
