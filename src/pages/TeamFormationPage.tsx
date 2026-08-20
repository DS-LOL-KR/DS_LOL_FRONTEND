import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { type DefaultTheme } from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';

type Lane = 'TOP' | 'JGL' | 'MID' | 'BOT' | 'SUP';
type Team = 'A' | 'B';

interface Player {
  id: string;
  lane: Lane;
  name: string;
  tier: 1 | 2 | 3 | 4 | 5;
  mmr: number;
  recentDelta: number;
  team: Team;
}

interface Rationale {
  label: string;
  detail: string;
  value: string;
}

// TODO: no team-formation endpoint yet — swap this mock for a real query/mutation
// once the 기능명세서 "AI 팀 구성" API (/matches/:id/teams) lands.
const INITIAL_PLAYERS: Player[] = [
  { id: '1', lane: 'TOP', name: '재훈', tier: 3, mmr: 1780, recentDelta: 12, team: 'A' },
  { id: '2', lane: 'JGL', name: '민석', tier: 2, mmr: 1865, recentDelta: 8, team: 'A' },
  { id: '3', lane: 'MID', name: '성현', tier: 1, mmr: 1990, recentDelta: 14, team: 'A' },
  { id: '4', lane: 'BOT', name: '지우', tier: 2, mmr: 1902, recentDelta: -3, team: 'A' },
  { id: '5', lane: 'SUP', name: '태윤', tier: 3, mmr: 1673, recentDelta: 6, team: 'A' },
  { id: '6', lane: 'TOP', name: '현우', tier: 2, mmr: 1858, recentDelta: 4, team: 'B' },
  { id: '7', lane: 'JGL', name: '도현', tier: 3, mmr: 1702, recentDelta: -7, team: 'B' },
  { id: '8', lane: 'MID', name: '준서', tier: 1, mmr: 2015, recentDelta: 11, team: 'B' },
  { id: '9', lane: 'BOT', name: '하늘', tier: 2, mmr: 1889, recentDelta: 9, team: 'B' },
  { id: '10', lane: 'SUP', name: '서진', tier: 4, mmr: 1616, recentDelta: -2, team: 'B' },
];

const RATIONALE: Rationale[] = [
  { label: '라인 배정', detail: '10명 전원 주 포지션 배정. 서브 포지션으로 밀린 인원 없음', value: '10 / 10' },
  { label: 'MMR 편차', detail: '팀 평균 차이 6점. 최근 10경기 중 최소', value: '6' },
  { label: '최근 폼', detail: '연승 중인 성현·준서를 반대 팀으로 분리', value: '2명' },
  { label: '티어 분포', detail: '양 팀 모두 1티어 1명 / 2티어 2명 / 3티어 이하 2명', value: '균등' },
];

const Header = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.space.lg}px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const Title = styled.p`
  font: ${({ theme }) => theme.font.title26};
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.color.text.primary};
`;

const SubtitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.xs}px;
`;

const Metrics = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.space.md}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const Metric = styled.div`
  flex: 1;
  padding-left: 28px;
  border-left: 1px solid ${({ theme }) => theme.color.border.base};

  &:first-child {
    padding-left: 0;
    border-left: none;
  }
`;

const MetricLabel = styled.p`
  font: ${({ theme }) => theme.font.label12m};
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const MetricValue = styled.p`
  margin-top: 5px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.6px;
  color: ${({ theme }) => theme.color.text.primary};
`;

const MetricUnit = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const BalanceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: ${({ theme }) => theme.space.md}px 0 22px;
`;

const BalanceLabels = styled.div`
  display: flex;
  justify-content: space-between;
`;

const BalanceLabel = styled.div<{ $team: Team }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font: ${({ theme }) => theme.font.label12m};
  color: ${({ theme }) => theme.color.text.secondary};

  strong {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    color: ${({ theme, $team }) => ($team === 'A' ? theme.color.team.blue : theme.color.team.red)};
  }
`;

const Gauge = styled.div`
  display: flex;
  gap: 2px;
  width: 100%;
`;

const GaugeSegment = styled.div<{ $team: Team }>`
  flex: 1;
  height: 6px;
  border-radius: 1px;
  background: ${({ theme, $team }) => teamColor(theme, $team)};
`;

const Roster = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
`;

const TeamColumn = styled.div<{ $side: 'left' | 'right' }>`
  flex: 1;
  min-width: 0;
  padding-left: ${({ $side }) => ($side === 'right' ? '40px' : '0')};
`;

const TeamColorBar = styled.div<{ $team: Team }>`
  height: 2px;
  width: 100%;
  background: ${({ theme, $team }) => teamColor(theme, $team)};
`;

const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
`;

const TeamNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TeamName = styled.span`
  font: ${({ theme }) => theme.font.sub17};
  color: ${({ theme }) => theme.color.text.primary};
`;

const TeamSideTag = styled.span<{ $team: Team }>`
  font: ${({ theme }) => theme.font.label12m};
  letter-spacing: 0.6px;
  color: ${({ theme, $team }) => teamColor(theme, $team)};
`;

const TeamMmrSum = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const RosterHeaderRow = styled.div`
  display: flex;
  gap: 12px;
  padding-bottom: 8px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const PlayerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};

  &:last-child {
    border-bottom: none;
  }
`;

const PosCell = styled.span`
  width: 44px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const NameCell = styled.span`
  flex: 1;
  min-width: 0;
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const TierCell = styled.div<{ $tier: 1 | 2 | 3 | 4 | 5 }>`
  width: 54px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme, $tier }) => theme.color.tier[$tier]};
  font: ${({ theme }) => theme.font.label12};

  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: ${({ theme, $tier }) => theme.color.tier[$tier]};
  }
`;

const MmrCell = styled.span`
  width: 52px;
  text-align: right;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`;

const RecentCell = styled.span<{ $positive: boolean }>`
  width: 44px;
  text-align: right;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: ${({ theme, $positive }) => ($positive ? theme.color.text.secondary : theme.color.text.secondary)};
  opacity: ${({ $positive }) => ($positive ? 1 : 0.8)};
`;

const RationaleSection = styled.div`
  width: 100%;
  padding-top: 34px;
`;

const RationaleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
`;

const RationaleTitle = styled.p`
  font: ${({ theme }) => theme.font.sub15};
  color: ${({ theme }) => theme.color.text.primary};
`;

const RationaleHint = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const RationaleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 13px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
  font-size: 13px;

  &:last-child {
    border-bottom: none;
  }
`;

const RationaleLabel = styled.span`
  width: 110px;
  flex-shrink: 0;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text.primary};
`;

const RationaleDetail = styled.span`
  flex: 1;
  min-width: 0;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const RationaleValue = styled.span`
  width: 70px;
  flex-shrink: 0;
  text-align: right;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`;

function teamColor(theme: DefaultTheme, team: Team): string {
  return team === 'A' ? theme.color.team.blue : theme.color.team.red;
}

function shuffleTeams(players: Player[]): Player[] {
  const ids = players.map((p) => p.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const half = Math.ceil(ids.length / 2);
  const teamAIds = new Set(ids.slice(0, half));
  return players.map((p) => ({ ...p, team: teamAIds.has(p.id) ? 'A' : 'B' }));
}

export function TeamFormationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState(INITIAL_PLAYERS);

  const teamA = useMemo(() => players.filter((p) => p.team === 'A'), [players]);
  const teamB = useMemo(() => players.filter((p) => p.team === 'B'), [players]);
  const sumA = teamA.reduce((s, p) => s + p.mmr, 0);
  const sumB = teamB.reduce((s, p) => s + p.mmr, 0);
  const avgA = Math.round(sumA / (teamA.length || 1));
  const avgB = Math.round(sumB / (teamB.length || 1));

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>새벽 내전방</Title>
          <SubtitleRow>
            <span>5v5</span>
            <span>·</span>
            <span>리그 오브 레전드</span>
            <span>·</span>
            <span>08.08 02:40</span>
          </SubtitleRow>
        </div>
        <HeaderActions>
          <Button $variant="ghost" $size="sm" onClick={() => setPlayers(shuffleTeams)}>
            다시 추첨
          </Button>
          {/* TODO: manual drag-to-reassign UI once designed. */}
          <Button $variant="ghost" $size="sm">수동 조정</Button>
          <Button onClick={() => navigate(`/scrims/${id}`)}>구성 확정</Button>
        </HeaderActions>
      </Header>

      <Metrics>
        <Metric>
          <MetricLabel>팀 밸런스</MetricLabel>
          <MetricValue>98<MetricUnit>%</MetricUnit></MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>평균 MMR 차이</MetricLabel>
          <MetricValue>{Math.abs(avgA - avgB)}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>예상 승률</MetricLabel>
          <MetricValue>51 : 49</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>라인 충족</MetricLabel>
          <MetricValue>10 / 10</MetricValue>
        </Metric>
      </Metrics>

      <BalanceSection>
        <BalanceLabels>
          <BalanceLabel $team="A">팀 A 평균 <strong>{avgA}</strong></BalanceLabel>
          <BalanceLabel $team="B"><strong>{avgB}</strong> 팀 B 평균</BalanceLabel>
        </BalanceLabels>
        <Gauge>
          <GaugeSegment $team="A" />
          <GaugeSegment $team="B" />
        </Gauge>
      </BalanceSection>

      <Roster>
        {([['A', teamA, 'left'], ['B', teamB, 'right']] as const).map(([team, roster, side]) => (
          <TeamColumn key={team} $side={side}>
            <TeamColorBar $team={team} />
            <TeamHeader>
              <TeamNameRow>
                <TeamName>팀 {team}</TeamName>
                <TeamSideTag $team={team}>{team === 'A' ? '블루' : '레드'}</TeamSideTag>
              </TeamNameRow>
              <TeamMmrSum>MMR 합계 {team === 'A' ? sumA : sumB}</TeamMmrSum>
            </TeamHeader>
            <RosterHeaderRow>
              <span style={{ width: 44 }}>POS</span>
              <span style={{ flex: 1 }}>소환사</span>
              <span style={{ width: 54 }}>티어</span>
              <span style={{ width: 52, textAlign: 'right' }}>MMR</span>
              <span style={{ width: 44, textAlign: 'right' }}>최근</span>
            </RosterHeaderRow>
            {roster.map((p) => (
              <PlayerRow key={p.id}>
                <PosCell>{p.lane}</PosCell>
                <NameCell>{p.name}</NameCell>
                <TierCell $tier={p.tier}>{p.tier}티어</TierCell>
                <MmrCell>{p.mmr}</MmrCell>
                <RecentCell $positive={p.recentDelta >= 0}>
                  {p.recentDelta > 0 ? `+${p.recentDelta}` : p.recentDelta}
                </RecentCell>
              </PlayerRow>
            ))}
          </TeamColumn>
        ))}
      </Roster>

      <RationaleSection>
        <RationaleHeader>
          <RationaleTitle>구성 근거</RationaleTitle>
          <RationaleHint>자동 배정 · 0.4초</RationaleHint>
        </RationaleHeader>
        {RATIONALE.map((r) => (
          <RationaleRow key={r.label}>
            <RationaleLabel>{r.label}</RationaleLabel>
            <RationaleDetail>{r.detail}</RationaleDetail>
            <RationaleValue>{r.value}</RationaleValue>
          </RationaleRow>
        ))}
      </RationaleSection>
    </PageLayout>
  );
}
