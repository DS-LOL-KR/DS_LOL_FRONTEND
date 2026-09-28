import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader as Header, PageTitle as Title, PageSubtitle as Subtitle, HeaderActions } from '../components/layout/PageHeader';
import { Grid, Col } from '../components/layout/Grid';
import { Button } from '../components/Button/Button';
import { Card, IconBox, SectionHeader } from '../components/Card/Card';
import { Kpi } from '../components/Kpi/Kpi';
import { Badge } from '../components/Badge/Badge';
import { Icon } from '../components/Icon/Icon';
import { Modal } from '../components/Modal/Modal';
import { Table } from '../components/Table/Table';
import type { Column } from '../components/Table/Table';
import { useGroup } from '../features/groups/hooks';
import { useDeleteMatch, useMatches } from '../features/matches/hooks';
import { useGames } from '../features/game-accounts/hooks';
import { useMe } from '../features/auth/hooks';
import { setActiveGroupId } from '../utils/activeGroup';
import { formatDate, formatDateTime } from '../utils/formatDateTime';
import { getGameDisplayName } from '../utils/gameDisplayName';

interface MatchRow {
  id: number;
  createdAt: string;
  playedAt: string;
  game: string;
  team: 'blue' | 'red' | null;
  result: '승' | '패' | '진행중' | '미참여';
  mmrDelta: number;
  canDelete: boolean;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Filters are states, not actions — a joined segmented control reads as
// "pick one view" where loose buttons read as commands.
// docs/design-system.md §3.11: raised track, selected = hover step + 600
// (never a white fill).
const Segmented = styled.div`
  display: inline-flex;
  gap: 2px;
  height: var(--control-height);
  padding: 2px;
  background: ${({ theme }) => theme.color.surface.subtle};
  border: 1px solid ${({ theme }) => theme.color.border.base};
  border-radius: ${({ theme }) => theme.radius.control}px;
`;

const SegmentButton = styled.button<{ $active: boolean }>`
  flex: 1 0 auto;
  padding: 0 var(--space-3);
  border: 0;
  border-radius: ${({ theme }) => theme.radius.badge}px;
  cursor: pointer;
  white-space: nowrap;
  font: ${({ theme, $active }) => ($active ? theme.type.labelStrong : theme.type.label)};
  color: ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.text.secondary)};
  background: ${({ theme, $active }) => ($active ? theme.color.surface.hover : 'transparent')};
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);

  &:hover {
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

function SegmentedControl<V extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly (readonly [V, string])[];
  value: V;
  onChange: (value: V) => void;
}) {
  return (
    <Segmented role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <SegmentButton
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          $active={value === v}
          onClick={() => onChange(v)}
        >
          {text}
        </SegmentButton>
      ))}
    </Segmented>
  );
}

// Recent form strip (docs/design-system.md §3.7) — newest on the left, "승"/"패"
// text so it reads without color; a loss is not emphasized.
const FormCard = styled(Card)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3) var(--space-6);
`;

const FormLabel = styled.p`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const FormCaption = styled.p`
  margin-top: 2px;
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

const FormStrip = styled.ol`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  list-style: none;
`;

const FormChip = styled.li<{ $win: boolean }>`
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.radius.badge}px;
  font: ${({ theme }) => theme.type.badge};
  color: ${({ theme, $win }) => ($win ? theme.color.state.success : theme.color.text.muted)};
  background: ${({ theme, $win }) => ($win ? theme.color.state.successSoft : theme.color.surface.subtle)};
`;

const TeamNum = styled.span<{ $team: 'red' | 'blue' }>`
  color: ${({ theme, $team }) => theme.color.team[$team]};
`;

const Muted = styled.span`
  color: ${({ theme }) => theme.color.text.muted};
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-12) var(--card-padding);
  text-align: center;
`;

const EmptyTitle = styled.p`
  margin-top: var(--space-1);
  font: ${({ theme }) => theme.type.heading};
  color: ${({ theme }) => theme.color.text.primary};
`;

const EmptyBody = styled.p`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const TeamCell = styled.span<{ $team: 'blue' | 'red' }>`
  font: ${({ theme }) => theme.type.labelStrong};
  color: ${({ theme, $team }) => theme.color.team[$team]};
`;

// Red team color == loss color, so the result is always a text badge.
const ResultBadge = styled.span<{ $win: boolean }>`
  display: inline-grid;
  place-items: center;
  min-width: 28px;
  height: 22px;
  padding: 0 var(--space-2);
  border-radius: ${({ theme }) => theme.radius.badge}px;
  font: ${({ theme }) => theme.type.badge};
  color: ${({ theme, $win }) => ($win ? theme.color.state.success : theme.color.text.secondary)};
  background: ${({ theme, $win }) => ($win ? theme.color.state.successSoft : theme.color.surface.subtle)};
`;

const MutedCell = styled.span`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.muted};
`;

const MmrCell = styled.span<{ $dir: 'up' | 'down' | 'flat' }>`
  font: ${({ theme }) => theme.type.bodyStrong};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: ${({ theme, $dir }) =>
    $dir === 'up' ? theme.color.state.success : $dir === 'down' ? theme.color.state.danger : theme.color.text.muted};
`;

const ActionCell = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
`;

const ModalTitle = styled.p`
  font: ${({ theme }) => theme.type.heading};
  color: ${({ theme }) => theme.color.text.primary};
  margin-bottom: var(--space-2);
`;

const ModalBody = styled.p`
  font: ${({ theme }) => theme.type.body};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-6);
`;

function formatSigned(value: number, digits = 0): { text: string; dir: 'up' | 'down' | 'flat' } {
  if (value > 0) return { text: `↑ +${value.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`, dir: 'up' };
  if (value < 0)
    return {
      text: `↓ −${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`,
      dir: 'down',
    };
  return { text: '— 0', dir: 'flat' };
}

export function MatchHistoryPage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: group, isError: groupError } = useGroup(Number(groupId));
  const { data: matches } = useMatches(Number(groupId));
  const { data: games } = useGames();
  const { data: me } = useMe();
  const deleteMatch = useDeleteMatch(Number(groupId));
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<'ALL' | '30D'>('ALL');
  const [resultFilter, setResultFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');

  useEffect(() => {
    if (groupId) setActiveGroupId(groupId);
  }, [groupId]);

  const gameList = games ?? [];

  // GET /groups/:id/matches now embeds `participants` per match — derive the
  // logged-in user's team/result/MMR-delta from that instead of mocking it.
  const rows: MatchRow[] = (matches ?? []).map((m) => {
    const mine = m.participants?.find((p) => p.userId === me?.id);
    // TEAM_A = 레드, TEAM_B = 블루 (2026-09-12부터 — 그 전엔 반대였음)
    const team: MatchRow['team'] = mine ? (mine.assignedTeam === 'TEAM_A' ? 'red' : 'blue') : null;
    const result: MatchRow['result'] = !mine
      ? '미참여'
      : m.status !== 'FINISHED'
        ? '진행중'
        : m.winningTeam === mine.assignedTeam
          ? '승'
          : '패';
    return {
      id: m.id,
      createdAt: m.createdAt,
      playedAt: formatDateTime(m.createdAt),
      game: (() => {
        const game = gameList.find((g) => g.id === m.gameId);
        return game ? getGameDisplayName(game) : `게임 #${m.gameId}`;
      })(),
      team,
      result,
      mmrDelta: mine?.mmrChange ?? 0,
      canDelete: me?.id === m.createdBy || me?.id === group?.ownerId,
    };
  });

  const handleDeleteConfirmed = () => {
    if (deleteTarget === null) return;
    deleteMatch.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
  };

  // "최근 30일"은 지표(총 전적/승패/승률/평균MMR)에도 적용 — 필터를 켜면 그 기간
  // 기준으로 전부 다시 계산되는 게 자연스러움. "승"/"패" 결과 필터는 표 아래
  // 목록만 좁히고 지표는 그대로 둠 — 결과 필터까지 지표에 반영하면 "승만 보기"를
  // 누르는 순간 승률이 항상 100%로 보여서 의미가 없어짐.
  const inDateRange = (createdAt: string) =>
    dateFilter !== '30D' || Date.now() - new Date(createdAt).getTime() <= THIRTY_DAYS_MS;
  const dateFilteredRows = rows.filter((r) => inDateRange(r.createdAt));

  const finished = dateFilteredRows.filter((r) => r.result === '승' || r.result === '패');
  const wins = finished.filter((r) => r.result === '승').length;
  const losses = finished.length - wins;
  const winRate = finished.length ? ((wins / finished.length) * 100).toFixed(1) : null;
  const avgMmrDelta = finished.length ? finished.reduce((sum, r) => sum + r.mmrDelta, 0) / finished.length : null;

  // 그룹 전체 기준(내 참여 여부 무관) 블루/레드 승리 수 — 같은 기간 필터를 따름.
  const finishedMatches = (matches ?? []).filter(
    (m) => m.status === 'FINISHED' && m.winningTeam && inDateRange(m.createdAt),
  );
  const redWins = finishedMatches.filter((m) => m.winningTeam === 'TEAM_A').length;
  const blueWins = finishedMatches.length - redWins;
  const latestCreatedAt = dateFilteredRows.reduce<string | null>(
    (latest, r) => (!latest || new Date(r.createdAt) > new Date(latest) ? r.createdAt : latest),
    null,
  );

  const displayedRows = dateFilteredRows.filter((r) => {
    if (resultFilter === 'WIN') return r.result === '승';
    if (resultFilter === 'LOSS') return r.result === '패';
    return true;
  });

  const columns: Column<MatchRow>[] = [
    { key: 'playedAt', header: '일시', width: 170 },
    { key: 'game', header: '게임' },
    {
      key: 'team',
      header: '팀',
      width: 80,
      render: (m) => (m.team ? <TeamCell $team={m.team}>{m.team === 'blue' ? '블루' : '레드'}</TeamCell> : <MutedCell>—</MutedCell>),
    },
    {
      key: 'result',
      header: '결과',
      width: 90,
      render: (m) =>
        m.result === '승' || m.result === '패' ? (
          <ResultBadge $win={m.result === '승'}>{m.result}</ResultBadge>
        ) : m.result === '진행중' ? (
          <Badge>진행중</Badge>
        ) : (
          <MutedCell>미참여</MutedCell>
        ),
    },
    {
      key: 'mmrDelta',
      header: 'MMR',
      width: 90,
      align: 'right',
      render: (m) => {
        if (m.result === '진행중' || m.result === '미참여') return <MutedCell>—</MutedCell>;
        const { text, dir } = formatSigned(m.mmrDelta);
        return <MmrCell $dir={dir}>{text}</MmrCell>;
      },
    },
    {
      key: 'action',
      header: '',
      width: 150,
      align: 'right',
      render: (m) => (
        <ActionCell>
          {/* 행마다 반복되는 액션은 ghost — 빨간 강조는 삭제 확인 모달에서만 */}
          <Button $variant="ghost" $size="sm" onClick={() => navigate(`/matches/${m.id}`)}>
            상세
          </Button>
          {m.canDelete && (
            <Button $variant="ghost" $size="sm" onClick={() => setDeleteTarget(m.id)}>
              삭제
            </Button>
          )}
        </ActionCell>
      ),
    },
  ];

  const avgMmr = avgMmrDelta === null ? null : formatSigned(Number(avgMmrDelta.toFixed(1)), 1);

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내전 기록</Title>
          <Subtitle>{group?.name ?? (groupError ? '그룹 정보를 불러올 수 없어요' : '불러오는 중...')}</Subtitle>
        </div>
        {/* "게임" 필터는 없음 — 그룹당 게임이 하나로 고정돼 있어서(group.gameId)
            이 목록의 모든 내전이 항상 같은 게임이라 필터링할 대상 자체가 없음. */}
        <HeaderActions>
          <SegmentedControl
            label="기간"
            options={[['ALL', '전체 기간'], ['30D', '최근 30일']] as const}
            value={dateFilter}
            onChange={setDateFilter}
          />
          <Button $variant="primary" onClick={() => navigate(`/groups/${groupId}/matches/new`)}>
            <Icon name="plus" />
            내전 만들기
          </Button>
        </HeaderActions>
      </Header>

      <Grid>
        <Col $span={3}>
          <Kpi
            label="내 승률"
            value={winRate ?? <Muted>—</Muted>}
            unit={winRate !== null ? '%' : undefined}
            sub={finished.length ? `${wins}승 ${losses}패` : '완료된 내전이 없어요'}
          />
        </Col>
        <Col $span={3}>
          <Kpi
            label="평균 MMR 변동"
            value={avgMmr ? avgMmr.text : <Muted>—</Muted>}
            color={
              avgMmr?.dir === 'up' ? theme.color.state.success : avgMmr?.dir === 'down' ? theme.color.state.danger : undefined
            }
            sub={finished.length ? `완료된 ${finished.length.toLocaleString()}판 기준` : '완료된 내전이 없어요'}
          />
        </Col>
        <Col $span={3}>
          <Kpi
            label="내전 수"
            value={dateFilteredRows.length.toLocaleString()}
            unit="판"
            sub={
              dateFilteredRows.length > finished.length
                ? `진행중·미참여 ${(dateFilteredRows.length - finished.length).toLocaleString()}판`
                : latestCreatedAt
                  ? `최근 ${formatDate(latestCreatedAt)}`
                  : '아직 진행된 내전이 없어요'
            }
          />
        </Col>
        <Col $span={3}>
          <Kpi
            label="블루 : 레드 승리"
            value={
              finishedMatches.length ? (
                <>
                  <TeamNum $team="blue">{blueWins.toLocaleString()}</TeamNum>
                  {' : '}
                  <TeamNum $team="red">{redWins.toLocaleString()}</TeamNum>
                </>
              ) : (
                <Muted>—</Muted>
              )
            }
            sub={finishedMatches.length ? `그룹 전체 완료 ${finishedMatches.length.toLocaleString()}판` : '완료된 내전이 없어요'}
          />
        </Col>

        {finished.length > 0 && (
          <Col $span={12}>
            <FormCard>
              <div>
                <FormLabel>최근 {Math.min(finished.length, 10)}판</FormLabel>
                <FormCaption>왼쪽이 가장 최근 경기예요</FormCaption>
              </div>
              <FormStrip aria-label={`최근 ${Math.min(finished.length, 10)}판: ${finished.slice(0, 10).map((r) => r.result).join(' ')}`}>
                {finished.slice(0, 10).map((r) => (
                  <FormChip key={r.id} $win={r.result === '승'} title={`${r.playedAt} · ${r.result}`}>
                    {r.result}
                  </FormChip>
                ))}
              </FormStrip>
            </FormCard>
          </Col>
        )}

        <Col $span={12}>
          <Card flush>
            <SectionHeader
              inset
              icon={<Icon name="history" />}
              title="내전 목록"
              description={`${displayedRows.length.toLocaleString()}판 표시 중`}
              action={
                <SegmentedControl
                  label="결과"
                  options={[['ALL', '전체'], ['WIN', '승'], ['LOSS', '패']] as const}
                  value={resultFilter}
                  onChange={setResultFilter}
                />
              }
            />
            {rows.length === 0 || displayedRows.length === 0 ? (
              <Empty>
                <IconBox aria-hidden="true">
                  <Icon name="matches" />
                </IconBox>
                <EmptyTitle>{rows.length === 0 ? '아직 진행된 내전이 없어요' : '조건에 맞는 내전이 없어요'}</EmptyTitle>
                <EmptyBody>
                  {rows.length === 0 ? '첫 내전을 만들면 여기에 기록이 쌓여요.' : '기간이나 결과 필터를 바꿔 보세요.'}
                </EmptyBody>
              </Empty>
            ) : (
              <Table columns={columns} data={displayedRows} minWidth={720} rowTeam={(r) => r.team} rowKey={(r) => r.id} />
            )}
          </Card>
        </Col>
      </Grid>

      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        <ModalTitle>이 내전을 삭제할까요?</ModalTitle>
        <ModalBody>팀 구성·평가 기록이 함께 삭제되며 되돌릴 수 없어요.</ModalBody>
        <ModalActions>
          <Button $variant="ghost" onClick={() => setDeleteTarget(null)}>취소</Button>
          <Button $variant="danger" onClick={handleDeleteConfirmed} disabled={deleteMatch.isPending}>삭제</Button>
        </ModalActions>
      </Modal>
    </PageLayout>
  );
}
