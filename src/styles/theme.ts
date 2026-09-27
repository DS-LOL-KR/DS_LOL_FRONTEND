// Every value here points at a CSS variable from tokens.css (docs/design-system.md),
// so the tokens stay the single source of truth and the mobile type overrides in
// tokens.css apply without a JS media query. Old key names are kept so existing
// call sites keep compiling; new code should prefer the semantic keys
// (`surface.card`, `text.muted`, `type.*`).
const SANS = 'var(--font-sans)';

export const theme = {
  color: {
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      muted: 'var(--text-muted)',
      onPrimary: 'var(--text-on-primary)',
    },
    // Only for "the active/selected datum" in charts — never for links, focus or
    // nav state (it reads as team blue).
    accent: { blue: 'var(--chart-bar-active)', blueStrong: 'var(--chart-bar-active)', blueMuted: 'var(--chart-bar)' },
    state: {
      success: 'var(--status-win)',
      successSoft: 'var(--status-win-soft)',
      danger: 'var(--status-lose)',
      dangerSoft: 'var(--status-lose-soft)',
      dangerLine: 'var(--team-red-line)',
    },
    team: {
      red: 'var(--team-red)',
      redSoft: 'var(--team-red-soft)',
      blue: 'var(--team-blue)',
      blueSoft: 'var(--team-blue-soft)',
    },
    tier: {
      1: 'var(--tier-1)',
      2: 'var(--tier-2)',
      3: 'var(--tier-3)',
      4: 'var(--tier-4)',
      5: 'var(--tier-5)',
    },
    tierSoft: {
      1: 'var(--tier-1-soft)',
      2: 'var(--tier-2-soft)',
      3: 'var(--tier-3-soft)',
      4: 'var(--tier-4-soft)',
      5: 'var(--tier-5-soft)',
    },
    chart: {
      bar: 'var(--chart-bar)',
      barActive: 'var(--chart-bar-active)',
      grid: 'var(--chart-grid)',
    },
    bg: 'var(--bg-app)',
    canvas: 'var(--bg-canvas)',
    sidebar: 'var(--bg-sidebar)',
    overlay: 'var(--bg-overlay)',
    surface: {
      card: 'var(--bg-surface)',
      // `subtle`/`row` were translucent fills inside cards → the raised step.
      subtle: 'var(--bg-surface-raised)',
      row: 'var(--bg-surface-raised)',
      raised: 'var(--bg-surface)',
      hover: 'var(--bg-hover)',
    },
    border: {
      base: 'var(--border-subtle)',
      strong: 'var(--border-default)',
    },
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 16, badge: 6, control: 8, card: 12 },
  media: {
    wide: '@media (max-width: 1100px)',
    mobile: '@media (max-width: 720px)',
    narrow: '@media (max-width: 480px)',
  },
  fontFamily: { sans: SANS },
  space: { xs: 8, sm: 12, md: 16, lg: 20, xl: 32 },
  // Semantic scale (docs/design-system.md → Typography).
  type: {
    hero: 'var(--type-hero)',
    display: 'var(--type-display)',
    metric: 'var(--type-metric)',
    heading: 'var(--type-heading)',
    body: 'var(--type-body)',
    bodyStrong: 'var(--type-body-strong)',
    label: 'var(--type-label)',
    labelStrong: '600 13px/1.45 ' + SANS,
    caption: 'var(--type-caption)',
    captionStrong: '600 12px/1.4 ' + SANS,
    badge: 'var(--type-badge)',
  },
  // Legacy names → nearest step of the new scale. The old names described px
  // sizes that had drifted (+3px twice); they now map to the system scale.
  font: {
    display30: 'var(--type-display)',
    title26: 'var(--type-display)',
    title22: '700 20px/1.3 ' + SANS,
    sub17: 'var(--type-heading)',
    sub15: 'var(--type-heading)',
    body14b: 'var(--type-body-strong)',
    body14: 'var(--type-body)',
    small13b: '600 13px/1.45 ' + SANS,
    small13: 'var(--type-label)',
    label12m: '500 13px/1.45 ' + SANS,
    label12: 'var(--type-label)',
    caption11m: '500 12px/1.4 ' + SANS,
    caption11: 'var(--type-caption)',
    badge10: 'var(--type-badge)',
    badge9: '600 11px/1 ' + SANS,
  },
} as const;
