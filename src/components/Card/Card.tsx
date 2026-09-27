import type { ReactNode } from 'react';
import styled, { css } from 'styled-components';

// docs/design-system.md → surface layer 2. 1px subtle border, no shadow; a
// card never sits inside another card (use `raised` rows inside instead).
// `$flush` drops the padding for cards whose content (a table) pads itself.
export const CardBox = styled.section<{ $flush?: boolean }>`
  min-width: 0;
  background: ${({ theme }) => theme.color.surface.card};
  border: 1px solid ${({ theme }) => theme.color.border.base};
  border-radius: ${({ theme }) => theme.radius.card}px;
  padding: ${({ $flush }) => ($flush ? 0 : 'var(--card-padding)')};
  ${({ $flush }) =>
    $flush &&
    css`
      overflow: hidden;
    `}
`;

export interface CardProps {
  children?: ReactNode;
  className?: string;
  flush?: boolean;
}

export function Card({ children, className, flush }: CardProps) {
  return (
    <CardBox className={className} $flush={flush}>
      {children}
    </CardBox>
  );
}

// Card title row: optional 32px icon box, heading + caption, right-side action.
const HeaderRow = styled.div<{ $inset?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm}px;
  margin-bottom: ${({ theme }) => theme.space.md}px;
  ${({ $inset }) =>
    $inset &&
    css`
      margin-bottom: 0;
      padding: var(--card-padding) var(--card-padding) ${({ theme }) => theme.space.md}px;
    `}
`;

export const IconBox = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: var(--icon-box);
  height: var(--icon-box);
  background: ${({ theme }) => theme.color.surface.subtle};
  border: 1px solid ${({ theme }) => theme.color.border.strong};
  border-radius: ${({ theme }) => theme.radius.control}px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const TitleBlock = styled.div`
  flex: 1;
  min-width: 0;
`;

export const CardTitle = styled.h2`
  font: ${({ theme }) => theme.type.heading};
  color: ${({ theme }) => theme.color.text.primary};
`;

const CardDescription = styled.p`
  margin-top: 2px;
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export interface SectionHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  /** Set inside a flush card so the header carries the card's padding. */
  inset?: boolean;
  as?: 'h2' | 'h3';
}

export function SectionHeader({ title, description, icon, action, inset, as = 'h2' }: SectionHeaderProps) {
  return (
    <HeaderRow $inset={inset}>
      {icon && <IconBox aria-hidden="true">{icon}</IconBox>}
      <TitleBlock>
        <CardTitle as={as}>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </TitleBlock>
      {action}
    </HeaderRow>
  );
}
