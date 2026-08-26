import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { useMyMmrHistory } from '../features/matches/hooks';
import {
  useChampionMasteries,
  useChampionStats,
  useGameAccountFullStats,
  useMatchHistory,
  useMyGameAccounts,
  useRefreshGameAccount,
  useSyncMatchHistory,
} from '../features/game-accounts/hooks';

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

const CHART_HEIGHT = 220;
const MIN_BAR_HEIGHT = 36;

const growIn = keyframes`
  from { transform: scaleY(0); opacity: 0.4; }
  to { transform: scaleY(1); opacity: 1; }
`;

const BarChart = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
  height: ${CHART_HEIGHT}px;
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

const Bar = styled.button<{ $height: number; $delay: number; $active: boolean }>`
  width: 100%;
  height: ${({ $height }) => $height}px;
  border: none;
  border-radius: 2px;
  padding: 0;
  cursor: pointer;
  transform-origin: bottom;
  background: ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.border.base)};
  animation: ${growIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  animation-delay: ${({ $delay }) => $delay}ms;
  transition: height 0.32s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.15s ease;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.color.text.primary};
  }
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

const RiotSection = styled.div`
  padding-top: ${({ theme }) => theme.space.lg}px;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
`;

const SectionTitle = styled.p`
  font: ${({ theme }) => theme.font.title22};
  letter-spacing: -0.3px;
  color: ${({ theme }) => theme.color.text.primary};
  padding-bottom: ${({ theme }) => theme.space.sm}px;
`;

const EmptyHint = styled.p`
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  opacity: 0.7;
  padding: ${({ theme }) => theme.space.sm}px 0;
`;

const MatchRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm}px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};

  &:last-child {
    border-bottom: none;
  }
`;

const MatchResultTag = styled.span<{ $win: boolean }>`
  width: 26px;
  font: ${({ theme }) => theme.font.label12m};
  color: ${({ theme, $win }) => ($win ? theme.color.state.success : theme.color.text.secondary)};
`;

const MatchChampion = styled.span`
  flex: 1;
  min-width: 0;
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const MatchMeta = styled.span`
  width: 70px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const MatchKda = styled.span`
  width: 100px;
  text-align: right;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ChampRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm}px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};

  &:last-child {
    border-bottom: none;
  }
`;

const ChampName = styled.span`
  flex: 1;
  min-width: 0;
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const ChampMastery = styled.span`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ChampRecord = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export function StatsPage() {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const { data: mmrHistory } = useMyMmrHistory();
  const { data: gameAccounts } = useMyGameAccounts();
  const refreshGameAccount = useRefreshGameAccount();

  const history = mmrHistory ?? [];
  const trendSeries = [...history].reverse();
  const myGameAccounts = gameAccounts ?? [];
  const primaryAccount = myGameAccounts[0];
  const currentMmr = primaryAccount?.stats?.internalMmr ?? null;

  const accountId = Number(primaryAccount?.id);
  const { data: matchHistory } = useMatchHistory(accountId);
  const { data: championStats } = useChampionStats(accountId);
  const { data: championMasteries } = useChampionMasteries(accountId);
  const { data: fullStats } = useGameAccountFullStats(accountId);
  const syncMatchHistory = useSyncMatchHistory(accountId);

  const recentMatches = matchHistory ?? [];
  const champStats = championStats ?? [];
  const masteries = championMasteries ?? [];
  const masteryByChampion = new Map(masteries.map((m) => [m.championId, m]));
  const positionStats = fullStats?.positionStats ?? [];

  // `custom_match_participants.mmr_change` (see ERD) is a per-match delta, not a
  // stored running total — walk backwards from the current MMR to reconstruct the
  // "MMR after each match" series the trend chart plots. Needs a known current
  // MMR to anchor to, so the chart stays empty without a linked game account.
  const mmrAfterSeries: number[] = currentMmr === null ? [] : new Array(trendSeries.length);
  if (currentMmr !== null && trendSeries.length > 0) {
    mmrAfterSeries[trendSeries.length - 1] = currentMmr;
    for (let i = trendSeries.length - 2; i >= 0; i--) {
      mmrAfterSeries[i] = mmrAfterSeries[i + 1] - trendSeries[i + 1].mmrChange;
    }
  }
  const minMmr = mmrAfterSeries.length ? Math.min(...mmrAfterSeries) : 0;
  const maxMmr = mmrAfterSeries.length ? Math.max(...mmrAfterSeries) : 0;
  const mmrRange = maxMmr - minMmr || 1;
  const barHeights = mmrAfterSeries.map((v) => MIN_BAR_HEIGHT + ((v - minMmr) / mmrRange) * (CHART_HEIGHT - MIN_BAR_HEIGHT));

  const recentDelta = history.reduce((sum, h) => sum + h.mmrChange, 0);
  const officialTier = primaryAccount?.stats?.officialTier ?? null;

  const handleRefresh = () => {
    if (!primaryAccount) return;
    setRefreshing(true);
    refreshGameAccount.mutate(primaryAccount.id, { onSettled: () => setRefreshing(false) });
  };

  // Growing the bar to full height before navigating gives the click somewhere
  // to land — the trend "shoots up" instead of instantly cutting to a new page.
  const handleBarClick = (i: number, matchId: number) => {
    setActiveBar(i);
    window.setTimeout(() => navigate(`/matches/${matchId}`), 260);
  };

  const handleSync = () => {
    if (!primaryAccount) return;
    setSyncing(true);
    syncMatchHistory.mutate(undefined, { onSettled: () => setSyncing(false) });
  };

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내 전적</Title>
          <Subtitle>전적은 하루 1회 자동 갱신 · 12분 전 갱신</Subtitle>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing || !primaryAccount}>
          {refreshing ? '갱신 중...' : '지금 갱신'}
        </Button>
      </Header>
      <Metrics>
        <Metric>
          <MetricLabel>현재 MMR</MetricLabel>
          <MetricValue>{currentMmr ?? '-'}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>30일 변동</MetricLabel>
          <MetricValue $tone={recentDelta >= 0 ? 'success' : undefined}>
            {history.length === 0 ? '-' : recentDelta > 0 ? `+${recentDelta}` : recentDelta}
          </MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>그룹 내부 티어</MetricLabel>
          <MetricValue>준비 중</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>게임 공식 티어</MetricLabel>
          <MetricValue $tone="tier1">{officialTier ?? (primaryAccount ? '언랭크' : '연동 필요')}</MetricValue>
        </Metric>
      </Metrics>
      <Columns>
        <TrendColumn>
          <ColumnHeader>
            <ColumnTitle>MMR 추이</ColumnTitle>
            <ColumnHint>최근 {trendSeries.length}경기</ColumnHint>
          </ColumnHeader>
          {barHeights.length === 0 ? (
            <EmptyHint>{primaryAccount ? '아직 집계된 내전 기록이 없어요' : '게임 계정을 연동하면 표시돼요'}</EmptyHint>
          ) : (
            <BarChart>
              {barHeights.map((height, i) => (
                <BarGroup key={i}>
                  <Bar
                    $height={activeBar === i ? CHART_HEIGHT : height}
                    $active={activeBar === i}
                    $delay={i * 40}
                    title={`${trendSeries[i].playedAt} · ${mmrAfterSeries[i]} MMR`}
                    onClick={() => handleBarClick(i, trendSeries[i].matchId)}
                  />
                  <BarIndex>{i + 1}</BarIndex>
                </BarGroup>
              ))}
            </BarChart>
          )}
        </TrendColumn>
        <ChangesColumn>
          <ChangesHeader>
            <ChangesTitle>변동 내역</ChangesTitle>
            <ChangesHint>항목별 내역</ChangesHint>
          </ChangesHeader>
          {history.length === 0 ? (
            <EmptyHint>아직 집계된 변동 내역이 없어요</EmptyHint>
          ) : (
            history.map((c) => (
              <ChangeRow key={c.matchId}>
                <ChangeInfo>
                  <ChangeLabel>{c.playedAt}</ChangeLabel>
                  <ChangeReason>그룹 #{c.groupId} 내전</ChangeReason>
                </ChangeInfo>
                <ChangeDelta $positive={c.mmrChange >= 0}>
                  {c.mmrChange > 0 ? `+${c.mmrChange}` : c.mmrChange}
                </ChangeDelta>
              </ChangeRow>
            ))
          )}
        </ChangesColumn>
      </Columns>

      <RiotSection>
        <SectionTitle>라이엇 전적</SectionTitle>
        <Columns>
          <TrendColumn>
            <ColumnHeader>
              <ColumnTitle>최근 매치</ColumnTitle>
              <Button $variant="ghost" $size="sm" onClick={handleSync} disabled={syncing || !primaryAccount}>
                {syncing ? '동기화 중...' : '전적 동기화'}
              </Button>
            </ColumnHeader>
            {recentMatches.length === 0 ? (
              <EmptyHint>동기화된 매치가 없어요</EmptyHint>
            ) : (
              recentMatches.map((m) => (
                <MatchRow key={m.matchId}>
                  <MatchResultTag $win={m.win}>{m.win ? '승' : '패'}</MatchResultTag>
                  <MatchChampion>{m.championName ?? `챔피언 #${m.championId}`}</MatchChampion>
                  <MatchMeta>{m.position}</MatchMeta>
                  <MatchKda>{m.kills} / {m.deaths} / {m.assists}</MatchKda>
                </MatchRow>
              ))
            )}
          </TrendColumn>
          <ChangesColumn>
            <ChangesHeader>
              <ChangesTitle>챔피언 전적</ChangesTitle>
              <ChangesHint>숙련도 순</ChangesHint>
            </ChangesHeader>
            {champStats.length === 0 ? (
              <EmptyHint>동기화된 챔피언 전적이 없어요</EmptyHint>
            ) : (
              champStats.map((c) => {
                const mastery = masteryByChampion.get(c.championId);
                return (
                  <ChampRow key={c.championId}>
                    <ChampName>{c.championName ?? `챔피언 #${c.championId}`}</ChampName>
                    {mastery && <ChampMastery>숙련도 {mastery.masteryLevel}</ChampMastery>}
                    <ChampRecord>
                      {c.wins}승 {c.losses}패 · {Math.round(c.winRate * 100)}%
                    </ChampRecord>
                  </ChampRow>
                );
              })
            )}
          </ChangesColumn>
        </Columns>
      </RiotSection>

      <RiotSection>
        <SectionTitle>라인별 기록</SectionTitle>
        {positionStats.length === 0 ? (
          <EmptyHint>{primaryAccount ? '아직 집계된 라인 기록이 없어요' : '게임 계정을 연동하면 표시돼요'}</EmptyHint>
        ) : (
          positionStats.map((p) => (
            <ChampRow key={p.position}>
              <ChampName>{p.position}</ChampName>
              <ChampRecord>
                {p.gamesPlayed}전 · {Math.round(p.winRate * 100)}% · MMR {p.positionMmr}
              </ChampRecord>
            </ChampRow>
          ))
        )}
      </RiotSection>
    </PageLayout>
  );
}
