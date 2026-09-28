import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled, { type DefaultTheme } from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader as Header, PageTitle as Title, PageSubtitle as Subtitle, HeaderActions } from '../components/layout/PageHeader';
import { Grid, Col } from '../components/layout/Grid';
import { Button } from '../components/Button/Button';
import { Card, SectionHeader } from '../components/Card/Card';
import { Avatar } from '../components/Avatar/Avatar';
import { Icon } from '../components/Icon/Icon';
import { LaneLabel } from '../components/LaneIcon/LaneIcon';
import { useGenerateTeams, useMatch, useUpdateTeams } from '../features/matches/hooks';
import type { TeamParticipant } from '../features/matches/types';
import { useGroup } from '../features/groups/hooks';
import { setActiveGroupId } from '../utils/activeGroup';
import { resolveAssetUrl } from '../utils/assetUrl';

type Side = 'A' | 'B';

// --- Team Balance Bar (docs/design-system.md §3.5) ------------------------
// Red segment width = red expected win rate; the white marker is fixed at 50%
// so the distance of the split from it reads as imbalance.
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
  gap: var(--space-1) var(--space-4);
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

const WinRateLabel = styled.span`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};

  b {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
`;

const TeamText = styled.b<{ $team: Side }>`
  color: ${({ theme, $team }) => teamColor(theme, $team)};
`;

const BalanceTrack = styled.div`
  position: relative;
  display: flex;
  gap: 2px;
  height: 6px;
`;

// 블루 → 레드 순서(블루가 왼쪽) — 막대 왼쪽 구간 폭 = 블루 예상 승률.
const BalanceBlue = styled.span<{ $pct: number }>`
  width: calc(${({ $pct }) => $pct}% - 1px);
  background: ${({ theme }) => theme.color.team.blue};
  border-radius: var(--radius-full);
  transition: width 0.3s var(--ease-out);
`;

const BalanceRed = styled.span`
  flex: 1;
  background: ${({ theme }) => theme.color.team.red};
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

const StatGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-5);

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-3);
  background: ${({ theme }) => theme.color.surface.subtle};
  border-radius: ${({ theme }) => theme.radius.control}px;
  min-width: 0;
`;

const StatLabel = styled.dt`
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const StatValue = styled.dd<{ $team?: Side }>`
  font: ${({ theme }) => theme.type.bodyStrong};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: ${({ theme, $team }) => ($team ? teamColor(theme, $team) : theme.color.text.primary)};

  small {
    font: ${({ theme }) => theme.type.caption};
    color: ${({ theme }) => theme.color.text.secondary};
  }
`;

// --- Team cards -----------------------------------------------------------

const TeamHead = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-5);
`;

const TeamTag = styled.span<{ $team: Side }>`
  font: ${({ theme }) => theme.type.labelStrong};
  color: ${({ theme, $team }) => teamColor(theme, $team)};
`;

const HeroNumber = styled.p<{ $team: Side }>`
  font: ${({ theme }) => theme.type.hero};
  letter-spacing: var(--type-hero-tracking);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: ${({ theme, $team }) => teamColor(theme, $team)};
`;

const TeamCaption = styled.p`
  font: ${({ theme }) => theme.type.caption};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.muted};
`;

const RosterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

// Lane: icon-only while the two rosters sit side by side (and on ≤480px);
// the full "TOP" label only once the cards stack on a phone — with both,
// nicknames broke letter-by-letter (docs/design-system.md §3.8).
const LaneFull = styled.span`
  display: none;

  ${({ theme }) => theme.media.mobile} {
    display: inline-flex;
    width: 44px;
  }

  ${({ theme }) => theme.media.narrow} {
    display: none;
  }
`;

const LaneCompact = styled.span`
  display: inline-flex;

  ${({ theme }) => theme.media.mobile} {
    display: none;
  }

  ${({ theme }) => theme.media.narrow} {
    display: inline-flex;
  }
`;

// Riot tier is secondary to MMR here; it gives way whenever the row is tight
// (side-by-side on mid widths, and phones) so nicknames keep room.
const TierCell = styled.span`
  width: 104px;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};

  ${({ theme }) => theme.media.wide} {
    display: none;
  }

  ${({ theme }) => theme.media.mobile} {
    display: block;
  }

  ${({ theme }) => theme.media.narrow} {
    display: none;
  }
`;

const PlayerRow = styled.div<{ $team: Side }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 48px;
  padding: var(--space-2) var(--space-3) var(--space-2) calc(var(--space-3) + 3px);
  background: ${({ theme }) => theme.color.surface.subtle};
  border-radius: ${({ theme }) => theme.radius.control}px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    bottom: 20%;
    width: 3px;
    border-radius: 0 2px 2px 0;
    background: ${({ theme, $team }) => teamColor(theme, $team)};
  }
`;

const NameCell = styled.span`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
  font: ${({ theme }) => theme.type.bodyStrong};
  color: ${({ theme }) => theme.color.text.primary};

  span {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;

// 계정 미연동 인원은 서버가 기본 MMR로 채워서 보내요 — 합계에는 들어가니 숫자는
// 남기되, 실제 실력 값처럼 읽히지 않게 흐리게 표시.
const MmrCell = styled.span<{ $estimated?: boolean }>`
  width: 52px;
  flex-shrink: 0;
  text-align: right;
  font: ${({ theme, $estimated }) => ($estimated ? theme.type.body : theme.type.bodyStrong)};
  font-variant-numeric: tabular-nums;
  color: ${({ theme, $estimated }) => ($estimated ? theme.color.text.muted : theme.color.text.primary)};
`;

const MoveButton = styled(Button)`
  width: var(--control-height-sm);
  padding: 0;
`;

// --- Misc -----------------------------------------------------------------

const ReasonList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  list-style: none;
`;

const ReasonRow = styled.li`
  padding: var(--space-3);
  background: ${({ theme }) => theme.color.surface.subtle};
  border-radius: ${({ theme }) => theme.radius.control}px;
  font: ${({ theme }) => theme.type.body};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Notice = styled.p`
  font: ${({ theme }) => theme.type.body};
  color: ${({ theme }) => theme.color.text.secondary};
`;

// TEAM_A = 레드, TEAM_B = 블루 (2026-09-12부터 — 그 전엔 반대였음)
function teamColor(theme: DefaultTheme, team: Side): string {
  return team === 'A' ? theme.color.team.red : theme.color.team.blue;
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
  // 팀 구성은 참가자 티어 갱신 때문에 3~5초 걸릴 수 있어요 — 그 사이 이 effect가
  // 다시 돌면(개발 모드 StrictMode의 이중 실행, match 캐시 갱신 등) 같은 내전에
  // 생성 요청이 두 번 나가요. 내전마다 자동 생성은 한 번만.
  const autoGeneratedFor = useRef<number | null>(null);
  useEffect(() => {
    if (!match) return;
    if (match.participants && match.participants.length > 0) return;
    if (autoGeneratedFor.current === match.id) return;
    const stateUserIds = (location.state as { participantUserIds?: number[] } | null)?.participantUserIds;
    const participantUserIds = stateUserIds ?? group?.members.map((m) => m.userId);
    if (!participantUserIds || participantUserIds.length < 2) return;
    autoGeneratedFor.current = match.id;
    generateTeams.mutate({ participantUserIds });
    // Only re-run when the match/group identity actually changes, not on every
    // mutation-object re-creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.id, group?.id]);

  const handleReshuffle = () => {
    if (participants.length === 0 || generateTeams.isPending) return;
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

  // "커스텀" 모드에 실제 기능이 없다는 문의로 추가(2026-09-13) — AI 배정 결과를
  // 그대로 쓰는 대신 직접 팀을 옮길 수 있게 함. PATCH /matches/:id/teams가 원래
  // 부분 배정 변경(바뀐 사람만)을 받고, teamAnalysis도 매번 현재 배정 기준으로
  // 새로 계산되게 설계돼 있어서, 이 참가자 하나만 보내도 지표(밸런스%/평균 MMR/
  // 예상 승률)까지 바로 갱신됨.
  const handleMoveToOtherTeam = (p: TeamParticipant) => {
    const nextTeam = p.assignedTeam === 'TEAM_A' ? 'TEAM_B' : 'TEAM_A';
    updateTeams.mutate({
      assignments: [{ userId: p.userId, assignedTeam: nextTeam, assignedPosition: p.assignedPosition ?? undefined }],
    });
  };

  const renderTeamPlayer = (p: TeamParticipant, team: Side) => {
    const moveLabel = p.assignedTeam === 'TEAM_A' ? '블루팀으로 이동' : '레드팀으로 이동';
    return (
      <PlayerRow key={p.userId} $team={team}>
        {p.assignedPosition ? (
          <>
            <LaneCompact aria-label={p.assignedPosition}>
              <LaneLabel lane={p.assignedPosition} iconOnly />
            </LaneCompact>
            <LaneFull>
              <LaneLabel lane={p.assignedPosition} />
            </LaneFull>
          </>
        ) : (
          <TeamCaption aria-label="라인 미배정">—</TeamCaption>
        )}
        <NameCell>
          <Avatar name={p.nickname} imageUrl={resolveAssetUrl(p.profileImageUrl)} size={24} />
          <span>{p.nickname}</span>
        </NameCell>
        <TierCell>{p.tier ?? (p.hasLinkedAccount ? '언랭크' : '미연동')}</TierCell>
        <MmrCell
          $estimated={!p.hasLinkedAccount}
          title={p.hasLinkedAccount ? undefined : '계정 미연동 — 기본 MMR로 계산했어요'}
        >
          {p.mmr.toLocaleString()}
        </MmrCell>
        <MoveButton
          type="button"
          $size="sm"
          title={moveLabel}
          aria-label={`${p.nickname} ${moveLabel}`}
          onClick={() => handleMoveToOtherTeam(p)}
          disabled={generateTeams.isPending || updateTeams.isPending || match?.status === 'FINISHED'}
        >
          <Icon name="swap" size={14} />
        </MoveButton>
      </PlayerRow>
    );
  };

  const isGenerating = generateTeams.isPending;
  const notEnoughMembers = group !== undefined && group.members.length < 2;

  const redPct = analysis ? Math.round(analysis.teamA.expectedWinRate * 100) : 50;
  const bluePct = analysis ? Math.round(analysis.teamB.expectedWinRate * 100) : 50;

  const notice = matchError
    ? '내전 정보를 불러올 수 없어요.'
    : notEnoughMembers
      ? '그룹원이 2명 이상이어야 팀을 구성할 수 있어요.'
      : (matchLoading || isGenerating) && participants.length === 0
        ? isGenerating
          ? 'AI가 팀을 구성하고 있어요...'
          : '불러오는 중...'
        : null;

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내전 팀 구성</Title>
          <Subtitle>
            {group?.name ?? '그룹 불러오는 중...'} · {participants.length.toLocaleString()}명 참여
          </Subtitle>
        </div>
        <HeaderActions>
          <Button
            onClick={handleReshuffle}
            disabled={isGenerating || participants.length === 0}
            aria-busy={isGenerating || undefined}
          >
            <Icon name="refresh" spin={isGenerating} />
            {isGenerating ? '추첨 중…' : '다시 추첨'}
          </Button>
          {/* 추첨 중에 확정하면 바뀌기 전 팀이 저장되니 응답이 올 때까지 막음 */}
          <Button
            $variant="primary"
            onClick={handleConfirm}
            disabled={isGenerating || updateTeams.isPending || participants.length === 0}
          >
            구성 확정
          </Button>
        </HeaderActions>
      </Header>

      <Grid>
        {notice && (
          <Col $span={12}>
            <Card>
              <Notice role="status">{notice}</Notice>
            </Card>
          </Col>
        )}

        {analysis && (
          <Col $span={12}>
            <Card>
              <SectionHeader icon={<Icon name="stats" />} title="팀 밸런스" description="팀을 옮기면 바로 다시 계산돼요" />
              <Balance
                role="img"
                aria-label={`밸런스 ${analysis.balancePercent}%, 예상 승률 블루 ${bluePct} 대 레드 ${redPct}`}
              >
                <BalanceMeta aria-hidden="true">
                  <BalanceScore>
                    밸런스 <b>{analysis.balancePercent}%</b>
                  </BalanceScore>
                  <WinRateLabel>
                    예상 승률 <TeamText $team="B">{bluePct}</TeamText> : <TeamText $team="A">{redPct}</TeamText>
                  </WinRateLabel>
                </BalanceMeta>
                <BalanceTrack aria-hidden="true">
                  <BalanceBlue $pct={bluePct} />
                  <BalanceRed />
                  <BalanceMarker />
                </BalanceTrack>
              </Balance>
              <StatGrid>
                <Stat>
                  <StatLabel>블루 평균 MMR</StatLabel>
                  <StatValue $team="B">{analysis.teamB.averageMmr.toLocaleString()}</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>레드 평균 MMR</StatLabel>
                  <StatValue $team="A">{analysis.teamA.averageMmr.toLocaleString()}</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>평균 MMR 차이</StatLabel>
                  <StatValue>
                    {Math.abs(analysis.teamA.averageMmr - analysis.teamB.averageMmr).toLocaleString()}
                  </StatValue>
                </Stat>
                <Stat>
                  <StatLabel>주 라인 배정</StatLabel>
                  <StatValue>
                    {onPreferredLane} <small>/ {participants.length}명</small>
                  </StatValue>
                </Stat>
              </StatGrid>
            </Card>
          </Col>
        )}

        {participants.length > 0 &&
          // 블루팀(TEAM_B)을 왼쪽, 레드팀(TEAM_A)을 오른쪽에 — 화면 순서만 블루 → 레드.
          ([['B', teamB], ['A', teamA]] as const).map(([team, roster]) => {
            const total = roster.reduce((sum, p) => sum + p.mmr, 0);
            return (
              <Col key={team} $span={6}>
                <Card>
                  <TeamHead>
                    <TeamTag $team={team}>{team === 'A' ? '레드' : '블루'} · 팀 {team}</TeamTag>
                    <HeroNumber $team={team}>{total.toLocaleString()}</HeroNumber>
                    <TeamCaption>
                      MMR 합계 · 평균 {roster.length ? Math.round(total / roster.length).toLocaleString() : '—'} ·{' '}
                      {roster.length}명
                    </TeamCaption>
                  </TeamHead>
                  <RosterList>{roster.map((p) => renderTeamPlayer(p, team))}</RosterList>
                </Card>
              </Col>
            );
          })}

        {analysis && analysis.reasoning.length > 0 && (
          <Col $span={12}>
            <Card>
              <SectionHeader icon={<Icon name="chat" />} title="구성 근거" description="AI가 이렇게 나눈 이유예요" />
              <ReasonList>
                {analysis.reasoning.map((line, i) => (
                  <ReasonRow key={i}>{line}</ReasonRow>
                ))}
              </ReasonList>
            </Card>
          </Col>
        )}
      </Grid>
    </PageLayout>
  );
}
