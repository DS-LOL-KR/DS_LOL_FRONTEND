// NOTE: Pretendard should be swapped in for Inter in real rendering (Korean glyph coverage) since the Figma spec uses Inter as a placeholder.
export const theme = {
  color: {
    text: { primary: '#FFFFFF', secondary: '#949EB5' },
    accent: { blue: '#66A1FF', blueStrong: '#3D6BF2' },
    state: { success: '#4ADEA1', danger: '#FF6170' },
    team: { blue: '#598FFF', red: '#FF6170' },
    tier: {
      1: '#73DEEB',
      2: '#5CCCBD',
      3: '#F5C761',
      4: '#BFC7D6',
      5: '#CC9169',
    },
    surface: {
      subtle: 'rgba(255,255,255,0.05)',
      row: 'rgba(255,255,255,0.035)',
    },
    border: {
      base: 'rgba(255,255,255,0.09)',
      strong: 'rgba(255,255,255,0.14)',
    },
  },
  gradient: {
    app: 'linear-gradient(180deg, #0E111C 0%, #07080E 100%)',
    card: 'linear-gradient(180deg, rgba(23,28,46,0.94) 0%, rgba(14,17,28,0.94) 100%)',
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 20 },
  space: { xs: 6, sm: 10, md: 16, lg: 20, xl: 30 },
  // Bumped a couple of px across the board — the original scale read too small/quiet on screen.
  // Bumped again, +3px across every step (2026-09-15 문의) — token names are now
  // stale relative to their actual px (kept as-is so call sites don't churn).
  font: {
    display30: '700 37px/1.3 Inter, sans-serif',
    title26:   '700 32px/1.32 Inter, sans-serif',
    title22:   '700 28px/1.34 Inter, sans-serif',
    sub17:     '700 22px/1.4 Inter, sans-serif',
    sub15:     '600 20px/1.4 Inter, sans-serif',
    body14b:   '600 19px/1.45 Inter, sans-serif',
    body14:    '400 19px/1.45 Inter, sans-serif',
    small13b:  '600 18px/1.45 Inter, sans-serif',
    small13:   '400 18px/1.45 Inter, sans-serif',
    label12m:  '500 17px/1.45 Inter, sans-serif',
    label12:   '400 17px/1.45 Inter, sans-serif',
    caption11m:'500 16px/1.5 Inter, sans-serif',
    caption11: '400 16px/1.5 Inter, sans-serif',
    badge10:   '700 15px/1.4 Inter, sans-serif',
    badge9:    '700 14px/1.4 Inter, sans-serif',
  },
} as const;
