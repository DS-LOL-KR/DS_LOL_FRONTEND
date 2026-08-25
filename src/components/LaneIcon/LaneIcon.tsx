import styled from 'styled-components';

export type Lane = 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';

const Svg = styled.svg`
  flex-shrink: 0;
  color: currentColor;
`;

const PATHS: Record<Lane, string> = {
  // Shield — top laner holds the front line.
  TOP: 'M8 1.5 3 3.5v4c0 3.5 2.2 5.7 5 6.5 2.8-.8 5-3 5-6.5v-4L8 1.5Z',
  // Four-leaf shape — jungle.
  JUG: 'M8 8c0-2.5-2-4.5-4.5-4.5C3.5 6 5.5 8 8 8Zm0 0c0-2.5 2-4.5 4.5-4.5C12.5 6 10.5 8 8 8Zm0 0c2.5 0 4.5 2 4.5 4.5C10.5 12.5 8.5 10.5 8 8Zm0 0c-2.5 0-4.5 2-4.5 4.5C5.5 12.5 7.5 10.5 8 8Z',
  // Diamond — mid lane, center of the map.
  MID: 'M8 1.5 14.5 8 8 14.5 1.5 8 8 1.5Z',
  // Crosshair — attack damage carry.
  ADC: 'M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3M8 5.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z',
  // Heart-shield hybrid — support.
  SUP: 'M8 13.5S2.5 10 2.5 6a3 3 0 0 1 5.5-1.7A3 3 0 0 1 13.5 6c0 4-5.5 7.5-5.5 7.5Z',
};

const FILLED: Record<Lane, boolean> = { TOP: false, JUG: true, MID: false, ADC: false, SUP: true };

export function LaneIcon({ lane, size = 14 }: { lane: Lane; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={lane}
    >
      <path
        d={PATHS[lane]}
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={FILLED[lane] ? 'currentColor' : 'none'}
      />
    </Svg>
  );
}
