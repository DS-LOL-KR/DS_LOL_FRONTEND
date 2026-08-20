import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { Table } from '../components/Table/Table';
import type { Column } from '../components/Table/Table';
import { useGroup } from '../features/groups/hooks';
import { useMatches } from '../features/matches/hooks';
import { setActiveGroupId } from '../utils/activeGroup';

interface MatchRow {
  id: string;
  playedAt: string;
  game: string;
  team: 'blue' | 'red';
  result: '승' | '패';
  kda: string;
  mmrDelta: number;
}

// TODO: GET /groups/:id/matches returns { id, groupId, gameId, mode, status, playedAt }
// today — no per-user team/KDA/MMR-delta yet, so this list stays mocked until the
// match-history read model exposes that (see /matches/:id/mmr-changes for the shape).
// useMatches(groupId) is still called below so the group's real match count/status is
// ready to swap in once the API grows those fields.
const MOCK_MATCHES: MatchRow[] = [
  { id: '1', playedAt: '08.08 02:40', game: '리그 오브 레전드', team: 'blue', result: '승', kda: '9 / 2 / 11', mmrDelta: 14 },
  { id: '2', playedAt: '08.07 01:15', game: '리그 오브 레전드', team: 'red', result: '패', kda: '4 / 7 / 6', mmrDelta: -9 },
  { id: '3', playedAt: '08.05 23:50', game: '발로란트', team: 'blue', result: '승', kda: '18 / 11 / 4', mmrDelta: 11 },
  { id: '4', playedAt: '08.03 02:05', game: '리그 오브 레전드', team: 'red', result: '승', kda: '7 / 3 / 14', mmrDelta: 12 },
  { id: '5', playedAt: '08.01 00:30', game: '오버워치 2', team: 'blue', result: '패', kda: '12 / 9 / 8', mmrDelta: -8 },
  { id: '6', playedAt: '07.29 01:20', game: '리그 오브 레전드', team: 'blue', result: '패', kda: '2 / 8 / 5', mmrDelta: -11 },
  { id: '7', playedAt: '07.27 23:10', game: '리그 오브 레전드', team: 'red', result: '승', kda: '11 / 4 / 9', mmrDelta: 13 },
];

const wins = MOCK_MATCHES.filter((m) => m.result === '승').length;
const losses = MOCK_MATCHES.length - wins;
const winRate = ((wins / MOCK_MATCHES.length) * 100).toFixed(1);
const avgMmrDelta = (
  MOCK_MATCHES.reduce((sum, m) => sum + m.mmrDelta, 0) / MOCK_MATCHES.length
).toFixed(1);

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

const ResultCell = styled.span<{ $win: boolean }>`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme, $win }) => ($win ? theme.color.state.success : theme.color.text.secondary)};
`;

const KdaCell = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const MmrCell = styled.span<{ $positive: boolean }>`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme, $positive }) => ($positive ? theme.color.state.success : theme.color.state.danger)};
`;

export function MatchHistoryPage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { data: group } = useGroup(groupId ?? '');
  useMatches(groupId ?? '');

  useEffect(() => {
    if (groupId) setActiveGroupId(groupId);
  }, [groupId]);

  const columns: Column<MatchRow>[] = [
    { key: 'playedAt', header: '일시', width: 120 },
    { key: 'game', header: '게임' },
    { key: 'team', header: '팀', width: 80, render: (m) => <TeamCell $team={m.team}>{m.team === 'blue' ? '블루' : '레드'}</TeamCell> },
    { key: 'result', header: '결과', width: 60, render: (m) => <ResultCell $win={m.result === '승'}>{m.result}</ResultCell> },
    { key: 'kda', header: 'KDA', width: 110, align: 'right', render: (m) => <KdaCell>{m.kda}</KdaCell> },
    {
      key: 'mmrDelta',
      header: 'MMR',
      width: 70,
      align: 'right',
      render: (m) => (
        <MmrCell $positive={m.mmrDelta >= 0}>{m.mmrDelta > 0 ? `+${m.mmrDelta}` : m.mmrDelta}</MmrCell>
      ),
    },
    {
      key: 'action',
      header: '',
      width: 90,
      align: 'right',
      render: (m) => (
        <Button $variant="ghost" $size="sm" onClick={() => navigate(`/matches/${m.id}`)}>
          상세
        </Button>
      ),
    },
  ];

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내전 기록</Title>
          <Subtitle>{group?.name ?? '새벽 내전방'}</Subtitle>
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
            {MOCK_MATCHES.length}
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
          <MetricValue $tone="success">+{avgMmrDelta}</MetricValue>
        </Metric>
      </Metrics>
      <TableWrap>
        <Table columns={columns} data={MOCK_MATCHES} />
      </TableWrap>
    </PageLayout>
  );
}
