import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader as Header, PageTitle as Title, PageSubtitle as Subtitle } from '../components/layout/PageHeader';
import { MmrSummary } from '../components/MmrSummary/MmrSummary';
import { SplitColumns as Columns, SplitPrimary as TrendColumn, SplitSecondary as ChangesColumn } from '../components/layout/Split';
import { Button } from '../components/Button/Button';
import { useMyMmrHistory } from '../features/matches/hooks';
import {
  useChampionMasteries,
  useChampionStats,
  useGameAccountFullStats,
  useMatchHistory,
  useMyGameAccounts,
  useFullSyncGameAccount,
} from '../features/game-accounts/hooks';
import { useGroup } from '../features/groups/hooks';
import { useTierTable } from '../features/tiers/hooks';
import { useMe } from '../features/auth/hooks';
import { useActiveGroupId } from '../utils/activeGroup';
import { useChampionName } from '../features/champions/hooks';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { formatDateTime } from '../utils/formatDateTime';

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
  font: ${({ theme }) => theme.font.caption11};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.secondary};
`;

// The 변동 내역 list runs far longer than the chart; pinning the chart keeps the
// two columns reading together instead of leaving a dead block under it.
const StickyTrendColumn = styled(TrendColumn)`
  position: sticky;
  top: 0;

  ${({ theme }) => theme.media.mobile} {
    position: static;
  }
`;

const CHART_HEIGHT = 220;
const MIN_BAR_RATIO = 0.16;

const BarChart = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
  height: ${CHART_HEIGHT}px;
`;

const BarGroup = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
`;

const BarTrack = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
`;

const Bar = styled.button<{ $ratio: number; $current: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  border: none;
  border-radius: 3px 3px 0 0;
  padding: 0;
  cursor: pointer;
  transform-origin: bottom;
  transform: scaleY(${({ $ratio }) => $ratio});
  background: ${({ theme, $current }) => ($current ? theme.color.accent.blue : theme.color.accent.blueMuted)};
  transition: background 0.15s ease;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.color.accent.blue};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: background 0.15s ease;
  }
`;

const BarIndex = styled.span`
  font-variant-numeric: tabular-nums;
  font-size: 15px;
  color: ${({ theme }) => theme.color.text.secondary};
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
  width: 62px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme, $positive }) => ($positive ? theme.color.state.success : theme.color.state.danger)};
`;

const RiotSection = styled.section`
  margin-top: 24px;
  padding-top: 40px;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
`;

const SectionTitle = styled.h2`
  font: ${({ theme }) => theme.font.title22};
  letter-spacing: -0.02em;
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
  width: 85px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  font-size: 16px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const MatchKda = styled.span`
  width: 110px;
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  font-size: 17px;
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
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  font-size: 17px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export function StatsPage() {
  const navigate = useNavigate();
  const { data: gameAccounts } = useMyGameAccounts();
  const championName = useChampionName();
  const { data: me } = useMe();
  const activeGroupId = useActiveGroupId();
  const activeGroupIdNum = Number(activeGroupId);
  // "그룹 내부 티어"가 activeGroupId 기준으로 보이는데 MMR 추이는 필터 없이 유저의
  // 모든 그룹이 섞여서 나오던 버그 수정(2026-09-13 문의) — 같은 그룹 기준으로 맞춤.
  const { data: mmrHistory } = useMyMmrHistory(activeGroupIdNum > 0 ? activeGroupIdNum : undefined);
  const { data: activeGroup } = useGroup(activeGroupIdNum);
  const { data: activeGroupTiers } = useTierTable(activeGroupIdNum);

  const history = mmrHistory ?? [];
  const trendSeries = [...history].reverse();
  const myGameAccounts = gameAccounts ?? [];
  const primaryAccount = myGameAccounts[0];
  const currentMmr = primaryAccount?.stats?.internalMmr ?? null;

  // "그룹 내부 티어"는 그룹 하나에 종속된 개념이라 계정 전체 페이지에 하나로
  // 못 박음 — 여러 그룹에 속해있을 수 있어서, nav가 기억하는 "마지막으로 본
  // 그룹"(activeGroupId) 기준으로 보여줌. 그 그룹에 티어 기록이 없으면(계정
  // 미연동 등) '-'.
  const myGroupTier = activeGroupTiers?.tiers.find((t) => t.userId === me?.id) ?? null;

  const accountId = Number(primaryAccount?.id);
  const { data: matchHistory } = useMatchHistory(accountId);
  const { data: championStats } = useChampionStats(accountId);
  const { data: championMasteries } = useChampionMasteries(accountId);
  const { data: fullStats } = useGameAccountFullStats(accountId);
  const fullSyncGameAccount = useFullSyncGameAccount(accountId);

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
  const barRatios = mmrAfterSeries.map((v) => MIN_BAR_RATIO + ((v - minMmr) / mmrRange) * (1 - MIN_BAR_RATIO));

  const recentDelta = history.reduce((sum, h) => sum + h.mmrChange, 0);
  const officialTier = primaryAccount?.stats?.officialTier ?? null;

  // "지금 갱신"과 "전적 동기화" 버튼은 위치만 다를 뿐 이제 똑같이 리프레시+동기화를
  // 전부 실행함 — 어느 쪽을 눌러도 결과가 같아야 한다는 요청이라 핸들러도 하나로 합침.
  const handleFullSync = () => {
    if (!primaryAccount) return;
    fullSyncGameAccount.mutate(undefined);
  };

  // 막대를 누르면 260ms 동안 "쭉 자라는" 연출 뒤에 이동했는데, 정보 없이 이동만
  // 늦추는 장식이라 바로 이동하게 바꿈. 가장 최근 경기(현재 MMR) 막대만 진하게.
  const handleBarClick = (matchId: number) => navigate(`/matches/${matchId}`);

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내 전적</Title>
          <Subtitle>전적은 하루 1회 자동 갱신 · {formatRelativeTime(primaryAccount?.stats?.updatedAt ?? null)}</Subtitle>
        </div>
        <Button onClick={handleFullSync} disabled={fullSyncGameAccount.isPending || !primaryAccount}>
          {fullSyncGameAccount.isPending ? '갱신 중...' : '지금 갱신'}
        </Button>
      </Header>
      <MmrSummary
        mmr={currentMmr}
        delta={history.length === 0 ? null : { value: recentDelta, label: '30일 변동' }}
        groupTier={{
          tier: myGroupTier?.tier ?? null,
          groupName: activeGroup?.name,
          emptyLabel: activeGroup ? '기록 없음' : '그룹 없음',
        }}
        officialTier={officialTier ?? (primaryAccount ? '언랭크' : '연동 필요')}
      />
      <Columns>
        <StickyTrendColumn>
          <ColumnHeader>
            <ColumnTitle>MMR 추이</ColumnTitle>
            <ColumnHint>최근 {trendSeries.length}경기</ColumnHint>
          </ColumnHeader>
          {barRatios.length === 0 ? (
            <EmptyHint>{primaryAccount ? '아직 집계된 내전 기록이 없어요' : '게임 계정을 연동하면 표시돼요'}</EmptyHint>
          ) : (
            <BarChart>
              {barRatios.map((ratio, i) => (
                <BarGroup key={i}>
                  <BarTrack>
                    <Bar
                      $ratio={ratio}
                      $current={i === barRatios.length - 1}
                      title={`${formatDateTime(trendSeries[i].playedAt)} · ${mmrAfterSeries[i]} MMR`}
                      aria-label={`${i + 1}번째 경기 상세 보기 · ${mmrAfterSeries[i]} MMR`}
                      onClick={() => handleBarClick(trendSeries[i].matchId)}
                    />
                  </BarTrack>
                  <BarIndex>{i + 1}</BarIndex>
                </BarGroup>
              ))}
            </BarChart>
          )}
        </StickyTrendColumn>
        <ChangesColumn>
          <ChangesHeader>
            <ChangesTitle>변동 내역</ChangesTitle>
          </ChangesHeader>
          {history.length === 0 ? (
            <EmptyHint>아직 집계된 변동 내역이 없어요</EmptyHint>
          ) : (
            history.map((c) => (
              <ChangeRow key={c.matchId}>
                <ChangeInfo>
                  <ChangeLabel>{formatDateTime(c.playedAt)}</ChangeLabel>
                  <ChangeReason>
                    {c.groupId === activeGroup?.id ? activeGroup.name : `그룹 #${c.groupId}`} 내전
                  </ChangeReason>
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
              <Button $variant="ghost" $size="sm" onClick={handleFullSync} disabled={fullSyncGameAccount.isPending || !primaryAccount}>
                {fullSyncGameAccount.isPending ? '동기화 중...' : '전적 동기화'}
              </Button>
            </ColumnHeader>
            {recentMatches.length === 0 ? (
              <EmptyHint>동기화된 매치가 없어요</EmptyHint>
            ) : (
              recentMatches.map((m) => (
                <MatchRow key={m.matchId}>
                  <MatchResultTag $win={m.win}>{m.win ? '승' : '패'}</MatchResultTag>
                  <MatchChampion>{championName(m.championId, m.championName)}</MatchChampion>
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
                    <ChampName>{championName(c.championId, c.championName)}</ChampName>
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
