import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal/Modal';
import { Table } from '../components/Table/Table';
import type { Column } from '../components/Table/Table';
import { useGroup } from '../features/groups/hooks';
import { useDeleteMatch, useMatches } from '../features/matches/hooks';
import { useGames } from '../features/game-accounts/hooks';
import { useMe } from '../features/auth/hooks';
import { setActiveGroupId } from '../utils/activeGroup';

interface MatchRow {
  id: number;
  playedAt: string;
  game: string;
  team: 'blue' | 'red' | null;
  result: '승' | '패' | '진행중' | '미참여';
  mmrDelta: number;
  canDelete: boolean;
}

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

const Subtitle = styled.p`
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

const MetricValue = styled.p<{ $tone?: 'success' }>`
  margin-top: 5px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 29px;
  font-weight: 600;
  letter-spacing: -0.6px;
  color: ${({ theme, $tone }) => ($tone === 'success' ? theme.color.state.success : theme.color.text.primary)};
`;

const MetricUnit = styled.span`
  font-size: 15px;
  font-weight: 400;
  color: ${({ theme }) => theme.color.text.secondary};
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
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  color: ${({ theme }) => theme.color.text.secondary};
  opacity: 0.6;
`;

const MmrCell = styled.span<{ $positive: boolean }>`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px;
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

  useEffect(() => {
    if (groupId) setActiveGroupId(groupId);
  }, [groupId]);

  const gameList = games ?? [];

  // GET /groups/:id/matches now embeds `participants` per match — derive the
  // logged-in user's team/result/MMR-delta from that instead of mocking it.
  const rows: MatchRow[] = (matches ?? []).map((m) => {
    const mine = m.participants?.find((p) => p.userId === me?.id);
    const team: MatchRow['team'] = mine ? (mine.assignedTeam === 'TEAM_A' ? 'blue' : 'red') : null;
    const result: MatchRow['result'] = !mine
      ? '미참여'
      : m.status !== 'FINISHED'
        ? '진행중'
        : m.winningTeam === mine.assignedTeam
          ? '승'
          : '패';
    return {
      id: m.id,
      playedAt: m.createdAt.slice(0, 16).replace('T', ' '),
      game: gameList.find((g) => g.id === m.gameId)?.name ?? `게임 #${m.gameId}`,
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

  const finished = rows.filter((r) => r.result === '승' || r.result === '패');
  const wins = finished.filter((r) => r.result === '승').length;
  const losses = finished.length - wins;
  const winRate = finished.length ? ((wins / finished.length) * 100).toFixed(1) : '0.0';
  const avgMmrDelta = finished.length
    ? (finished.reduce((sum, r) => sum + r.mmrDelta, 0) / finished.length).toFixed(1)
    : '0.0';

  const columns: Column<MatchRow>[] = [
    { key: 'playedAt', header: '일시', width: 130 },
    { key: 'game', header: '게임' },
    {
      key: 'team',
      header: '팀',
      width: 80,
      render: (m) => (m.team ? <TeamCell $team={m.team}>{m.team === 'blue' ? '블루' : '레드'}</TeamCell> : <MutedCell>-</MutedCell>),
    },
    { key: 'result', header: '결과', width: 60, render: (m) => <ResultCell $result={m.result}>{m.result}</ResultCell> },
    {
      key: 'mmrDelta',
      header: 'MMR',
      width: 70,
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
      width: 150,
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
        {/* TODO: wire these to real date-range/game/result filters once the query params exist. */}
        <HeaderActions>
          <Button $variant="ghost" $size="sm">최근 30일</Button>
          <Button $variant="ghost" $size="sm">전체 게임</Button>
          <Button $variant="ghost" $size="sm">전체 결과</Button>
        </HeaderActions>
      </Header>
      <Metrics>
        <Metric>
          <MetricLabel>총 전적</MetricLabel>
          <MetricValue>
            {rows.length}
            <MetricUnit> 전</MetricUnit>
          </MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>승 · 패</MetricLabel>
          <MetricValue>{wins} · {losses}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>승률</MetricLabel>
          <MetricValue $tone="success">
            {winRate}
            <MetricUnit>%</MetricUnit>
          </MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>평균 MMR 변동</MetricLabel>
          <MetricValue $tone="success">
            {Number(avgMmrDelta) > 0 ? `+${avgMmrDelta}` : avgMmrDelta}
          </MetricValue>
        </Metric>
      </Metrics>
      <TableWrap>
        {rows.length === 0 ? (
          <EmptyLabel>아직 진행된 내전이 없어요</EmptyLabel>
        ) : (
          <Table columns={columns} data={rows} />
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
