import styled from 'styled-components';
import { Link } from 'react-router-dom';
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

const Title = styled.h1`
  font: 700 48px/1.2 Inter, sans-serif;
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

const Description = styled.p`
  margin-top: ${({ theme }) => theme.space.md}px;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  line-height: 1.6;
`;

const Disclaimer = styled.p`
  margin-top: ${({ theme }) => theme.space.sm}px;
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
  opacity: 0.7;
`;

const DisclaimerLink = styled(Link)`
  color: inherit;
  text-decoration: underline;
`;

export function LoginPage() {
  return (
    <Screen>
      <Panel>
        <Title>DS_LOL</Title>
        <Subtitle>친구들과 하는 내전, 팀 짜기부터 전적까지</Subtitle>
        <Description>
          League of Legends 그룹을 만들어 그룹원의 라이엇 전적을 기반으로 티어를 매기고,
          AI가 MMR과 선호 라인을 고려해 내전 팀을 자동으로 구성해주는 서비스예요.
        </Description>
        <ButtonRow>
          <LoginButton />
        </ButtonRow>
        <Disclaimer>
          가입하면 이용약관과 <DisclaimerLink to="/privacy">개인정보 처리방침</DisclaimerLink>에 동의하게 됩니다
        </Disclaimer>
      </Panel>
    </Screen>
  );
}
