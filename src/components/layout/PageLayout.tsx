import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Navbar } from './Navbar';

const Main = styled.main`
  max-width: 1368px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.space.xl}px 36px 64px;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.space.lg}px ${({ theme }) => theme.space.md}px 48px;
  }
`;

export interface PageLayoutProps {
  children?: ReactNode;
}

// TODO: sidebar/breadcrumbs once information architecture is finalized.
export function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      <Navbar />
      <Main>{children}</Main>
    </>
  );
}
