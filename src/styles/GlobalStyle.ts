import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    /* Dark native scrollbars, form controls and autofill to match the app. */
    color-scheme: dark;
    -webkit-text-size-adjust: 100%;
  }

  html, body, #root {
    min-height: 100%;
  }

  body {
    background: ${({ theme }) => theme.color.bg};
    color: ${({ theme }) => theme.color.text.primary};
    font-family: ${({ theme }) => theme.fontFamily.sans};
    -webkit-font-smoothing: antialiased;
    /* Hangul breaks between syllables by default, which splits words like
       "선호" across lines — keep words whole and only break when a single
       token (a long nickname, a URL) can't fit at all. */
    word-break: keep-all;
    overflow-wrap: anywhere;
  }

  ::selection {
    background: ${({ theme }) => theme.color.accent.blueMuted};
    color: ${({ theme }) => theme.color.text.primary};
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.accent.blue};
    outline-offset: 2px;
  }
`;
