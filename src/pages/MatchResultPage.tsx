import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { type DefaultTheme } from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import {
  PageHeader as Header,
  PageTitle as Title,
  PageSubtitle as Subtitle,
  HeaderActions,
} from '../components/layout/PageHeader';
import { Grid, Col, Stack } from '../components/layout/Grid';
import { Card, SectionHeader } from '../components/Card/Card';
import { Delta } from '../components/Kpi/Kpi';
import { Table, type Column } from '../components/Table/Table';
import { Button } from '../components/Button/Button';
import { Icon } from '../components/Icon/Icon';
import { Modal } from '../components/Modal/Modal';
import { Avatar } from '../components/Avatar/Avatar';
import { LaneIcon, LaneLabel } from '../components/LaneIcon/LaneIcon';
import {
  useDuplicateMatchTeams,
  useFinishMatch,
  useMatch,
  useMmrChanges,
  useMyEvaluatedTargetIds,
  useSubmitEvaluation,
} from '../features/matches/hooks';
import type { MmrChange } from '../features/matches/types';
import type { Position } from '../features/tiers/types';
import { useMe } from '../features/auth/hooks';
import { resolveAssetUrl } from '../utils/assetUrl';
import { formatDateTime } from '../utils/formatDateTime';

type RatingOption = '아쉬웠어요' | '무난했어요' | '좋았어요';
const RATING_OPTIONS: RatingOption[] = ['아쉬웠어요', '무난했어요', '좋았어요'];
const RATING_SCORE: Record<RatingOption, 1 | 2 | 3 | 4 | 5> = { 아쉬웠어요: 1, 무난했어요: 3, 좋았어요: 5 };

// TODO: no design frame covers a standalone match-detail page yet (the Figma file
// only has AI 팀 구성 / 사용자 평가) — this view is assembled from the /matches/:id
// and /matches/:id/mmr-changes API shapes until a real design lands. Side
// ('A'/'B') is page-local display shorthand for the real TEAM_A/TEAM_B fields.
type Side = 'A' | 'B';

interface RosterPlayer {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  lane: Position | null;
  mmr: number;
  // 계정 미연동이면 mmr은 서버가 채운 기본값 — 흐리게 표시.
  hasLinkedAccount: boolean;
  mmrDelta: number;
  team: Side;
}

// TEAM_A = 레드, TEAM_B = 블루 — same identity as the 팀 구성 screen, so the
// team you were on reads the same color on both pages.
function teamColor(theme: DefaultTheme, team: Side): string {
  return team === 'A' ? theme.color.team.red : theme.color.team.blue;
}

const TEAM_LABEL: Record<Side, string> = { A: '레드 팀', B: '블루 팀' };

const HeaderActionColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);

  ${({ theme }) => theme.media.mobile} {
    align-items: stretch;
  }
`;

const EmptyText = styled.p`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const InsetEmpty = styled(EmptyText)`
  padding: 0 var(--card-padding) var(--card-padding);
`;

const InlineError = styled.p`
  margin-top: var(--space-2);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.state.danger};
`;

// 레드팀 색 = 패배 색이라 승패는 항상 텍스트 배지로. 승 = win-soft + win, 패 = 무채색.
const ResultBadge = styled.span<{ $win: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 var(--space-2);
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radius.badge}px;
  font: ${({ theme }) => theme.type.badge};
  white-space: nowrap;
  background: ${({ theme, $win }) => ($win ? theme.color.state.successSoft : theme.color.surface.subtle)};
  color: ${({ theme, $win }) => ($win ? theme.color.state.success : theme.color.text.secondary)};
`;

const TeamCard = styled(Card)`
  display: flex;
  flex-direction: column;
`;

const TeamHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
`;

const TeamName = styled.h2<{ $team: Side }>`
  font: ${({ theme }) => theme.type.heading};
  color: ${({ theme, $team }) => teamColor(theme, $team)};
`;

const TeamMeta = styled.p`
  margin-top: 2px;
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

const HeroBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin: var(--space-4) 0 var(--space-5);
`;

const HeroRow = styled.p`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

// Hero Number — 팀 합계 MMR. 페이지당 최대 2개(레드 vs 블루), 팀 색은 여기에만.
const HeroNumber = styled.span<{ $team: Side }>`
  font: ${({ theme }) => theme.type.hero};
  letter-spacing: var(--type-hero-tracking);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: ${({ theme, $team }) => teamColor(theme, $team)};
`;

const HeroUnit = styled.span`
  font: ${({ theme }) => theme.type.labelStrong};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const HeroSub = styled.p`
  font: ${({ theme }) => theme.type.caption};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.muted};
`;

const RosterList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
`;

const PlayerRow = styled.li`
  display: grid;
  grid-template-columns: 16px 24px minmax(0, 1fr) auto 64px;
  align-items: center;
  gap: var(--space-3);
  min-height: 44px;
  padding: 0 var(--space-3);
  background: ${({ theme }) => theme.color.surface.subtle};
  border-radius: ${({ theme }) => theme.radius.control}px;
  color: ${({ theme }) => theme.color.text.secondary};

  ${({ theme }) => theme.media.narrow} {
    grid-template-columns: 16px 24px minmax(0, 1fr) 56px;

    & > [data-optional] {
      display: none;
    }
  }
`;

const PlayerName = styled.span`
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font: ${({ theme }) => theme.type.bodyStrong};
  color: ${({ theme }) => theme.color.text.primary};
`;

const PlayerMmr = styled.span<{ $estimated?: boolean }>`
  font: ${({ theme }) => theme.type.caption};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: ${({ theme, $estimated }) => ($estimated ? theme.color.text.muted : theme.color.text.secondary)};
`;

const DeltaCell = styled.span`
  text-align: right;
  white-space: nowrap;
`;

const Muted = styled.span`
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

const WinnerRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const TeamDot = styled.span<{ $team: Side }>`
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: ${({ theme, $team }) => teamColor(theme, $team)};
`;

const TeamCell = styled.span<{ $team: Side }>`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme, $team }) => teamColor(theme, $team)};
`;

const ModalTitle = styled.h2`
  font: ${({ theme }) => theme.type.heading};
  color: ${({ theme }) => theme.color.text.primary};
`;

const ModalHint = styled.p`
  margin-top: var(--space-1);
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-6);
`;

const EvalPanel = styled.div`
  width: 640px;
  max-width: 100%;
`;

const EvalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
`;

const EvalProgressRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-5);
  padding: var(--space-3) 0;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const EvalProgressCount = styled.span`
  white-space: nowrap;
  font: ${({ theme }) => theme.type.labelStrong};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.primary};
`;

const TeammateRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-4);
  padding: var(--space-3) 0;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};

  &:last-of-type {
    border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
  }
`;

const TeammateInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

const TeammateText = styled.div`
  min-width: 0;
`;

const TeammateNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
`;

const TeammateName = styled.span`
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font: ${({ theme }) => theme.type.bodyStrong};
  color: ${({ theme }) => theme.color.text.primary};
`;

const TeammateSub = styled.span`
  display: block;
  margin-top: 2px;
  white-space: nowrap;
  font: ${({ theme }) => theme.type.caption};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.secondary};
`;

// §3.11 Segmented Control — 선택 = hover 배경 + primary 텍스트(흰 배경 선택 금지).
const Segmented = styled.div`
  display: inline-flex;
  gap: 2px;
  height: var(--control-height);
  padding: 2px;
  background: ${({ theme }) => theme.color.surface.subtle};
  border: 1px solid ${({ theme }) => theme.color.border.base};
  border-radius: ${({ theme }) => theme.radius.control}px;
`;

const SegmentOption = styled.button<{ $selected: boolean }>`
  flex: 1;
  padding: 0 var(--space-3);
  border: 0;
  border-radius: ${({ theme }) => theme.radius.badge}px;
  cursor: pointer;
  white-space: nowrap;
  font: ${({ theme, $selected }) => ($selected ? theme.type.labelStrong : theme.type.label)};
  background: ${({ theme, $selected }) => ($selected ? theme.color.surface.hover : 'transparent')};
  color: ${({ theme, $selected }) => ($selected ? theme.color.text.primary : theme.color.text.secondary)};
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);

  &:hover {
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

const EvalFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-5);
`;

const AnonymousHint = styled.span`
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

const EvalFooterActions = styled.div`
  display: flex;
  gap: var(--space-2);
`;

const EvalEmpty = styled.p`
  padding: var(--space-4) 0;
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

export function MatchResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const matchId = Number(id);
  const { data: match } = useMatch(matchId);
  const { data: mmrChanges } = useMmrChanges(matchId);
  const { data: me } = useMe();
  const finishMatch = useFinishMatch(matchId);
  const duplicateTeams = useDuplicateMatchTeams(matchId, match?.groupId ?? 0);
  const submitEvaluation = useSubmitEvaluation(matchId, match?.groupId ?? 0);
  const { data: evaluatedTargetIds, isLoading: evaluatedIdsLoading } = useMyEvaluatedTargetIds(matchId);

  // GET /matches/:id now embeds real `participants` (nickname/profileImageUrl
  // included) — build the roster from that directly instead of a mocked list.
  const participantById = new Map((match?.participants ?? []).map((p) => [p.userId, p]));
  const players: RosterPlayer[] = (match?.participants ?? []).map((p) => ({
    userId: p.userId,
    nickname: p.nickname,
    profileImageUrl: p.profileImageUrl,
    lane: p.assignedPosition ?? null,
    mmr: p.mmr,
    hasLinkedAccount: p.hasLinkedAccount,
    mmrDelta: p.mmrChange,
    team: p.assignedTeam === 'TEAM_A' ? 'A' : 'B',
  }));
  const winningTeam: Side | null =
    match?.winningTeam === 'TEAM_A' ? 'A' : match?.winningTeam === 'TEAM_B' ? 'B' : null;
  const teamA = players.filter((p) => p.team === 'A');
  const teamB = players.filter((p) => p.team === 'B');
  const changes = mmrChanges ?? [];
  const isParticipant = (match?.participants ?? []).some((p) => p.userId === me?.id);
  const isFinished = match?.status === 'FINISHED';

  const [pendingWinner, setPendingWinner] = useState<'TEAM_A' | 'TEAM_B' | null>(null);
  const handleFinish = () => {
    if (!pendingWinner) return;
    finishMatch.mutate({ winningTeam: pendingWinner }, { onSuccess: () => setPendingWinner(null) });
  };

  const handleDuplicateTeams = () => {
    duplicateTeams.mutate(undefined, { onSuccess: (next) => navigate(`/matches/${next.id}`) });
  };

  const myTeam = match?.participants?.find((p) => p.userId === me?.id)?.assignedTeam;
  const teammates = match?.participants && myTeam
    ? match.participants
        .filter((p) => p.assignedTeam === myTeam && p.userId !== me?.id)
        .map((p) => ({
          id: p.userId,
          name: p.nickname,
          profileImageUrl: p.profileImageUrl,
          lane: p.assignedPosition ?? null,
          subtitle: `MMR 변동 ${p.mmrChange > 0 ? '+' : p.mmrChange < 0 ? '−' : ''}${Math.abs(p.mmrChange)}`,
        }))
    : [];

  // GET /matches/:id/evaluations/me로 "이 매치에서 내가 이미 평가한 팀원"을
  // 서버에서 받아옴. 방금 이 화면에서 제출한 건 justSubmittedIds에 바로 더해서,
  // 서버 재조회(invalidate)를 기다리지 않고도 즉시 반영됨.
  //
  // evaluatedTargetIds를 별도 state로 "시드"해서 옮겨 담는 방식(구 submittedIds)은
  // 쓰지 않음 — 그 방식은 쿼리가 응답을 받은 렌더와 그 값을 state로 옮기는 렌더
  // 사이에 한 틱(tick) 간격이 생겨서, 바로 아래 "평가 모달 자동으로 열기" 판단이
  // 그 간격 동안 "아직 다 평가 안 함"으로 잘못 계산되는 문제가 있었음(2026-09-18
  // 문의로 발견 — 이미 평가를 끝낸 사람도 내전 상세를 다시 열 때마다 모달이 잠깐
  // 잘못 열렸다가, 그 뒤엔 다시 닫는 분기가 없어서 계속 열려있는 것처럼 보였음).
  // evaluatedTargetIds(서버 데이터)를 매 렌더 직접 합쳐서 쓰면 그 틈이 아예 없음.
  const [justSubmittedIds, setJustSubmittedIds] = useState<Set<number>>(new Set());
  const ratedIds = new Set([...(evaluatedTargetIds ?? []), ...justSubmittedIds]);
  const pendingTeammates = teammates.filter((t) => !ratedIds.has(t.id));
  const allTeammatesRated = teammates.length > 0 && pendingTeammates.length === 0;

  // 내전이 끝나면(수동 종료든 자동판정이든) 상세 화면에 들어와 있을 때 바로
  // 평가 모달이 뜨게 함 — "평가하기" 버튼을 따로 눌러야 했던 것 대신. 이 매치의
  // 실제 참가자가 아닌 사람(그룹장이 구경만 하는 경우 등)한테는 안 뜨게 함 —
  // 안 그러면 평가할 팀원이 하나도 없는 채로 "0/0명 완료" 모달만 계속 열림.
  // evaluatedIdsLoading 동안은 판단을 보류함(첫 조회 자체가 아직 안 끝난 상태) —
  // allTeammatesRated는 위에서 evaluatedTargetIds를 직접 합쳐서 계산하므로 이후엔
  // 지연 없이 항상 최신 값임. allTeammatesRated가 true면 명시적으로 닫아서, 이미
  // 평가를 끝낸 사람한테 모달이 열린 채로 남는 일이 없게 함.
  const [evalOpen, setEvalOpen] = useState(false);
  const [ratings, setRatings] = useState<Record<number, RatingOption>>({});
  useEffect(() => {
    if (evaluatedIdsLoading) return;
    setEvalOpen(match?.status === 'FINISHED' && isParticipant && !allTeammatesRated);
  }, [match?.status, isParticipant, allTeammatesRated, evaluatedIdsLoading]);

  const wonForEval = myTeam ? match?.winningTeam === myTeam : null;
  const completedCount = ratedIds.size + Object.keys(ratings).length;

  const handleSelectRating = (teammateId: number, option: RatingOption) => {
    setRatings((prev) => ({ ...prev, [teammateId]: option }));
  };

  const handleSubmitEvaluation = () => {
    const entries = Object.entries(ratings);
    Promise.all(
      entries.map(([targetId, option]) =>
        submitEvaluation.mutateAsync({ targetId: Number(targetId), score: RATING_SCORE[option] }),
      ),
    ).then(() => {
      setJustSubmittedIds((prev) => new Set([...prev, ...entries.map(([targetId]) => Number(targetId))]));
      setRatings({});
      setEvalOpen(false);
    });
  };

  // 팀 합계는 서버 teamAnalysis(현재 배정 기준으로 매번 재계산) 우선, 없으면 로스터 합.
  const teamSummary = (team: Side, roster: RosterPlayer[]) => {
    const analysis = team === 'A' ? match?.teamAnalysis?.teamA : match?.teamAnalysis?.teamB;
    const total = analysis?.totalMmr ?? roster.reduce((s, p) => s + p.mmr, 0);
    const average = analysis?.averageMmr ?? (roster.length ? total / roster.length : 0);
    return { total, average, expectedWinRate: analysis?.expectedWinRate ?? null };
  };

  const statusLabel =
    match?.status === 'FINISHED' ? '결과 확정' : match?.status === 'MATCHED' ? '결과 대기 중' : '팀 구성 전';

  const changeColumns: Column<MmrChange>[] = [
    {
      key: 'player',
      header: '플레이어',
      render: (c) => participantById.get(c.userId)?.nickname ?? `유저 #${c.userId}`,
    },
    {
      key: 'team',
      header: '팀',
      width: 96,
      render: (c) => {
        const side: Side = c.assignedTeam === 'TEAM_A' ? 'A' : 'B';
        return <TeamCell $team={side}>{side === 'A' ? '레드' : '블루'}</TeamCell>;
      },
    },
    {
      key: 'result',
      header: '결과',
      width: 80,
      render: (c) =>
        match?.winningTeam ? (
          <ResultBadge $win={c.assignedTeam === match.winningTeam}>
            {c.assignedTeam === match.winningTeam ? '승' : '패'}
          </ResultBadge>
        ) : (
          <Muted>—</Muted>
        ),
    },
    { key: 'delta', header: 'MMR 변동', width: 112, align: 'right', render: (c) => <Delta value={c.mmrChange} /> },
  ];

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내전 결과</Title>
          <Subtitle>{match ? `${formatDateTime(match.createdAt)} · ${statusLabel}` : '불러오는 중...'}</Subtitle>
        </div>
        <HeaderActionColumn>
          <HeaderActions>
            <Button $variant="ghost" onClick={() => navigate(-1)}>목록으로</Button>
            {match && match.status !== 'WAITING' && (
              <Button onClick={() => navigate(`/matches/${id}/teams`)}>팀 구성 보기</Button>
            )}
            {isFinished && (
              <Button onClick={handleDuplicateTeams} disabled={duplicateTeams.isPending}>
                <Icon name="copy" />이 팀 그대로 다음 판 만들기
              </Button>
            )}
            {isFinished && !allTeammatesRated && isParticipant && (
              <Button $variant="primary" onClick={() => setEvalOpen(true)}>팀원 평가하기</Button>
            )}
          </HeaderActions>
          {duplicateTeams.isError && (
            <InlineError role="alert">{duplicateTeams.error.message || '다음 판 생성에 실패했어요'}</InlineError>
          )}
        </HeaderActionColumn>
      </Header>

      <Stack $gap="card">
        {players.length === 0 ? (
          <Card>
            <SectionHeader icon={<Icon name="matches" />} title="팀 배정" />
            <EmptyText>아직 팀 배정 정보가 없어요</EmptyText>
          </Card>
        ) : (
          <Grid>
            {([['A', teamA] as const, ['B', teamB] as const]).map(([team, roster]) => {
              const summary = teamSummary(team, roster);
              return (
                <Col key={team} $span={6}>
                  <TeamCard>
                    <TeamHead>
                      <div>
                        <TeamName $team={team}>{TEAM_LABEL[team]}</TeamName>
                        <TeamMeta>팀 {team} · {roster.length}명</TeamMeta>
                      </div>
                      {winningTeam && (
                        <ResultBadge $win={team === winningTeam}>{team === winningTeam ? '승리' : '패배'}</ResultBadge>
                      )}
                    </TeamHead>
                    <HeroBlock>
                      <HeroRow>
                        <HeroNumber $team={team}>{summary.total.toLocaleString()}</HeroNumber>
                        <HeroUnit>합계 MMR</HeroUnit>
                      </HeroRow>
                      <HeroSub>
                        평균 {Math.round(summary.average).toLocaleString()}
                        {summary.expectedWinRate !== null &&
                          ` · 예상 승률 ${Math.round(summary.expectedWinRate * 100)}%`}
                      </HeroSub>
                    </HeroBlock>
                    <RosterList>
                      {roster.map((p) => (
                        <PlayerRow key={p.userId}>
                          {p.lane ? <LaneIcon lane={p.lane} /> : <Muted aria-label="라인 미정">—</Muted>}
                          <Avatar name={p.nickname} imageUrl={resolveAssetUrl(p.profileImageUrl)} size={24} />
                          <PlayerName>{p.nickname}</PlayerName>
                          <PlayerMmr
                            data-optional
                            $estimated={!p.hasLinkedAccount}
                            title={p.hasLinkedAccount ? undefined : '계정 미연동 — 기본 MMR로 계산했어요'}
                          >
                            {p.mmr.toLocaleString()}
                            {!p.hasLinkedAccount && ' · 기본값'}
                          </PlayerMmr>
                          {/* 결과 확정 전엔 mmrChange가 아직 0이라 초록 "0"이 "변동 없음"처럼 읽혔음. */}
                          <DeltaCell>
                            {isFinished ? <Delta value={p.mmrDelta} /> : <Muted>—</Muted>}
                          </DeltaCell>
                        </PlayerRow>
                      ))}
                    </RosterList>
                  </TeamCard>
                </Col>
              );
            })}
          </Grid>
        )}

        {match?.status === 'MATCHED' && (
          <Card>
            <SectionHeader
              icon={<Icon name="trophy" />}
              title="어느 팀이 이겼나요?"
              description="참가자들의 라이엇 전적이 동기화되면 자동으로 반영돼요. 급하면 직접 골라도 돼요."
            />
            <WinnerRow>
              <Button onClick={() => setPendingWinner('TEAM_A')} disabled={finishMatch.isPending}>
                <TeamDot $team="A" aria-hidden="true" />
                레드 팀 승리
              </Button>
              <Button onClick={() => setPendingWinner('TEAM_B')} disabled={finishMatch.isPending}>
                <TeamDot $team="B" aria-hidden="true" />
                블루 팀 승리
              </Button>
            </WinnerRow>
            {finishMatch.isError && (
              <InlineError role="alert">{finishMatch.error.message || '승리팀 확정에 실패했어요'}</InlineError>
            )}
          </Card>
        )}

        {isFinished && (
          <Card flush>
            <SectionHeader
              inset
              icon={<Icon name="swap" />}
              title="MMR 변동 내역"
              description="확정된 결과로 참가자 전원에게 반영된 변동"
            />
            {changes.length === 0 ? (
              <InsetEmpty>아직 집계된 변동 내역이 없어요</InsetEmpty>
            ) : (
              <Table
                columns={changeColumns}
                data={changes}
                minWidth={420}
                rowKey={(c) => c.userId}
                rowTeam={(c) => (c.assignedTeam === 'TEAM_A' ? 'red' : 'blue')}
              />
            )}
          </Card>
        )}
      </Stack>

      <Modal open={pendingWinner !== null} onClose={() => setPendingWinner(null)}>
        <ModalTitle>{pendingWinner === 'TEAM_A' ? '레드 팀(팀 A)' : '블루 팀(팀 B)'} 승리로 확정할까요?</ModalTitle>
        <ModalHint>확정하면 참가자 전원의 MMR에 즉시 반영되며 되돌릴 수 없어요.</ModalHint>
        {finishMatch.isError && (
          <InlineError role="alert">{finishMatch.error.message || '승리팀 확정에 실패했어요'}</InlineError>
        )}
        <ModalActions>
          <Button $variant="ghost" onClick={() => setPendingWinner(null)}>취소</Button>
          <Button $variant="primary" onClick={handleFinish} disabled={finishMatch.isPending}>확정</Button>
        </ModalActions>
      </Modal>

      <Modal open={evalOpen} onClose={() => setEvalOpen(false)}>
        <EvalPanel>
          <EvalHeader>
            <ModalTitle>팀원 평가</ModalTitle>
            {wonForEval !== null && <ResultBadge $win={wonForEval}>{wonForEval ? '승리' : '패배'}</ResultBadge>}
          </EvalHeader>
          <ModalHint>평가는 다음 내전의 팀 밸런스와 그룹 티어에 반영돼요</ModalHint>
          <EvalProgressRow>
            <span>팀원 평가</span>
            <EvalProgressCount>{completedCount} / {teammates.length}명 완료</EvalProgressCount>
          </EvalProgressRow>

          {pendingTeammates.length === 0 && <EvalEmpty>평가할 팀원이 없어요</EvalEmpty>}
          {pendingTeammates.map((mate) => (
            <TeammateRow key={mate.id}>
              <TeammateInfo>
                <Avatar name={mate.name} imageUrl={resolveAssetUrl(mate.profileImageUrl)} size={32} />
                <TeammateText>
                  <TeammateNameRow>
                    <TeammateName>{mate.name}</TeammateName>
                    {mate.lane ? <LaneLabel lane={mate.lane} /> : <Muted>—</Muted>}
                  </TeammateNameRow>
                  <TeammateSub>{mate.subtitle}</TeammateSub>
                </TeammateText>
              </TeammateInfo>
              <Segmented role="group" aria-label={`${mate.name} 평가`}>
                {RATING_OPTIONS.map((option) => (
                  <SegmentOption
                    key={option}
                    type="button"
                    $selected={ratings[mate.id] === option}
                    aria-pressed={ratings[mate.id] === option}
                    onClick={() => handleSelectRating(mate.id, option)}
                  >
                    {option}
                  </SegmentOption>
                ))}
              </Segmented>
            </TeammateRow>
          ))}

          <EvalFooter>
            <AnonymousHint>평가는 익명으로 반영돼요</AnonymousHint>
            <EvalFooterActions>
              <Button $variant="ghost" onClick={() => setEvalOpen(false)}>나중에</Button>
              <Button
                $variant="primary"
                onClick={handleSubmitEvaluation}
                disabled={submitEvaluation.isPending || completedCount === 0}
              >
                평가 제출
              </Button>
            </EvalFooterActions>
          </EvalFooter>
        </EvalPanel>
      </Modal>
    </PageLayout>
  );
}
