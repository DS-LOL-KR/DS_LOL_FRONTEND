import styled from 'styled-components';

export type Lane = 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';

// docs/design-system.md → Position Icon: an abstract minimap. All three lanes
// are drawn faint and the player's lane at full strength — no official Riot
// lane art. (A closed frame with a filled corner read as a checkbox in tables.)
const Svg = styled.svg`
  flex-shrink: 0;
  color: currentColor;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const TOP_LANE = 'M2.5 13.5V2.5h11';
const BOT_LANE = 'M2.5 13.5h11v-11';
const MID_LANE = 'M3.5 12.5l9-9';

function Highlight({ lane }: { lane: Lane }) {
  switch (lane) {
    case 'TOP':
      return <path d={TOP_LANE} />;
    case 'MID':
      return <path d={MID_LANE} />;
    case 'ADC':
      return <path d={BOT_LANE} />;
    case 'JUG':
      return (
        <g fill="currentColor" stroke="none">
          <circle cx="6" cy="6.5" r="1.4" />
          <circle cx="10" cy="9.5" r="1.4" />
        </g>
      );
    case 'SUP':
      return (
        <>
          <path d="M7 13.5h6.5V7" />
          <circle cx="13.5" cy="13.5" r="1.8" fill="currentColor" stroke="none" />
        </>
      );
  }
}

export function LaneIcon({ lane, size = 16 }: { lane: Lane; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={lane}>
      <g opacity={0.25}>
        <path d={TOP_LANE} />
        <path d={BOT_LANE} />
        <path d={MID_LANE} />
      </g>
      <Highlight lane={lane} />
    </Svg>
  );
}

const LabelRow = styled.span<{ $main?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: 500 12px/1 ${({ theme }) => theme.fontFamily.sans};
  letter-spacing: 0.02em;
  color: ${({ theme, $main }) => ($main ? theme.color.text.primary : theme.color.text.secondary)};
`;

// Icon + abbreviation. `iconOnly` for tight spots (side-by-side rosters, phones).
export function LaneLabel({ lane, main, iconOnly }: { lane: Lane; main?: boolean; iconOnly?: boolean }) {
  return (
    <LabelRow $main={main} title={iconOnly ? lane : undefined}>
      <LaneIcon lane={lane} />
      {!iconOnly && lane}
    </LabelRow>
  );
}
