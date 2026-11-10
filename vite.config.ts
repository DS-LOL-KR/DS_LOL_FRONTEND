import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// 개발 서버 /api 프록시.
// 기본은 로컬 백엔드(localhost:4000). 배포된 API에 붙여서 실제 데이터로 화면을 보고 싶으면
// .env.development.local(커밋 안 됨)에 아래 값을 넣는다:
//   VITE_API_BASE_URL=/api
//   DEV_API_PROXY_TARGET=https://<배포 API 호스트>
//   DEV_API_ORIGIN=https://ds-lol.com      ← 백엔드가 허용하는 Origin
//   DEV_API_COOKIE=<ds-lol.com에서 로그인한 뒤 API 요청 헤더의 cookie 값>
// OAuth 콜백이 배포 도메인으로만 돌아가서 localhost에서는 로그인이 안 되기 때문.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const target = env.DEV_API_PROXY_TARGET || 'http://localhost:4000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.DEV_API_COOKIE) proxyReq.setHeader('cookie', env.DEV_API_COOKIE);
              if (env.DEV_API_ORIGIN) proxyReq.setHeader('origin', env.DEV_API_ORIGIN);
            });
          },
        },
      },
    },
  };
});
