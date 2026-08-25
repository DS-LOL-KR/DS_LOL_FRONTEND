import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled, { type DefaultTheme } from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { useGenerateTeams, useMatch, useUpdateTeams } from '../features/matches/hooks';
import type { TeamParticipant } from '../features/matches/types';
import type { Position } from '../features/tiers/types';
import { setActiveGroupId } from '../utils/activeGroup';

// `custom_match_participants` (see ERD) only carries userId/assignedTeam/assignedPosition —
// nickname/tier/mmr/balance-score/rationale aren't backend fields, they're computed
// display-only values the AI-formation response is expected to add later. These
// local types (and the mocks below) stay until /matches/:id/teams/generate documents
// that richer shape.
type Side = 'A' | 'B';

interface TeamPlayer {
  userId: number;
  lane: Position;
  nickname: string;
  tier: 1 | 2 | 3 | 4 | 5;
  mmr: number;
  recentMmrDelta: number;
  team: Side;
}

interface RationaleItem {
  label: string;
  detail: string;
  value: string;
}

// TODO: no design frame covers the balance %/win-rate math precisely — these stay
// as placeholders until /matches/:id/teams/generate documents its response shape.
const MOCK_BALANCE_SCORE = 98;
const MOCK_EXPECTED_WIN_RATE = { teamA: 51, teamB: 49 };

// TODO: no backend yet — shown when POST /matches/:id/teams/generate is unavailable.
const MOCK_PLAYERS: TeamPlayer[] = [
  { userId: 1, lane: 'TOP', nickname: '재훈', tier: 3, mmr: 1780, recentMmrDelta: 12, team: 'A' },
  { userId: 2, lane: 'JUG', nickname: '민석', tier: 2, mmr: 1865, recentMmrDelta: 8, team: 'A' },
  { userId: 3, lane: 'MID', nickname: '성현', tier: 1, mmr: 1990, recentMmrDelta: 14, team: 'A' },
  { userId: 4, lane: 'ADC', nickname: '지우', tier: 2, mmr: 1902, recentMmrDelta: -3, team: 'A' },
  { userId: 5, lane: 'SUP', nickname: '태윤', tier: 3, mmr: 1673, recentMmrDelta: 6, team: 'A' },
  { userId: 6, lane: 'TOP', nickname: '현우', tier: 2, mmr: 1858, recentMmrDelta: 4, team: 'B' },
  { userId: 7, lane: 'JUG', nickname: '도현', tier: 3, mmr: 1702, recentMmrDelta: -7, team: 'B' },
  { userId: 8, lane: 'MID', nickname: '준서', tier: 1, mmr: 2015, recentMmrDelta: 11, team: 'B' },
  { userId: 9, lane: 'ADC', nickname: '하늘', tier: 2, mmr: 1889, recentMmrDelta: 9, team: 'B' },
  { userId: 10, lane: 'SUP', nickname: '서진', tier: 4, mmr: 1616, recentMmrDelta: -2, team: 'B' },
];

const MOCK_RATIONALE: RationaleItem[] = [
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
  font-size: 29px;
  font-weight: 600;
  letter-spacing: -0.6px;
  color: ${({ theme }) => theme.color.text.primary};
`;

const MetricUnit = styled.span`
  font-size: 16px;
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

const BalanceLabel = styled.div<{ $team: Side }>`
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

const GaugeSegment = styled.div<{ $team: Side }>`
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

const TeamColorBar = styled.div<{ $team: Side }>`
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

const TeamSideTag = styled.span<{ $team: Side }>`
  font: ${({ theme }) => theme.font.label12m};
  letter-spacing: 0.6px;
  color: ${({ theme, $team }) => teamColor(theme, $team)};
`;

const TeamMmrSum = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const RosterHeaderRow = styled.div`
  display: flex;
  gap: 12px;
  padding-bottom: 8px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
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
  font-size: 13px;
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
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`;

const RecentCell = styled.span<{ $positive: boolean }>`
  width: 44px;
  text-align: right;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
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
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const RationaleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 13px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
  font-size: 15px;

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

function teamColor(theme: DefaultTheme, team: Side): string {
  return team === 'A' ? theme.color.team.blue : theme.color.team.red;
}

function shuffleTeams(players: TeamPlayer[]): TeamPlayer[] {
  const ids = players.map((p) => p.userId);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const half = Math.ceil(ids.length / 2);
  const teamAIds = new Set(ids.slice(0, half));
  return players.map((p) => ({ ...p, team: teamAIds.has(p.userId) ? 'A' : 'B' }));
}

export function TeamFormationPage() {
  const { id } = useParams();
  const matchId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: match } = useMatch(matchId);
  const generateTeams = useGenerateTeams(matchId);
  const updateTeams = useUpdateTeams(matchId);

  const [players, setPlayers] = useState<TeamPlayer[]>(MOCK_PLAYERS);
  // Balance %/win-rate/rationale aren't backend fields (see comment above) — they
  // stay fixed placeholders since there's no real source to refresh them from.
  const balanceScore = MOCK_BALANCE_SCORE;
  const expectedWinRate = MOCK_EXPECTED_WIN_RATE;
  const rationale = MOCK_RATIONALE;

  // Merge assignedTeam/assignedPosition from a real teams/generate or teams
  // response onto the roster, keeping whatever nickname/tier/mmr we already have.
  const applyAssignments = (participants: TeamParticipant[]) => {
    setPlayers((prev) =>
      prev.map((p) => {
        const assignment = participants.find((a) => a.userId === p.userId);
        if (!assignment) return p;
        return {
          ...p,
          team: assignment.assignedTeam === 'TEAM_A' ? 'A' : 'B',
          lane: assignment.assignedPosition ?? p.lane,
        };
      }),
    );
  };

  useEffect(() => {
    if (match?.groupId) setActiveGroupId(String(match.groupId));
  }, [match?.groupId]);

  useEffect(() => {
    if (!match) return;
    // GET /matches/:id now embeds `participants` directly — if teams were already
    // generated (status MATCHED/FINISHED), use that instead of re-rolling on every
    // visit. Only call teams/generate for a fresh WAITING match with no assignments.
    if (match.participants && match.participants.length > 0) {
      applyAssignments(match.participants);
      return;
    }
    const participantUserIds =
      (location.state as { participantUserIds?: number[] } | null)?.participantUserIds ??
      players.map((p) => p.userId);
    generateTeams.mutate(
      { participantUserIds },
      { onSuccess: (result) => applyAssignments(result.participants), onError: () => setPlayers(shuffleTeams) },
    );
    // Only react to the match query settling — generateTeams/setState identity
    // changes every render and would otherwise retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match]);

  const handleReshuffle = () => {
    generateTeams.mutate(
      { participantUserIds: players.map((p) => p.userId) },
      { onSuccess: (result) => applyAssignments(result.participants), onError: () => setPlayers(shuffleTeams) },
    );
  };

  const handleConfirm = () => {
    updateTeams.mutate(
      {
        assignments: players.map((p) => ({
          userId: p.userId,
          assignedTeam: p.team === 'A' ? 'TEAM_A' : 'TEAM_B',
          assignedPosition: p.lane,
        })),
      },
      { onSettled: () => navigate(`/matches/${id}`) },
    );
  };

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
          <Button $variant="ghost" $size="sm" onClick={handleReshuffle} disabled={generateTeams.isPending}>
            다시 추첨
          </Button>
          {/* TODO: manual drag-to-reassign UI once designed. */}
          <Button $variant="ghost" $size="sm">수동 조정</Button>
          <Button onClick={handleConfirm} disabled={updateTeams.isPending}>구성 확정</Button>
        </HeaderActions>
      </Header>

      <Metrics>
        <Metric>
          <MetricLabel>팀 밸런스</MetricLabel>
          <MetricValue>{balanceScore}<MetricUnit>%</MetricUnit></MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>평균 MMR 차이</MetricLabel>
          <MetricValue>{Math.abs(avgA - avgB)}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>예상 승률</MetricLabel>
          <MetricValue>{expectedWinRate.teamA} : {expectedWinRate.teamB}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>라인 충족</MetricLabel>
          <MetricValue>{players.length} / {players.length}</MetricValue>
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
              <PlayerRow key={p.userId}>
                <PosCell>{p.lane}</PosCell>
                <NameCell>{p.nickname}</NameCell>
                <TierCell $tier={p.tier}>{p.tier}티어</TierCell>
                <MmrCell>{p.mmr}</MmrCell>
                <RecentCell $positive={p.recentMmrDelta >= 0}>
                  {p.recentMmrDelta > 0 ? `+${p.recentMmrDelta}` : p.recentMmrDelta}
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
        {rationale.map((r) => (
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
