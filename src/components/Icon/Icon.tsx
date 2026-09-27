import styled from 'styled-components';

// 16px, 1.5px stroke, currentColor — abstract shapes only (no game/brand art).
export type IconName =
  | 'matches'
  | 'tiers'
  | 'stats'
  | 'settings'
  | 'groups'
  | 'chevronDown'
  | 'chevronRight'
  | 'plus'
  | 'refresh'
  | 'menu'
  | 'close'
  | 'check'
  | 'link'
  | 'chat'
  | 'user'
  | 'copy'
  | 'trophy'
  | 'history'
  | 'swap'
  | 'star';

const PATHS: Record<IconName, JSX.Element> = {
  matches: (
    <>
      <rect x="2" y="3" width="5" height="10" rx="1.2" />
      <rect x="9" y="3" width="5" height="10" rx="1.2" />
    </>
  ),
  tiers: <path d="M3 4h10M3 8h7M3 12h4" />,
  stats: <path d="M3 13V9M8 13V3M13 13V6" />,
  settings: (
    <>
      <path d="M2.5 4.5h6M11.5 4.5h2M2.5 11.5h2M7.5 11.5h6" />
      <circle cx="10" cy="4.5" r="1.5" />
      <circle cx="6" cy="11.5" r="1.5" />
    </>
  ),
  groups: (
    <>
      <circle cx="6" cy="6" r="2.3" />
      <path d="M2 13c.4-2.3 2-3.5 4-3.5s3.6 1.2 4 3.5" />
      <path d="M10.5 3.9a2.2 2.2 0 0 1 0 4.2M11.8 9.7c1.2.4 2 1.5 2.2 3.3" />
    </>
  ),
  chevronDown: <path d="M4.5 6.5 8 10l3.5-3.5" />,
  chevronRight: <path d="M6.5 4.5 10 8l-3.5 3.5" />,
  plus: <path d="M8 3.5v9M3.5 8h9" />,
  refresh: (
    <>
      <path d="M13 8a5 5 0 1 1-1.5-3.6" />
      <path d="M13 2.8v2.6h-2.6" />
    </>
  ),
  menu: <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />,
  close: <path d="M4 4l8 8M12 4l-8 8" />,
  check: <path d="M3.5 8.5 6.5 11.5 12.5 5" />,
  link: (
    <>
      <path d="M6.8 9.2a2.5 2.5 0 0 0 3.5 0l2.2-2.2a2.5 2.5 0 0 0-3.5-3.5l-.7.7" />
      <path d="M9.2 6.8a2.5 2.5 0 0 0-3.5 0L3.5 9a2.5 2.5 0 0 0 3.5 3.5l.7-.7" />
    </>
  ),
  chat: <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h7A1.5 1.5 0 0 1 13 4.5v5a1.5 1.5 0 0 1-1.5 1.5H7l-3 2.2V11h0A1.5 1.5 0 0 1 3 9.5z" />,
  user: (
    <>
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M3 13.5c.5-2.6 2.5-4 5-4s4.5 1.4 5 4" />
    </>
  ),
  copy: (
    <>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
    </>
  ),
  trophy: (
    <>
      <path d="M5 2.5h6v4a3 3 0 0 1-6 0z" />
      <path d="M5 4H2.8v.8A2.2 2.2 0 0 0 5 7M11 4h2.2v.8A2.2 2.2 0 0 1 11 7M8 9.5v2.5M5.5 13.5h5" />
    </>
  ),
  history: (
    <>
      <path d="M2.8 8a5.2 5.2 0 1 0 1.5-3.7" />
      <path d="M2.8 2.5v2.8h2.8M8 5v3.2l2 1.3" />
    </>
  ),
  swap: <path d="M3 5.5h9.5L10 3M13 10.5H3.5L6 13" />,
  star: <path d="M8 2.5l1.7 3.5 3.8.5-2.8 2.6.7 3.8L8 11.1l-3.4 1.8.7-3.8-2.8-2.6 3.8-.5z" />,
};

const Svg = styled.svg`
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

export function Icon({ name, size = 16, label }: { name: IconName; size?: number; label?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {PATHS[name]}
    </Svg>
  );
}
