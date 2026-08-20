import styled from 'styled-components';
import logo from '../../assets/logo.svg';

const Bar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 ${({ theme }) => theme.space.lg}px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const BrandGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs}px;
`;

const Logo = styled.img`
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
`;

const Brand = styled.span`
  font: ${({ theme }) => theme.font.title22};
  color: ${({ theme }) => theme.color.text.primary};
`;

// TODO: nav links, auth state (login/logout), active-group switcher.
export function Navbar() {
  return (
    <Bar>
      <BrandGroup>
        <Logo src={logo} alt="DS_LOL" />
        <Brand>DS_LOL</Brand>
      </BrandGroup>
    </Bar>
  );
}
