import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader as Header, PageTitle as Title, PageSubtitle as Subtitle, HeaderActions } from '../components/layout/PageHeader';
import { Metrics, Metric, MetricLabel, MetricValue as BaseMetricValue, MetricUnit } from '../components/layout/Metrics';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal/Modal';
import { Table } from '../components/Table/Table';
import type { Column } from '../components/Table/Table';
import { useGroup } from '../features/groups/hooks';
import { useDeleteMatch, useMatches } from '../features/matches/hooks';
import { useGames } from '../features/game-accounts/hooks';
import { useMe } from '../features/auth/hooks';
import { setActiveGroupId } from '../utils/activeGroup';
import { formatDateTime } from '../utils/formatDateTime';
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

const MetricValue = styled(BaseMetricValue)<{ $tone?: 'success' | 'danger' }>`
  color: ${({ theme, $tone }) =>
    $tone === 'success' ? theme.color.state.success : $tone === 'danger' ? theme.color.state.danger : theme.color.text.primary};
`;

const TableWrap = styled.div`
  margin-top: ${({ theme }) => theme.space.xs}px;
`;

const EmptyLabel = styled.p`
  padding: ${({ theme }) => theme.space.lg}px 0;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  opacity: 0.7;
`;

const TeamCell = styled.div<{ $team: 'blue' | 'red' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme, $team }) => theme.color.team[$team]};
  font: ${({ theme }) => theme.font.label12m};

  &::before {
    content: '';
    width: 3px;
    height: 11px;
    background: ${({ theme, $team }) => theme.color.team[$team]};
  }
`;

const ResultCell = styled.span<{ $result: MatchRow['result'] }>`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme, $result }) => {
    if ($result === '승') return theme.color.state.success;
    if ($result === '패') return theme.color.text.secondary;
    if ($result === '미참여') return theme.color.text.secondary;
    return theme.color.accent.blue;
  }};
`;

const MutedCell = styled.span`
  font-variant-numeric: tabular-nums;
  font-size: 17px;
  color: ${({ theme }) => theme.color.text.secondary};
  opacity: 0.6;
`;

const MmrCell = styled.span<{ $positive: boolean }>`
  font-variant-numeric: tabular-nums;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme, $positive }) => ($positive ? theme.color.state.success : theme.color.state.danger)};
`;

const ActionCell = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 6px;
`;

const ModalTitle = styled.p`
  font: ${({ theme }) => theme.font.sub17};
  color: ${({ theme }) => theme.color.text.primary};
  margin-bottom: ${({ theme }) => theme.space.sm}px;
`;

const ModalBody = styled.p`
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.space.xs}px;
  margin-top: ${({ theme }) => theme.space.md}px;
`;

export function MatchHistoryPage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
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
  const dateFilteredRows =
    dateFilter === '30D' ? rows.filter((r) => Date.now() - new Date(r.createdAt).getTime() <= THIRTY_DAYS_MS) : rows;

  const finished = dateFilteredRows.filter((r) => r.result === '승' || r.result === '패');
  const wins = finished.filter((r) => r.result === '승').length;
  const losses = finished.length - wins;
  const winRate = finished.length ? ((wins / finished.length) * 100).toFixed(1) : '0.0';
  const avgMmrDelta = finished.length
    ? (finished.reduce((sum, r) => sum + r.mmrDelta, 0) / finished.length).toFixed(1)
    : '0.0';

  const displayedRows = dateFilteredRows.filter((r) => {
    if (resultFilter === 'WIN') return r.result === '승';
    if (resultFilter === 'LOSS') return r.result === '패';
    return true;
  });

  const columns: Column<MatchRow>[] = [
    { key: 'playedAt', header: '일시', width: 200 },
    { key: 'game', header: '게임' },
    {
      key: 'team',
      header: '팀',
      width: 85,
      render: (m) => (m.team ? <TeamCell $team={m.team}>{m.team === 'blue' ? '블루' : '레드'}</TeamCell> : <MutedCell>-</MutedCell>),
    },
    { key: 'result', header: '결과', width: 85, render: (m) => <ResultCell $result={m.result}>{m.result}</ResultCell> },
    {
      key: 'mmrDelta',
      header: 'MMR',
      width: 75,
      align: 'right',
      render: (m) =>
        m.result === '진행중' || m.result === '미참여' ? (
          <MutedCell>-</MutedCell>
        ) : (
          <MmrCell $positive={m.mmrDelta >= 0}>{m.mmrDelta > 0 ? `+${m.mmrDelta}` : m.mmrDelta}</MmrCell>
        ),
    },
    {
      key: 'action',
      header: '',
      width: 175,
      align: 'right',
      render: (m) => (
        <ActionCell>
          <Button $variant="ghost" $size="sm" onClick={() => navigate(`/matches/${m.id}`)}>
            상세
          </Button>
          {m.canDelete && (
            <Button $variant="dangerGhost" $size="sm" onClick={() => setDeleteTarget(m.id)}>
              삭제
            </Button>
          )}
        </ActionCell>
      ),
    },
  ];

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
          <Button
            $variant={dateFilter === '30D' ? 'primary' : 'ghost'}
            $size="sm"
            aria-pressed={dateFilter === '30D'}
            onClick={() => setDateFilter(dateFilter === '30D' ? 'ALL' : '30D')}
          >
            최근 30일
          </Button>
          <Button
            $variant={resultFilter === 'WIN' ? 'primary' : 'ghost'}
            $size="sm"
            aria-pressed={resultFilter === 'WIN'}
            onClick={() => setResultFilter(resultFilter === 'WIN' ? 'ALL' : 'WIN')}
          >
            승
          </Button>
          <Button
            $variant={resultFilter === 'LOSS' ? 'primary' : 'ghost'}
            $size="sm"
            aria-pressed={resultFilter === 'LOSS'}
            onClick={() => setResultFilter(resultFilter === 'LOSS' ? 'ALL' : 'LOSS')}
          >
            패
          </Button>
        </HeaderActions>
      </Header>
      <Metrics>
        <Metric>
          <MetricLabel>총 전적</MetricLabel>
          <MetricValue>
            {dateFilteredRows.length}
            <MetricUnit> 전</MetricUnit>
          </MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>승 · 패</MetricLabel>
          <MetricValue>{wins} · {losses}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>승률</MetricLabel>
          <MetricValue>
            {winRate}
            <MetricUnit>%</MetricUnit>
          </MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>평균 MMR 변동</MetricLabel>
          <MetricValue $tone={finished.length === 0 ? undefined : Number(avgMmrDelta) >= 0 ? 'success' : 'danger'}>
            {Number(avgMmrDelta) > 0 ? `+${avgMmrDelta}` : avgMmrDelta}
          </MetricValue>
        </Metric>
      </Metrics>
      <TableWrap>
        {rows.length === 0 ? (
          <EmptyLabel>아직 진행된 내전이 없어요</EmptyLabel>
        ) : displayedRows.length === 0 ? (
          <EmptyLabel>조건에 맞는 내전이 없어요</EmptyLabel>
        ) : (
          <Table columns={columns} data={displayedRows} minWidth={820} />
        )}
      </TableWrap>

      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        <ModalTitle>이 내전을 삭제할까요?</ModalTitle>
        <ModalBody>팀 구성·평가 기록이 함께 삭제되며 되돌릴 수 없어요.</ModalBody>
        <ModalActions>
          <Button $variant="ghost" $size="sm" onClick={() => setDeleteTarget(null)}>취소</Button>
          <Button $variant="danger" $size="sm" onClick={handleDeleteConfirmed} disabled={deleteMatch.isPending}>삭제</Button>
        </ModalActions>
      </Modal>
    </PageLayout>
  );
}
