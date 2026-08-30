import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Avatar } from '../components/Avatar/Avatar';
import { useUserProfile } from '../features/profile/hooks';
import {
  useChampionMasteries,
  useChampionStats,
  useGameAccountFullStats,
  useGames,
  useMatchHistory,
} from '../features/game-accounts/hooks';
import { resolveAssetUrl } from '../utils/assetUrl';

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md}px;
  padding-bottom: ${({ theme }) => theme.space.lg}px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const Name = styled.p`
  font: ${({ theme }) => theme.font.title26};
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.color.text.primary};
`;

const JoinedAt = styled.p`
  margin-top: 4px;
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Bio = styled.div`
  margin-top: ${({ theme }) => theme.space.lg}px;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};

  p {
    margin: 0;
  }

  p + p {
    margin-top: ${({ theme }) => theme.space.sm}px;
  }

  ul {
    margin: 0;
    padding-left: 1.2em;
  }
`;

const EmptyBio = styled.p`
  margin-top: ${({ theme }) => theme.space.lg}px;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  opacity: 0.6;
`;

const Metrics = styled.div`
  display: flex;
  margin-top: ${({ theme }) => theme.space.lg}px;
  padding: ${({ theme }) => theme.space.md}px 0;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
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

const ChangesColumn = styled.div`
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.space.lg}px 0 ${({ theme }) => theme.space.lg}px 40px;
  border-left: 1px solid ${({ theme }) => theme.color.border.base};
`;

const ColumnTitle = styled.p`
  font: ${({ theme }) => theme.font.sub15};
  color: ${({ theme }) => theme.color.text.primary};
  padding-bottom: ${({ theme }) => theme.space.md}px;
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

export function UserProfilePage() {
  const { id } = useParams();
  const userId = Number(id);
  const { data: user, isLoading, isError } = useUserProfile(userId);
  const { data: games } = useGames();

  // game-accounts/:id/... 쪽 API는 로그인만 하면 누구든 조회 가능하게 이미
  // 열려있어서(그룹 티어표 기능 특성상), GET /users/:id가 내려주는
  // gameAccounts에서 이 게임(LOL)의 계정 id만 찾으면 본인 전적 페이지와
  // 똑같은 훅을 그대로 재사용할 수 있음.
  const lolGameId = games?.find((g) => g.code === 'LOL')?.id;
  const account = user?.gameAccounts.find((a) => a.gameId === lolGameId);
  const accountId = Number(account?.id);

  const { data: fullStats } = useGameAccountFullStats(accountId);
  const { data: matchHistory } = useMatchHistory(accountId);
  const { data: championStats } = useChampionStats(accountId);
  const { data: championMasteries } = useChampionMasteries(accountId);

  const recentMatches = matchHistory ?? [];
  const champStats = championStats ?? [];
  const masteries = championMasteries ?? [];
  const masteryByChampion = new Map(masteries.map((m) => [m.championId, m]));
  const positionStats = fullStats?.positionStats ?? [];
  const currentMmr = fullStats?.stats?.internalMmr ?? null;
  const officialTier = fullStats?.stats?.officialTier ?? null;

  return (
    <PageLayout>
      <Header>
        <Avatar name={user?.nickname ?? '?'} imageUrl={resolveAssetUrl(user?.profileImageUrl)} size={56} />
        <div>
          <Name>{user?.nickname ?? (isLoading ? '불러오는 중...' : '알 수 없는 사용자')}</Name>
          {user && <JoinedAt>{user.createdAt.slice(0, 10)} 가입</JoinedAt>}
        </div>
      </Header>
      {isError ? (
        <EmptyBio>프로필을 불러올 수 없어요.</EmptyBio>
      ) : user?.bio ? (
        <Bio>
          <ReactMarkdown remarkPlugins={[remarkBreaks]}>{user.bio}</ReactMarkdown>
        </Bio>
      ) : (
        <EmptyBio>작성된 자기소개가 없어요.</EmptyBio>
      )}

      {!isError && user && !account ? (
        <EmptyHint>게임 계정을 연동하지 않았어요.</EmptyHint>
      ) : !isError && account ? (
        <>
          <Metrics>
            <Metric>
              <MetricLabel>현재 MMR</MetricLabel>
              <MetricValue>{currentMmr ?? '-'}</MetricValue>
            </Metric>
            <Metric>
              <MetricLabel>게임 공식 티어</MetricLabel>
              <MetricValue>{officialTier ?? '언랭크'}</MetricValue>
            </Metric>
          </Metrics>

          <RiotSection>
            <SectionTitle>라이엇 전적</SectionTitle>
            <Columns>
              <TrendColumn>
                <ColumnTitle>최근 매치</ColumnTitle>
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
                <ColumnTitle>챔피언 전적</ColumnTitle>
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
              <EmptyHint>아직 집계된 라인 기록이 없어요</EmptyHint>
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
        </>
      ) : null}
    </PageLayout>
  );
}
