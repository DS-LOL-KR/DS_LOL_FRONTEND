import type { ReactNode } from 'react';
import styled from 'styled-components';

const StyledCard = styled.div`
  background: ${({ theme }) => theme.gradient.card};
  border: 1px solid ${({ theme }) => theme.color.border.base};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  padding: ${({ theme }) => theme.space.md}px;
`;

export interface CardProps {
  children?: ReactNode;
  className?: string;
}

// TODO: flesh out card variants (elevated, interactive) as designs solidify.
export function Card({ children, className }: CardProps) {
  return <StyledCard className={className}>{children}</StyledCard>;
}
