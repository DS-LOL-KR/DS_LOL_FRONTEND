import type { ReactNode } from 'react';
import styled from 'styled-components';

type Tier = 1 | 2 | 3 | 4 | 5;

const StyledBadge = styled.span<{ $tier?: Tier }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  font: ${({ theme }) => theme.font.badge10};
  background: ${({ theme, $tier }) =>
    $tier ? theme.color.tier[$tier] : theme.color.surface.subtle};
  color: ${({ theme }) => theme.color.text.primary};
`;

export interface BadgeProps {
  children?: ReactNode;
  tier?: Tier;
  className?: string;
}

// TODO: support non-tier badge variants (status, role) once spec'd.
export function Badge({ children, tier, className }: BadgeProps) {
  return (
    <StyledBadge $tier={tier} className={className}>
      {children}
    </StyledBadge>
  );
}
