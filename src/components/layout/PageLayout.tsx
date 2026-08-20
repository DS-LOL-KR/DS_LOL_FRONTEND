import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Navbar } from './Navbar';

const Main = styled.main`
  max-width: 1080px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.space.xl}px ${({ theme }) => theme.space.lg}px;
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
