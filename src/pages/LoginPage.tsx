import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { LoginButton } from '../features/auth/components/LoginButton';

const Screen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  max-width: 420px;
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

const Description = styled.p`
  margin-top: ${({ theme }) => theme.space.md}px;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  line-height: 1.6;
`;

// [추가] 데이터 사용 목적 안내용 스타일
const PrivacyNotice = styled.div`
  margin-top: ${({ theme }) => theme.space.md}px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.secondary};
  line-height: 1.5;
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

const DisclaimerLink = styled(Link)`
  color: inherit;
  text-decoration: underline;
`;

export function LoginPage() {
  return (
      <Screen>
        <Panel>
          {/* OAuth 콘솔에 등록한 이름("DS_LOL")과 철자 및 대소문자가 정확히 일치해야 함 */}
          <Title>DS_LOL</Title>
          <Subtitle>친구들과 하는 내전, 팀 짜기부터 전적까지</Subtitle>

          <Description>
            DS_LOL은 League of Legends 그룹을 만들어 그룹원의 라이엇 전적을 기반으로 티어를 매기고,
            AI가 MMR과 선호 라인을 고려해 내전 팀을 자동으로 구성해주는 서비스입니다.
          </Description>

          {/* [중요] 구글 검수팀 가이드라인: 데이터 수집 목적 명시 */}
          <PrivacyNotice>
            <strong>사용자 정보 활용 안내:</strong><br />
            DS_LOL은 사용자의 로그인 식별, 내전 그룹 프로필 생성 및 그룹 서비스 제공을 위해 최소한의 Google 계정 기본 정보(이메일, 프로필)만을 수집 및 활용합니다.
          </PrivacyNotice>

          <ButtonRow>
            <LoginButton />
          </ButtonRow>

          <Disclaimer>
            가입하면 이용약관과 <DisclaimerLink to="/privacy">개인정보 처리방침</DisclaimerLink>에 동의하게 됩니다.
          </Disclaimer>
        </Panel>
      </Screen>
  );
}