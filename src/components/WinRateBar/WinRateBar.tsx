import styled from 'styled-components';

const Track = styled.div`
  display: flex;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: ${({ theme }) => theme.color.surface.subtle};
`;

const WinSegment = styled.div<{ $pct: number }>`
  width: ${({ $pct }) => $pct}%;
  background: ${({ theme }) => theme.color.state.success};
`;

const LossSegment = styled.div<{ $pct: number }>`
  width: ${({ $pct }) => $pct}%;
  background: ${({ theme }) => theme.color.state.danger};
`;

export interface WinRateBarProps {
  wins: number;
  losses: number;
  className?: string;
}

export function WinRateBar({ wins, losses, className }: WinRateBarProps) {
  const total = wins + losses;
  const winPct = total > 0 ? (wins / total) * 100 : 0;
  return (
    <Track className={className} title={`${wins}승 ${losses}패`}>
      <WinSegment $pct={winPct} />
      <LossSegment $pct={100 - winPct} />
    </Track>
  );
}
