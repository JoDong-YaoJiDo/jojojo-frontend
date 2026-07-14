import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (필요 시 세션 ID나 토큰 헤더 자동 주입용)
api.interceptors.request.use((config) => {
  const clientId = localStorage.getItem('local_connect_client_id');
  if (clientId) {
    // URL 파라미터나 헤더에 client_id 자동 추가 필요 시 정의
    config.params = {
      ...config.params,
      client_id: clientId,
    };
  }
  return config;
});

export default api;