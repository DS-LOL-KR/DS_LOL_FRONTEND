import type { ReactNode } from 'react';
import styled from 'styled-components';

type Tier = 1 | 2 | 3 | 4 | 5;

// docs/design-system.md → Tier Badge: tier-colored text on the same color at
// 10%. Group tiers only — the Riot official tier stays uncolored text.
// Without `tier` it's a neutral tag (raised fill, secondary text).
const StyledBadge = styled.span<{ $tier?: Tier }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 8px;
  border-radius: ${({ theme }) => theme.radius.badge}px;
  font: ${({ theme }) => theme.type.badge};
  white-space: nowrap;
  color: ${({ theme, $tier }) => ($tier ? theme.color.tier[$tier] : theme.color.text.secondary)};
  background: ${({ theme, $tier }) => ($tier ? theme.color.tierSoft[$tier] : theme.color.surface.subtle)};
  /* Tier 5's 10% tint all but disappears on a card — outline it. */
  box-shadow: ${({ theme, $tier }) =>
    !$tier || $tier === 5 ? `inset 0 0 0 1px ${theme.color.border.strong}` : 'none'};
`;

export interface BadgeProps {
  children?: ReactNode;
  tier?: Tier;
  className?: string;
}

export function Badge({ children, tier, className }: BadgeProps) {
  return (
    <StyledBadge $tier={tier} className={className}>
      {children ?? (tier ? `${tier}티어` : null)}
    </StyledBadge>
  );
}
