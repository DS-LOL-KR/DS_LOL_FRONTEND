import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useMe } from '../../features/auth/hooks';
import { useActiveGroupId } from '../../utils/activeGroup';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { Avatar } from '../Avatar/Avatar';
import { Wordmark } from '../Wordmark/Wordmark';

const Bar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space.md}px;
  height: 56px;
  padding: 0 ${({ theme }) => theme.space.lg}px;
  background: ${({ theme }) => theme.color.surface.raised};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};

  ${({ theme }) => theme.media.mobile} {
    padding: 0 ${({ theme }) => theme.space.md}px;
  }
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xl}px;
  min-width: 0;

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.space.md}px;
  }
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const Menu = styled.div`
  display: flex;
  align-items: stretch;
  align-self: stretch;
  gap: ${({ theme }) => theme.space.md}px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.space.sm}px;
  }
`;

// Full bar height so the tap target is the whole strip, with the active page
// marked by an underline on the bar's bottom edge (same idiom as 티어표 tabs).
const MenuLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0 2px;
  white-space: nowrap;
  font: ${({ theme, $active }) => ($active ? theme.font.small13b : theme.font.small13)};
  color: ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.text.secondary)};
  box-shadow: inset 0 -2px 0 ${({ theme, $active }) => ($active ? theme.color.text.primary : 'transparent')};
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

const UserGroup = styled(Link)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
  min-height: 44px;
`;

const UserName = styled.span`
  white-space: nowrap;

  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

export function Navbar() {
  const { pathname } = useLocation();
  const { data: me } = useMe();
  const activeGroupId = useActiveGroupId();

  const navItems = [
    {
      key: 'matches',
      label: '내전',
      to: activeGroupId ? `/groups/${activeGroupId}/matches` : '/groups',
      active: pathname.includes('/matches'),
    },
    { key: 'groups', label: '그룹', to: '/groups', active: pathname === '/groups' },
    {
      key: 'tiers',
      label: '티어표',
      to: activeGroupId ? `/groups/${activeGroupId}/tiers` : '/groups',
      active: pathname.includes('/tiers'),
    },
    { key: 'stats', label: '전적', to: '/stats', active: pathname === '/stats' },
  ];

  return (
    <Bar>
      <LeftGroup>
        <Brand to="/groups" aria-label="DS_LOL 홈">
          <Wordmark size={21} />
        </Brand>
        <Menu>
          {navItems.map((item) => (
            <MenuLink key={item.key} to={item.to} $active={item.active} aria-current={item.active ? 'page' : undefined}>
              {item.label}
            </MenuLink>
          ))}
        </Menu>
      </LeftGroup>
      <UserGroup to="/onboarding" title="내 프로필" aria-label="내 프로필 설정">
        <UserName>{me?.nickname ?? '...'}</UserName>
        <Avatar name={me?.nickname ?? '?'} imageUrl={resolveAssetUrl(me?.profileImageUrl)} size={28} />
      </UserGroup>
    </Bar>
  );
}
