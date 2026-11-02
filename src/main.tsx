import React from 'react';
import ReactDOM from 'react-dom/client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ThemeProvider } from 'styled-components';
import 'pretendard/dist/web/static/pretendard-dynamic-subset.css';
import './styles/tokens.css';
import App from './App';
import { PERSIST_BUSTER, PERSIST_MAX_AGE, queryClient, queryPersister } from './api/queryClient';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';

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
