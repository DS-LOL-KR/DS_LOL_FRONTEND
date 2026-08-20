import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { LoginButton } from '../features/auth/components/LoginButton';

const Screen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 360px;
`;

const Title = styled.p`
  font: ${({ theme }) => theme.font.title26};
  letter-spacing: 0.6px;
  color: ${({ theme }) => theme.color.text.primary};
`;

const Subtitle = styled.p`
  margin-top: ${({ theme }) => theme.space.xs}px;
  font: ${({ theme }) => theme.font.small13};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ButtonRow = styled.div`
  width: 100%;
  margin-top: ${({ theme }) => theme.space.xl}px;
`;

const Disclaimer = styled.p`
  margin-top: ${({ theme }) => theme.space.sm}px;
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
  opacity: 0.7;
`;

// TODO: replace with real Google OAuth flow, then call useLogin() with the ID token.
export function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    navigate('/onboarding');
  };

  return (
    <Screen>
      <Panel>
        <Title>DS_LOL</Title>
        <Subtitle>친구들과 하는 내전, 팀 짜기부터 전적까지</Subtitle>
        <ButtonRow>
          <LoginButton onClick={handleGoogleLogin} />
        </ButtonRow>
        <Disclaimer>가입하면 이용약관과 개인정보 처리방침에 동의하게 됩니다</Disclaimer>
      </Panel>
    </Screen>
  );
}
