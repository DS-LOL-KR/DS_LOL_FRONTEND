import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { LoginButton } from '../features/auth/components/LoginButton';
import { Wordmark } from '../components/Wordmark/Wordmark';
import { CardBox, SectionHeader } from '../components/Card/Card';
import { Badge } from '../components/Badge/Badge';
import { Icon } from '../components/Icon/Icon';
import { LaneIcon, type Lane } from '../components/LaneIcon/LaneIcon';

// Split screen instead of the stock centered hero: the left column says what
// DS_LOL is and signs you in; the right shows the thing it actually produces —
// a red-vs-blue split with its balance verdict — so the first screen already
// looks like this product and no other. Standalone (no sidebar shell): the
// visitor isn't signed in yet.
const Screen = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-12) var(--space-8);
  background: ${({ theme }) => theme.color.canvas};

  ${({ theme }) => theme.media.mobile} {
    align-items: flex-start;
    padding: var(--space-8) var(--space-4) var(--space-12);
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: var(--space-12);
  width: 100%;
  max-width: 1040px;

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-8);
  }
`;

const Intro = styled.section`
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 440px;
`;

const Title = styled.h1`
  line-height: 1;
`;

const Tagline = styled.p`
  margin-top: var(--space-6);
  font: ${({ theme }) => theme.type.display};
  letter-spacing: var(--type-display-tracking);
  color: ${({ theme }) => theme.color.text.primary};
  text-wrap: balance;
`;

const Description = styled.p`
  margin-top: var(--space-3);
  font: ${({ theme }) => theme.type.body};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ButtonRow = styled.div`
  width: 100%;
  margin-top: var(--space-8);
`;

const Disclaimer = styled.p`
  margin-top: var(--space-3);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.secondary};
`;

// Neutral link — no blue (it reads as team blue). Underline carries the affordance.
const DisclaimerLink = styled(Link)`
  color: ${({ theme }) => theme.color.text.primary};
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: ${({ theme }) => theme.color.text.secondary};
  }
`;

// Google 검수팀 가이드라인: 데이터 수집 목적 명시 — 박스 대신 폼 하단의 작은
// 글로 두되, 내용과 노출 위치(로그인 버튼과 같은 화면)는 그대로 유지.
const PrivacyNotice = styled.p`
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.secondary};

  strong {
    display: block;
    margin-bottom: var(--space-1);
    font: ${({ theme }) => theme.type.captionStrong};
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

// ── Feature preview: a small card built from the system itself ──

const PreviewCard = styled(CardBox)`
  width: 100%;
`;

// docs/design-system.md → Team Balance Bar
const Balance = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const BalanceMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-1) var(--space-3);
`;

const BalanceScore = styled.span`
  font: ${({ theme }) => theme.type.body};
  color: ${({ theme }) => theme.color.text.secondary};

  b {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

const BalanceOdds = styled.span`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
  white-space: nowrap;
`;

const TeamNum = styled.b<{ $team: 'red' | 'blue' }>`
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${({ theme, $team }) => theme.color.team[$team]};
`;

const BalanceTrack = styled.div`
  position: relative;
  display: flex;
  gap: 2px;
  height: 6px;
`;

const BalancePart = styled.span<{ $team: 'red' | 'blue'; $width?: number }>`
  ${({ $width }) => ($width !== undefined ? `width: ${$width}%;` : 'flex: 1;')}
  background: ${({ theme, $team }) => theme.color.team[$team]};
  border-radius: var(--radius-full);
`;

const BalanceMarker = styled.span`
  position: absolute;
  left: 50%;
  top: -3px;
  width: 2px;
  height: 12px;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.color.text.primary};
  border-radius: 1px;
  /* knockout that separates the marker from the bar — not an elevation shadow */
  box-shadow: 0 0 0 2px ${({ theme }) => theme.color.surface.card};
`;

const Rosters = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-2);
  margin-top: var(--space-5);
`;

const RosterHead = styled.p<{ $team: 'red' | 'blue' }>`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  font: ${({ theme }) => theme.type.captionStrong};
  color: ${({ theme, $team }) => theme.color.team[$team]};

  span {
    font: ${({ theme }) => theme.type.caption};
    font-variant-numeric: tabular-nums;
    color: ${({ theme }) => theme.color.text.muted};
  }
`;

const RosterList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  list-style: none;
`;

const RosterRow = styled.li`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 36px;
  padding: 0 var(--space-2);
  background: ${({ theme }) => theme.color.surface.subtle};
  border-radius: ${({ theme }) => theme.radius.control}px;
  color: ${({ theme }) => theme.color.text.secondary};

  ${({ theme }) => theme.media.narrow} {
    gap: 6px;
    padding: 0 6px;
  }

  b {
    margin-left: auto;
    font: ${({ theme }) => theme.type.labelStrong};
    font-variant-numeric: tabular-nums;
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

type Tier = 1 | 2 | 3 | 4 | 5;

// 예시 화면용 값 — 실제 사용자·전적이 아니라 팀 구성 화면의 모양을 보여주는
// 샘플. 카드 설명에 "예시"라고 밝혀둠.
const SAMPLE: { lane: Lane; red: [Tier, number]; blue: [Tier, number] }[] = [
  { lane: 'TOP', red: [1, 1663], blue: [1, 1626] },
  { lane: 'JUG', red: [2, 1589], blue: [2, 1552] },
  { lane: 'MID', red: [2, 1515], blue: [3, 1478] },
  { lane: 'ADC', red: [3, 1441], blue: [3, 1404] },
  { lane: 'SUP', red: [4, 1367], blue: [4, 1330] },
];

function Roster({ team }: { team: 'red' | 'blue' }) {
  const avg = Math.round(SAMPLE.reduce((sum, r) => sum + r[team][1], 0) / SAMPLE.length);
  return (
    <div>
      <RosterHead $team={team}>
        {team === 'red' ? '레드' : '블루'}
        <span>평균 {avg.toLocaleString()}</span>
      </RosterHead>
      <RosterList>
        {SAMPLE.map((r) => (
          <RosterRow key={r.lane}>
            <LaneIcon lane={r.lane} />
            <Badge tier={r[team][0]} />
            <b>{r[team][1].toLocaleString()}</b>
          </RosterRow>
        ))}
      </RosterList>
    </div>
  );
}

function MatchupPreview() {
  return (
    <PreviewCard aria-hidden="true">
      <SectionHeader
        as="h3"
        icon={<Icon name="matches" />}
        title="AI 팀 구성 결과"
        description="예시 화면 · 실제 사용자 데이터가 아니에요"
      />
      <Balance>
        <BalanceMeta>
          <BalanceScore>
            밸런스 <b>98%</b>
          </BalanceScore>
          <BalanceOdds>
            예상 승률 <TeamNum $team="red">51</TeamNum> : <TeamNum $team="blue">49</TeamNum>
          </BalanceOdds>
        </BalanceMeta>
        <BalanceTrack>
          <BalancePart $team="red" $width={51} />
          <BalancePart $team="blue" />
          <BalanceMarker />
        </BalanceTrack>
      </Balance>
      <Rosters>
        <Roster team="red" />
        <Roster team="blue" />
      </Rosters>
    </PreviewCard>
  );
}

export function LoginPage() {
  return (
    <Screen>
      <Layout>
        <Intro>
          {/* OAuth 콘솔에 등록한 이름("DS_LOL")과 철자 및 대소문자가 정확히 일치해야 함 */}
          <Title>
            <Wordmark size={40} />
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
            DS_LOL은 사용자의 로그인 식별, 내전 그룹 프로필 생성 및 그룹 서비스 제공을 위해 최소한의 Google 계정 기본
            정보(이메일, 프로필)만을 수집 및 활용합니다.
          </PrivacyNotice>
        </Intro>

        <MatchupPreview />
      </Layout>
    </Screen>
  );
}
