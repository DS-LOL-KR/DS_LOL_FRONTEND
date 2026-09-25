// Pretendard is self-hosted from the `pretendard` package (imported in main.tsx).
// The Figma spec used Inter as a placeholder, but Inter was never loaded, so every
// `font` shorthand below silently fell back to the OS sans — Pretendard covers
// Latin and Hangul in one family and is what the product actually ships.
const SANS = "Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

export const theme = {
  color: {
    text: { primary: '#FFFFFF', secondary: '#949EB5' },
    accent: { blue: '#66A1FF', blueStrong: '#3D6BF2', blueMuted: 'rgba(102,161,255,0.32)' },
    state: { success: '#4ADEA1', danger: '#FF6170' },
    team: { blue: '#598FFF', red: '#FF6170' },
    tier: {
      1: '#73DEEB',
      2: '#5CCCBD',
      3: '#F5C761',
      4: '#BFC7D6',
      5: '#CC9169',
    },
    // Flat, slightly blue-black ground (the old top-to-bottom gradient read as
    // a template default); `raised` is the one elevated plane (bars, dialogs).
    bg: '#090B12',
    surface: {
      subtle: 'rgba(255,255,255,0.05)',
      row: 'rgba(255,255,255,0.035)',
      raised: '#121521',
    },
    border: {
      base: 'rgba(255,255,255,0.09)',
      strong: 'rgba(255,255,255,0.14)',
    },
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 20 },
  // One breakpoint carries the layout switch (side-by-side → stacked); `narrow`
  // only trims secondary columns that can't fit on a phone at all.
  media: {
    mobile: '@media (max-width: 720px)',
    narrow: '@media (max-width: 480px)',
  },
  fontFamily: { sans: SANS },
  space: { xs: 6, sm: 10, md: 16, lg: 20, xl: 30 },
  // Bumped a couple of px across the board — the original scale read too small/quiet on screen.
  // Bumped again, +3px across every step (2026-09-15 문의) — token names are now
  // stale relative to their actual px (kept as-is so call sites don't churn).
  font: {
    display30: '700 37px/1.3 ' + SANS,
    title26:   '700 32px/1.32 ' + SANS,
    title22:   '700 28px/1.34 ' + SANS,
    sub17:     '700 22px/1.4 ' + SANS,
    sub15:     '600 20px/1.4 ' + SANS,
    body14b:   '600 19px/1.45 ' + SANS,
    body14:    '400 19px/1.45 ' + SANS,
    small13b:  '600 18px/1.45 ' + SANS,
    small13:   '400 18px/1.45 ' + SANS,
    label12m:  '500 17px/1.45 ' + SANS,
    label12:   '400 17px/1.45 ' + SANS,
    caption11m:'500 16px/1.5 ' + SANS,
    caption11: '400 16px/1.5 ' + SANS,
    badge10:   '700 15px/1.4 ' + SANS,
    badge9:    '700 14px/1.4 ' + SANS,
  },
} as const;
