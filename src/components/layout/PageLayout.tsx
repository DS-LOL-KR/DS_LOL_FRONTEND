import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Icon } from '../Icon/Icon';
import { Wordmark } from '../Wordmark/Wordmark';
import { Sidebar } from './Sidebar';

// docs/design-system.md → App Shell. Desktop: an inset app frame (radius 16)
// on the canvas, [sidebar 248 | content]. ≤720px: frame drops away, the
// sidebar becomes a 56px top bar + slide-in drawer.
const Frame = styled.div`
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  height: calc(100dvh - 16px);
  margin: 8px;
  background: ${({ theme }) => theme.color.bg};
  border: 1px solid ${({ theme }) => theme.color.border.base};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  overflow: hidden;

  ${({ theme }) => theme.media.mobile} {
    display: block;
    height: auto;
    min-height: 100dvh;
    margin: 0;
    border: 0;
    border-radius: 0;
    overflow: visible;
  }
`;

const DesktopSidebar = styled.div`
  min-height: 0;

  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;

const Scroll = styled.div`
  min-width: 0;
  overflow-y: auto;

  ${({ theme }) => theme.media.mobile} {
    overflow: visible;
  }
`;

const Main = styled.main`
  width: 100%;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: var(--space-8) var(--space-8) 64px;

  ${({ theme }) => theme.media.mobile} {
    padding: var(--space-6) var(--space-4) 48px;
  }
`;

const TopBar = styled.header`
  display: none;

  ${({ theme }) => theme.media.mobile} {
    position: sticky;
    top: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 ${({ theme }) => theme.space.xs}px 0 ${({ theme }) => theme.space.md}px;
    background: ${({ theme }) => theme.color.sidebar};
    border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
  }
`;

const IconButton = styled.button`
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.control}px;
  background: transparent;
  color: ${({ theme }) => theme.color.text.secondary};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.color.text.primary};
    background: ${({ theme }) => theme.color.surface.hover};
  }
`;

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  background: ${({ theme }) => theme.color.overlay};
`;

const Drawer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 41;
  width: min(300px, 86vw);
  animation: drawerIn var(--duration-base) var(--ease-out);

  @keyframes drawerIn {
    from { transform: translateX(-12px); opacity: 0; }
  }
`;

const DrawerClose = styled(IconButton)`
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
`;

export interface PageLayoutProps {
  children?: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setDrawerOpen(false), [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <Frame>
      <DesktopSidebar>
        <Sidebar />
      </DesktopSidebar>

      <TopBar>
        <Link to="/groups" aria-label="DS_LOL 홈">
          <Wordmark size={18} />
        </Link>
        <IconButton type="button" aria-label="메뉴 열기" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}>
          <Icon name="menu" size={20} />
        </IconButton>
      </TopBar>

      {drawerOpen && (
        <>
          <Scrim onClick={() => setDrawerOpen(false)} />
          <Drawer role="dialog" aria-modal="true" aria-label="메뉴">
            <DrawerClose type="button" aria-label="메뉴 닫기" onClick={() => setDrawerOpen(false)}>
              <Icon name="close" size={18} />
            </DrawerClose>
            <Sidebar />
          </Drawer>
        </>
      )}

      <Scroll>
        <Main>{children}</Main>
      </Scroll>
    </Frame>
  );
}
