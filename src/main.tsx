import React from 'react';
import ReactDOM from 'react-dom/client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ThemeProvider } from 'styled-components';
import 'pretendard/dist/web/static/pretendard-dynamic-subset.css';
import './styles/tokens.css';
import './styles/skins/apple.css';
import './styles/skins/apple-motion.css';
import App from './App';
import { PERSIST_BUSTER, PERSIST_MAX_AGE, queryClient, queryPersister } from './api/queryClient';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { MOTION, SKIN } from './styles/skin';

// 디자인 스위치 표시 — skins/*.css는 이 속성이 'apple'일 때만 적용됨 (src/styles/skin.ts).
document.documentElement.dataset.skin = SKIN;
document.documentElement.dataset.motion = MOTION;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: queryPersister, maxAge: PERSIST_MAX_AGE, buster: PERSIST_BUSTER }}
    >
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <App />
      </ThemeProvider>
    </PersistQueryClientProvider>
  </React.StrictMode>,
);
