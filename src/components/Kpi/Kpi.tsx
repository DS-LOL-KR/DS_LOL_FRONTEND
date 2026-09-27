import type { ReactNode } from 'react';
import styled from 'styled-components';
import { CardBox } from '../Card/Card';

// docs/design-system.md → KPI Card: label → metric → sub line. Deltas carry
// both an arrow and a sign so they read without color.
const Box = styled(CardBox)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.p`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Metric = styled.p<{ $color?: string }>`
  font: ${({ theme }) => theme.type.metric};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: ${({ theme, $color }) => $color ?? theme.color.text.primary};
`;

export const Unit = styled.span`
  margin-left: 3px;
  font: 600 16px/1 ${({ theme }) => theme.fontFamily.sans};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Sub = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 8px;
  min-height: 17px;
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

const DeltaText = styled.span<{ $dir: 'up' | 'down' | 'flat' }>`
  font: ${({ theme }) => theme.type.captionStrong};
  font-variant-numeric: tabular-nums;
  color: ${({ theme, $dir }) =>
    $dir === 'up' ? theme.color.state.success : $dir === 'down' ? theme.color.state.danger : theme.color.text.muted};
`;

export function Delta({ value, format = (v) => v.toLocaleString() }: { value: number; format?: (v: number) => string }) {
  const dir = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const text = dir === 'up' ? `↑ +${format(value)}` : dir === 'down' ? `↓ −${format(Math.abs(value))}` : `— 0`;
  return <DeltaText $dir={dir}>{text}</DeltaText>;
}

export interface KpiProps {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  sub?: ReactNode;
  /** Only for meaning-bearing values (tier color, team color). */
  color?: string;
  className?: string;
}

export function Kpi({ label, value, unit, sub, color, className }: KpiProps) {
  return (
    <Box className={className}>
      <Label>{label}</Label>
      <Metric $color={color}>
        {value}
        {unit && <Unit>{unit}</Unit>}
      </Metric>
      <Sub>{sub}</Sub>
    </Box>
  );
}
