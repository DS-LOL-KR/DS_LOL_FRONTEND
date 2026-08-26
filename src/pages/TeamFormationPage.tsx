import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled, { type DefaultTheme } from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { Avatar } from '../components/Avatar/Avatar';
import { useGenerateTeams, useMatch, useUpdateTeams } from '../features/matches/hooks';
import type { TeamParticipant } from '../features/matches/types';
import { useGroup } from '../features/groups/hooks';
import { setActiveGroupId } from '../utils/activeGroup';
import { resolveAssetUrl } from '../utils/assetUrl';

type Side = 'A' | 'B';

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
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const TierCell = styled.span`
  width: 90px;
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const MmrCell = styled.span`
  width: 52px;
  text-align: right;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
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

const RationaleRow = styled.div`
  padding: 13px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};

  &:last-child {
    border-bottom: none;
  }
`;

const NoticeLabel = styled.p`
  padding: ${({ theme }) => theme.space.lg}px 0;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  opacity: 0.7;
`;

function teamColor(theme: DefaultTheme, team: Side): string {
  return team === 'A' ? theme.color.team.blue : theme.color.team.red;
}

export function TeamFormationPage() {
  const { id } = useParams();
  const matchId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: match, isLoading: matchLoading, isError: matchError } = useMatch(matchId);
  const { data: group } = useGroup(match?.groupId ?? NaN);
  const generateTeams = useGenerateTeams(matchId);
  const updateTeams = useUpdateTeams(matchId);

  useEffect(() => {
    if (match?.groupId) setActiveGroupId(String(match.groupId));
  }, [match?.groupId]);

  // A freshly created match has no participants yet (POST /groups/:id/matches
  // doesn't take a roster) — generate the first split as soon as the match (and,
  // if we need it, the group) is loaded. MatchCreatePage passes whichever subset
  // of the group was selected via router state; falls back to the full group
  // roster when arriving here directly (e.g. a page refresh loses that state).
  // Already-generated matches (status MATCHED/FINISHED) skip this and just
  // render what's there.
  useEffect(() => {
    if (!match) return;
    if (match.participants && match.participants.length > 0) return;
    const stateUserIds = (location.state as { participantUserIds?: number[] } | null)?.participantUserIds;
    const participantUserIds = stateUserIds ?? group?.members.map((m) => m.userId);
    if (!participantUserIds || participantUserIds.length < 2) return;
    generateTeams.mutate({ participantUserIds });
    // Only re-run when the match/group identity actually changes, not on every
    // mutation-object re-creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.id, group?.id]);

  const handleReshuffle = () => {
    if (participants.length === 0) return;
    generateTeams.mutate({ participantUserIds: participants.map((p) => p.userId) });
  };

  const handleConfirm = () => {
    if (!match?.participants) return;
    updateTeams.mutate(
      {
        assignments: match.participants.map((p) => ({
          userId: p.userId,
          assignedTeam: p.assignedTeam,
          assignedPosition: p.assignedPosition ?? undefined,
        })),
      },
      { onSuccess: () => navigate(`/matches/${id}`) },
    );
  };

  const participants = useMemo(() => match?.participants ?? [], [match]);
  const teamA = useMemo(() => participants.filter((p) => p.assignedTeam === 'TEAM_A'), [participants]);
  const teamB = useMemo(() => participants.filter((p) => p.assignedTeam === 'TEAM_B'), [participants]);
  const analysis = match?.teamAnalysis ?? null;

  const onPreferredLane = participants.filter(
    (p) => p.preferredPosition && p.assignedPosition === p.preferredPosition,
  ).length;

  const renderTeamPlayer = (p: TeamParticipant) => (
    <PlayerRow key={p.userId}>
      <PosCell>{p.assignedPosition ?? '-'}</PosCell>
      <NameCell>
        <Avatar name={p.nickname} imageUrl={resolveAssetUrl(p.profileImageUrl)} size={20} />
        {p.nickname}
      </NameCell>
      <TierCell>{p.tier ?? (p.hasLinkedAccount ? '언랭크' : '미연동')}</TierCell>
      <MmrCell>{p.mmr}</MmrCell>
    </PlayerRow>
  );

  const isGenerating = generateTeams.isPending;
  const notEnoughMembers = group !== undefined && group.members.length < 2;

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내전 팀 구성</Title>
          <SubtitleRow>
            <span>{group?.name ?? '그룹 불러오는 중...'}</span>
            <span>·</span>
            <span>{participants.length}명 참여</span>
          </SubtitleRow>
        </div>
        <HeaderActions>
          <Button
            $variant="ghost"
            $size="sm"
            onClick={handleReshuffle}
            disabled={isGenerating || participants.length === 0}
          >
            다시 추첨
          </Button>
          <Button $size="sm" onClick={handleConfirm} disabled={updateTeams.isPending || participants.length === 0}>
            구성 확정
          </Button>
        </HeaderActions>
      </Header>

      {matchError && <NoticeLabel>내전 정보를 불러올 수 없어요.</NoticeLabel>}
      {notEnoughMembers && (
        <NoticeLabel>그룹원이 2명 이상이어야 팀을 구성할 수 있어요.</NoticeLabel>
      )}
      {!matchError && !notEnoughMembers && (matchLoading || isGenerating) && participants.length === 0 && (
        <NoticeLabel>{isGenerating ? 'AI가 팀을 구성하고 있어요...' : '불러오는 중...'}</NoticeLabel>
      )}

      {analysis && (
        <>
          <Metrics>
            <Metric>
              <MetricLabel>팀 밸런스</MetricLabel>
              <MetricValue>{analysis.balancePercent}<MetricUnit>%</MetricUnit></MetricValue>
            </Metric>
            <Metric>
              <MetricLabel>평균 MMR 차이</MetricLabel>
              <MetricValue>{Math.abs(analysis.teamA.averageMmr - analysis.teamB.averageMmr)}</MetricValue>
            </Metric>
            <Metric>
              <MetricLabel>예상 승률</MetricLabel>
              <MetricValue>
                {Math.round(analysis.teamA.expectedWinRate * 100)} : {Math.round(analysis.teamB.expectedWinRate * 100)}
              </MetricValue>
            </Metric>
            <Metric>
              <MetricLabel>주 라인 배정</MetricLabel>
              <MetricValue>{onPreferredLane} / {participants.length}</MetricValue>
            </Metric>
          </Metrics>

          <BalanceSection>
            <BalanceLabels>
              <BalanceLabel $team="A">팀 A 평균 <strong>{analysis.teamA.averageMmr}</strong></BalanceLabel>
              <BalanceLabel $team="B"><strong>{analysis.teamB.averageMmr}</strong> 팀 B 평균</BalanceLabel>
            </BalanceLabels>
            <Gauge>
              <GaugeSegment $team="A" />
              <GaugeSegment $team="B" />
            </Gauge>
          </BalanceSection>
        </>
      )}

      {participants.length > 0 && (
        <Roster>
          {([['A', teamA, 'left'], ['B', teamB, 'right']] as const).map(([team, roster, side]) => (
            <TeamColumn key={team} $side={side}>
              <TeamColorBar $team={team} />
              <TeamHeader>
                <TeamNameRow>
                  <TeamName>팀 {team}</TeamName>
                  <TeamSideTag $team={team}>{team === 'A' ? '블루' : '레드'}</TeamSideTag>
                </TeamNameRow>
                <TeamMmrSum>MMR 합계 {roster.reduce((sum, p) => sum + p.mmr, 0)}</TeamMmrSum>
              </TeamHeader>
              <RosterHeaderRow>
                <span style={{ width: 44 }}>POS</span>
                <span style={{ flex: 1 }}>소환사</span>
                <span style={{ width: 90 }}>티어</span>
                <span style={{ width: 52, textAlign: 'right' }}>MMR</span>
              </RosterHeaderRow>
              {roster.map(renderTeamPlayer)}
            </TeamColumn>
          ))}
        </Roster>
      )}

      {analysis && analysis.reasoning.length > 0 && (
        <RationaleSection>
          <RationaleHeader>
            <RationaleTitle>구성 근거</RationaleTitle>
          </RationaleHeader>
          {analysis.reasoning.map((line, i) => (
            <RationaleRow key={i}>{line}</RationaleRow>
          ))}
        </RationaleSection>
      )}
    </PageLayout>
  );
}
