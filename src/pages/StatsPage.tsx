import { useState } from 'react';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { useMyMmrHistory } from '../features/matches/hooks';
import type { MmrHistoryEntry } from '../features/matches/types';
import { useMyGameAccounts, useRefreshGameAccount } from '../features/game-accounts/hooks';
import type { GameAccount } from '../features/game-accounts/types';
import { asArrayOrFallback } from '../utils/asArrayOrFallback';

// TODO: no backend yet — shown when GET /users/me/mmr-history returns nothing.
// The 그룹 내부 티어 metric also stays mocked: it's a per-group value, but this
// route (/stats) is global — likely wants a /groups/:id/stats variant later.
const MOCK_HISTORY: MmrHistoryEntry[] = [
  { matchId: '1', playedAt: '08.08 내전', reason: '승리 +10 · 상대 티어 +2 · 팀원 평가 +2', delta: 14, mmrAfter: 1832 },
  { matchId: '2', playedAt: '08.07 내전', reason: '패배 -12 · 개인 지표 +3', delta: -9, mmrAfter: 1818 },
  { matchId: '3', playedAt: '08.05 발로란트', reason: '승리 +10 · 팀원 평가 +1', delta: 11, mmrAfter: 1827 },
  { matchId: '4', playedAt: '08.03 내전', reason: '승리 +10 · 상대 티어 +2', delta: 12, mmrAfter: 1816 },
  { matchId: '5', playedAt: '08.01 내전', reason: '패배 -12 · 팀원 평가 +4', delta: -8, mmrAfter: 1804 },
  { matchId: '6', playedAt: '07.29 내전', reason: '패배 -12 · 개인 지표 +1', delta: -11, mmrAfter: 1812 },
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

const Subtitle = styled.p`
  margin-top: 6px;
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme }) => theme.color.text.secondary};
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

const MetricValue = styled.p<{ $tone?: 'success' | 'tier2' | 'tier1' }>`
  margin-top: 5px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 29px;
  font-weight: 600;
  letter-spacing: -0.6px;
  color: ${({ theme, $tone }) => {
    if ($tone === 'success') return theme.color.state.success;
    if ($tone === 'tier2') return theme.color.tier[2];
    if ($tone === 'tier1') return theme.color.tier[1];
    return theme.color.text.primary;
  }};
`;

const MetricUnit = styled.span`
  font-size: 15px;
  font-weight: 400;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Columns = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
`;

const TrendColumn = styled.div`
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.space.lg}px 40px ${({ theme }) => theme.space.lg}px 0;
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.space.md}px;
`;

const ColumnTitle = styled.p`
  font: ${({ theme }) => theme.font.sub15};
  color: ${({ theme }) => theme.color.text.primary};
`;

const ColumnHint = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const BarChart = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
  height: 123px;
`;

const BarGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  justify-content: flex-end;
`;

const Bar = styled.div<{ $height: number; $current: boolean }>`
  width: 100%;
  height: ${({ $height }) => $height}px;
  border-radius: 2px;
  background: ${({ theme, $current }) => ($current ? theme.color.text.primary : theme.color.border.base)};
`;

const BarIndex = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ChangesColumn = styled.div`
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.space.lg}px 0 ${({ theme }) => theme.space.lg}px 40px;
  border-left: 1px solid ${({ theme }) => theme.color.border.base};
`;

const ChangesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.space.sm}px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const ChangesTitle = styled.p`
  font: ${({ theme }) => theme.font.sub15};
  color: ${({ theme }) => theme.color.text.primary};
`;

const ChangesHint = styled.span`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ChangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm}px;
  padding: 11px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};

  &:last-child {
    border-bottom: none;
  }
`;

const ChangeInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChangeLabel = styled.p`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const ChangeReason = styled.p`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ChangeDelta = styled.span<{ $positive: boolean }>`
  width: 56px;
  text-align: right;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 17px;
  font-weight: 600;
  color: ${({ theme, $positive }) => ($positive ? theme.color.state.success : theme.color.state.danger)};
`;

export function StatsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const { data: mmrHistory } = useMyMmrHistory();
  const { data: gameAccounts } = useMyGameAccounts();
  const refreshGameAccount = useRefreshGameAccount();

  const history = asArrayOrFallback<MmrHistoryEntry>(mmrHistory, MOCK_HISTORY);
  const trendSeries = [...history].reverse();
  const mmrValues = trendSeries.map((h) => h.mmrAfter);
  const minMmr = Math.min(...mmrValues);
  const maxMmr = Math.max(...mmrValues);
  const mmrRange = maxMmr - minMmr || 1;
  const barHeights = mmrValues.map((v) => 30 + ((v - minMmr) / mmrRange) * 93);

  const currentMmr = trendSeries[trendSeries.length - 1]?.mmrAfter ?? 1832;
  const recentDelta = history.reduce((sum, h) => sum + h.delta, 0);
  const myGameAccounts = asArrayOrFallback<GameAccount>(gameAccounts, []);
  const officialTier = myGameAccounts[0]?.stats.officialTier ?? '다이아 IV';

  const handleRefresh = () => {
    setRefreshing(true);
    const account = myGameAccounts[0];
    if (account) {
      refreshGameAccount.mutate(String(account.id), { onSettled: () => setRefreshing(false) });
    } else {
      setTimeout(() => setRefreshing(false), 800);
    }
  };

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내 전적</Title>
          <Subtitle>전적은 하루 1회 자동 갱신 · 12분 전 갱신</Subtitle>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? '갱신 중...' : '지금 갱신'}
        </Button>
      </Header>
      <Metrics>
        <Metric>
          <MetricLabel>현재 MMR</MetricLabel>
          <MetricValue>{currentMmr}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>30일 변동</MetricLabel>
          <MetricValue $tone={recentDelta >= 0 ? 'success' : undefined}>
            {recentDelta > 0 ? `+${recentDelta}` : recentDelta}
          </MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>그룹 내부 티어</MetricLabel>
          <MetricValue $tone="tier2">
            2<MetricUnit> 티어</MetricUnit>
          </MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>게임 공식 티어</MetricLabel>
          <MetricValue $tone="tier1">{officialTier}</MetricValue>
        </Metric>
      </Metrics>
      <Columns>
        <TrendColumn>
          <ColumnHeader>
            <ColumnTitle>MMR 추이</ColumnTitle>
            <ColumnHint>최근 {trendSeries.length}경기</ColumnHint>
          </ColumnHeader>
          <BarChart>
            {barHeights.map((height, i) => (
              <BarGroup key={i}>
                <Bar $height={height} $current={i === barHeights.length - 1} />
                <BarIndex>{i + 1}</BarIndex>
              </BarGroup>
            ))}
          </BarChart>
        </TrendColumn>
        <ChangesColumn>
          <ChangesHeader>
            <ChangesTitle>변동 내역</ChangesTitle>
            <ChangesHint>항목별 내역</ChangesHint>
          </ChangesHeader>
          {history.map((c) => (
            <ChangeRow key={c.matchId}>
              <ChangeInfo>
                <ChangeLabel>{c.playedAt}</ChangeLabel>
                <ChangeReason>{c.reason}</ChangeReason>
              </ChangeInfo>
              <ChangeDelta $positive={c.delta >= 0}>{c.delta > 0 ? `+${c.delta}` : c.delta}</ChangeDelta>
            </ChangeRow>
          ))}
        </ChangesColumn>
      </Columns>
    </PageLayout>
  );
}
