import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useMe } from '../../features/auth/hooks';
import { useActiveGroupId } from '../../utils/activeGroup';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { Avatar } from '../Avatar/Avatar';

const Bar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 ${({ theme }) => theme.space.lg}px;
  background: ${({ theme }) => theme.color.surface.subtle};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xl}px;
`;

const Brand = styled.span`
  font: ${({ theme }) => theme.font.sub15};
  letter-spacing: 0.4px;
  color: ${({ theme }) => theme.color.text.primary};
`;

const Menu = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md}px;
`;

const MenuLink = styled(Link)<{ $active?: boolean }>`
  font: ${({ theme, $active }) => ($active ? theme.font.small13b : theme.font.small13)};
  color: ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.text.secondary)};
`;

const UserGroup = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs}px;
`;

const UserName = styled.span`
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
        <Brand>DS_LOL</Brand>
        <Menu>
          {navItems.map((item) => (
            <MenuLink key={item.key} to={item.to} $active={item.active}>
              {item.label}
            </MenuLink>
          ))}
        </Menu>
      </LeftGroup>
      <UserGroup to="/onboarding" title="내 프로필">
        <UserName>{me?.nickname ?? '...'}</UserName>
        <Avatar name={me?.nickname ?? '?'} imageUrl={resolveAssetUrl(me?.profileImageUrl)} size={24} />
      </UserGroup>
    </Bar>
  );
}
