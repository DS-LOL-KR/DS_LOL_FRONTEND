import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { LoginButton } from '../features/auth/components/LoginButton';
import { Wordmark } from '../components/Wordmark/Wordmark';
import { LaneIcon, type Lane } from '../components/LaneIcon/LaneIcon';

// Split screen instead of the stock centered hero: the left column says what
// DS_LOL is and signs you in; the right shows the thing it actually produces —
// a red-vs-blue split with its balance verdict — so the first screen already
// looks like this product and no other.
const Screen = styled.main`
  display: grid;
  grid-template-columns: minmax(0, 520px) minmax(0, 1fr);
  min-height: 100vh;

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Intro = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px 56px;

  ${({ theme }) => theme.media.mobile} {
    padding: 48px ${({ theme }) => theme.space.md}px 32px;
  }
`;

const Title = styled.h1`
  line-height: 1;
`;

const Tagline = styled.p`
  margin-top: 28px;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.color.text.primary};
  text-wrap: balance;

  ${({ theme }) => theme.media.mobile} {
    font-size: 28px;
  }
`;

const Description = styled.p`
  margin-top: ${({ theme }) => theme.space.md}px;
  max-width: 34em;
  font: ${({ theme }) => theme.font.body14};
  line-height: 1.65;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ButtonRow = styled.div`
  width: 100%;
  max-width: 400px;
  margin-top: 36px;
`;

const Disclaimer = styled.p`
  margin-top: ${({ theme }) => theme.space.sm}px;
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const DisclaimerLink = styled(Link)`
  color: ${({ theme }) => theme.color.text.primary};
  text-decoration: underline;
  text-underline-offset: 3px;
`;

// Google 검수팀 가이드라인: 데이터 수집 목적 명시 — 박스 대신 폼 하단의 작은
// 글로 두되, 내용과 노출 위치(로그인 버튼과 같은 화면)는 그대로 유지.
const PrivacyNotice = styled.p`
  margin-top: 32px;
  padding-top: ${({ theme }) => theme.space.md}px;
  max-width: 400px;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
  font: ${({ theme }) => theme.font.caption11};
  line-height: 1.6;
  color: ${({ theme }) => theme.color.text.secondary};

  strong {
    font-weight: 600;
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

const Preview = styled.section`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 56px;
  background: ${({ theme }) => theme.color.surface.raised};
  border-left: 1px solid ${({ theme }) => theme.color.border.base};
  overflow: hidden;

  ${({ theme }) => theme.media.mobile} {
    padding: 32px ${({ theme }) => theme.space.md}px 48px;
    border-left: none;
    border-top: 1px solid ${({ theme }) => theme.color.border.base};
  }
`;

const Board = styled.div`
  width: 100%;
  max-width: 560px;
`;

const BoardCaption = styled.p`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Score = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  margin-top: ${({ theme }) => theme.space.md}px;
`;

const ScoreSide = styled.div<{ $team: 'red' | 'blue' }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $team }) => ($team === 'red' ? 'flex-start' : 'flex-end')};

  span {
    font: ${({ theme }) => theme.font.small13b};
    color: ${({ theme, $team }) => theme.color.team[$team]};
  }

  strong {
    font-size: 40px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

const ScoreVerdict = styled.div`
  padding-bottom: 6px;
  text-align: center;
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};

  strong {
    display: block;
    font-size: 22px;
    font-weight: 800;
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

const Gauge = styled.div`
  position: relative;
  display: flex;
  gap: 3px;
  margin-top: 14px;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: -4px;
    bottom: -4px;
    width: 2px;
    transform: translateX(-50%);
    background: ${({ theme }) => theme.color.text.primary};
  }
`;

const GaugePart = styled.span<{ $team: 'red' | 'blue'; $share: number }>`
  flex: ${({ $share }) => $share} 1 0;
  height: 10px;
  background: ${({ theme, $team }) => theme.color.team[$team]};
`;

const Lanes = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 32px;
  margin-top: 28px;

  ${({ theme }) => theme.media.narrow} {
    column-gap: ${({ theme }) => theme.space.md}px;
  }
`;

const LaneRow = styled.div<{ $mirror?: boolean }>`
  display: flex;
  flex-direction: ${({ $mirror }) => ($mirror ? 'row-reverse' : 'row')};
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
  font: ${({ theme }) => theme.font.caption11m};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.secondary};

  b {
    margin-${({ $mirror }) => ($mirror ? 'right' : 'left')}: auto;
    font: ${({ theme }) => theme.font.body14b};
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

const TierDot = styled.span<{ $tier: 1 | 2 | 3 | 4 | 5 }>`
  font-weight: 700;
  color: ${({ theme, $tier }) => theme.color.tier[$tier]};
`;

// 예시 화면용 값 — 실제 사용자·전적이 아니라 팀 구성 화면의 모양을 보여주는
// 샘플. 캡션에 "예시"라고 밝혀둠.
const SAMPLE: { lane: Lane; red: [1 | 2 | 3 | 4 | 5, number]; blue: [1 | 2 | 3 | 4 | 5, number] }[] = [
  { lane: 'TOP', red: [1, 1663], blue: [1, 1626] },
  { lane: 'JUG', red: [2, 1589], blue: [2, 1552] },
  { lane: 'MID', red: [2, 1515], blue: [3, 1478] },
  { lane: 'ADC', red: [3, 1441], blue: [3, 1404] },
  { lane: 'SUP', red: [4, 1367], blue: [4, 1330] },
];

function MatchupPreview() {
  return (
    <Board aria-hidden="true">
      <BoardCaption>예시 · AI 팀 구성 결과</BoardCaption>
      <Score>
        <ScoreSide $team="red">
          <span>레드</span>
          <strong>1515</strong>
        </ScoreSide>
        <ScoreVerdict>
          <strong>밸런스 98%</strong>
          예상 승률 51 : 49
        </ScoreVerdict>
        <ScoreSide $team="blue">
          <span>블루</span>
          <strong>1478</strong>
        </ScoreSide>
      </Score>
      <Gauge>
        <GaugePart $team="red" $share={0.51} />
        <GaugePart $team="blue" $share={0.49} />
      </Gauge>
      <Lanes>
        <div>
          {SAMPLE.map((r) => (
            <LaneRow key={r.lane}>
              <LaneIcon lane={r.lane} size={14} />
              {r.lane}
              <TierDot $tier={r.red[0]}>{r.red[0]}티어</TierDot>
              <b>{r.red[1]}</b>
            </LaneRow>
          ))}
        </div>
        <div>
          {SAMPLE.map((r) => (
            <LaneRow key={r.lane} $mirror>
              <LaneIcon lane={r.lane} size={14} />
              {r.lane}
              <TierDot $tier={r.blue[0]}>{r.blue[0]}티어</TierDot>
              <b>{r.blue[1]}</b>
            </LaneRow>
          ))}
        </div>
      </Lanes>
    </Board>
  );
}

export function LoginPage() {
  return (
    <Screen>
      <Intro>
        {/* OAuth 콘솔에 등록한 이름("DS_LOL")과 철자 및 대소문자가 정확히 일치해야 함 */}
        <Title>
          <Wordmark size={44} />
        </Title>
        <Tagline>친구들과 하는 내전, 팀 짜기부터 전적까지</Tagline>

        <Description>
          DS_LOL은 League of Legends 그룹을 만들어 그룹원의 라이엇 전적을 기반으로 티어를 매기고,
          AI가 MMR과 선호 라인을 고려해 내전 팀을 자동으로 구성해주는 서비스입니다.
        </Description>

        <ButtonRow>
          <LoginButton />
        </ButtonRow>

        <Disclaimer>
          가입하면 이용약관과 <DisclaimerLink to="/privacy">개인정보 처리방침</DisclaimerLink>에 동의하게 됩니다.
        </Disclaimer>

        {/* [중요] 구글 검수팀 가이드라인: 데이터 수집 목적 명시 */}
        <PrivacyNotice>
          <strong>사용자 정보 활용 안내</strong>
          <br />
          DS_LOL은 사용자의 로그인 식별, 내전 그룹 프로필 생성 및 그룹 서비스 제공을 위해 최소한의 Google 계정 기본
          정보(이메일, 프로필)만을 수집 및 활용합니다.
        </PrivacyNotice>
      </Intro>

      <Preview>
        <MatchupPreview />
      </Preview>
    </Screen>
  );
}
