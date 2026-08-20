import styled from 'styled-components';
import { googleLoginUrl } from '../api';

const StyledLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 46px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background: ${({ theme }) => theme.color.text.primary};
  color: #121315;
  font: ${({ theme }) => theme.font.body14b};
  transition: filter 0.15s ease;

  &:hover {
    filter: brightness(0.95);
  }
`;

const Icon = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.accent.blue};
  flex-shrink: 0;
`;

// GET /auth/google starts the server-side Google OAuth redirect — a plain
// navigation, not a fetch, so this renders as a link rather than a button+onClick.
export function LoginButton() {
  return (
    <StyledLink href={googleLoginUrl()}>
      <Icon />
      Google 계정으로 계속하기
    </StyledLink>
  );
}
