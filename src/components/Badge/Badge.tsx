import type { ReactNode } from 'react';
import styled from 'styled-components';

type Tier = 1 | 2 | 3 | 4 | 5;

// 그룹 티어는 캡슐(배경·테두리) 없이 티어 색 글자로만 표시. 공식(라이엇) 티어는 색 없는 글자.
// `tier` 없이 쓰면 중립 태그(그룹장·진행중 등) — 이건 작은 캡슐 그대로.
const StyledBadge = styled.span<{ $tier?: Tier }>`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  color: ${({ theme, $tier }) => ($tier ? theme.color.tier[$tier] : theme.color.text.secondary)};
  ${({ theme, $tier }) =>
    $tier
      ? `font: ${theme.type.bodyStrong};`
      : `
    height: 22px;
    padding: 0 8px;
    border-radius: ${theme.radius.badge}px;
    font: ${theme.type.badge};
    background: ${theme.color.surface.subtle};
  `}
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
