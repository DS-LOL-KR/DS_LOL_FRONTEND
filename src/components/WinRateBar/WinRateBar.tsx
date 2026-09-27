import styled from 'styled-components';

// docs/design-system.md → Win Rate Bar: 4px, win | loss with a 2px gap, % on
// the right. `compact` (tables with 5+ rows) greys the loss segment so a column
// of red doesn't blend into the red-team markers.
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const Track = styled.div`
  display: flex;
  gap: 2px;
  flex: 1;
  min-width: 48px;
  height: 4px;
`;

const Segment = styled.span<{ $pct: number; $color: string }>`
  width: ${({ $pct }) => $pct}%;
  border-radius: var(--radius-full);
  background: ${({ $color }) => $color};
`;

const Pct = styled.span`
  width: 36px;
  flex-shrink: 0;
  text-align: right;
  font: ${({ theme }) => theme.type.label};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.primary};
`;

const Empty = styled.span`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.muted};
`;

export interface WinRateBarProps {
  wins: number;
  losses: number;
  compact?: boolean;
  /** Hide the % label (when the caller prints it elsewhere). */
  hideLabel?: boolean;
  className?: string;
}

export function WinRateBar({ wins, losses, compact, hideLabel, className }: WinRateBarProps) {
  const total = wins + losses;
  if (total === 0) return <Empty className={className}>—</Empty>;
  const winPct = (wins / total) * 100;
  return (
    <Row className={className} title={`${wins}승 ${losses}패`}>
      <Track aria-hidden="true">
        {wins > 0 && <Segment $pct={winPct} $color="var(--status-win)" />}
        {losses > 0 && (
          <Segment $pct={100 - winPct} $color={compact ? 'var(--chart-bar)' : 'var(--status-lose)'} style={{ flex: 1 }} />
        )}
      </Track>
      {!hideLabel && <Pct>{Math.round(winPct)}%</Pct>}
    </Row>
  );
}
