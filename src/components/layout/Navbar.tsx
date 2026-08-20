import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../../assets/logo.svg';
import { useMe } from '../../features/auth/hooks';

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

const BrandGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs}px;
`;

const Logo = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 4px;
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

const MenuLabel = styled.span`
  font: ${({ theme }) => theme.font.small13};
  color: ${({ theme }) => theme.color.text.secondary};
  cursor: default;
`;

const UserGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs}px;
`;

const UserName = styled.span`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const UserAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 3px;
  background: ${({ theme }) => theme.color.border.strong};
`;

const NAV_ITEMS: Array<{ key: string; label: string; to?: string; match: (pathname: string) => boolean }> = [
  { key: 'scrims', label: '내전', match: (p) => p.includes('/matches') || p.startsWith('/scrims') },
  { key: 'groups', label: '그룹', to: '/groups', match: (p) => p === '/groups' },
  { key: 'tiers', label: '티어표', match: (p) => p.includes('/tiers') },
  { key: 'stats', label: '전적', to: '/stats', match: (p) => p === '/stats' },
];

// TODO: real auth state (login/logout) and active-group switcher once that flow lands.
export function Navbar() {
  const { pathname } = useLocation();
  const { data: me } = useMe();

  return (
    <Bar>
      <LeftGroup>
        <BrandGroup>
          <Logo src={logo} alt="DS_LOL" />
          <Brand>DS_LOL</Brand>
        </BrandGroup>
        <Menu>
          {NAV_ITEMS.map((item) =>
            item.to ? (
              <MenuLink key={item.key} to={item.to} $active={item.match(pathname)}>
                {item.label}
              </MenuLink>
            ) : (
              <MenuLabel key={item.key}>{item.label}</MenuLabel>
            ),
          )}
        </Menu>
      </LeftGroup>
      <UserGroup>
        <UserName>{me?.nickname ?? '재현'}</UserName>
        <UserAvatar />
      </UserGroup>
    </Bar>
  );
}
