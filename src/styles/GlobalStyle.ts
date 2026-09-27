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
    background: ${({ theme }) => theme.color.canvas};
    color: ${({ theme }) => theme.color.text.primary};
    font: ${({ theme }) => theme.type.body};
    -webkit-font-smoothing: antialiased;
    /* Hangul breaks between syllables by default, which splits words like
       "선호" across lines — keep words whole and only break when a single
       token (a long nickname, a URL) can't fit at all. */
    word-break: keep-all;
    overflow-wrap: anywhere;
  }

  ::selection {
    background: ${({ theme }) => theme.color.surface.hover};
    color: ${({ theme }) => theme.color.text.primary};
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }

  /* Neutral ring — blue would read as team blue (docs/design-system.md). */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.text.secondary};
    outline-offset: 2px;
  }

  /* Every number in this product is compared against another one. */
  table, input, time {
    font-variant-numeric: tabular-nums;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
