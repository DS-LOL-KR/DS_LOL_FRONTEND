import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import {
  PageHeader as Header,
  PageTitle as Title,
  PageSubtitle as Subtitle,
  HeaderActions,
} from '../components/layout/PageHeader';
import { Grid, Col, Stack } from '../components/layout/Grid';
import { Card, SectionHeader } from '../components/Card/Card';
import { MmrSummary } from '../components/MmrSummary/MmrSummary';
import { Avatar } from '../components/Avatar/Avatar';
import { Button } from '../components/Button/Button';
import { Icon } from '../components/Icon/Icon';
import { useUserProfile } from '../features/profile/hooks';
import {
  useChampionMasteries,
  useChampionStats,
  useFullSyncGameAccount,
  useGameAccountFullStats,
  useGames,
  useMatchHistory,
} from '../features/game-accounts/hooks';
import { useGroup } from '../features/groups/hooks';
import { useTierTable } from '../features/tiers/hooks';
import { useActiveGroupId } from '../utils/activeGroup';
import { useChampionName } from '../features/champions/hooks';
import { resolveAssetUrl } from '../utils/assetUrl';
import { formatDate } from '../utils/formatDateTime';
import { ChampionStatsCard, LaneMmrCard, RecentMatchesCard, RecordKpis } from './StatsPage';

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-width: 0;
`;

const HeaderActionColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);

  ${({ theme }) => theme.media.mobile} {
    align-items: stretch;
  }
`;

const Bio = styled.div`
  font: ${({ theme }) => theme.type.body};
  color: ${({ theme }) => theme.color.text.secondary};

  p {
    margin: 0;
  }

  p + p {
    margin-top: var(--space-3);
  }

  ul {
    margin: 0;
    padding-left: 1.2em;
  }
`;

const EmptyText = styled.p`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const InlineError = styled.p`
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.state.danger};
`;

export function UserProfilePage() {
  const { id } = useParams();
  const userId = Number(id);
  const { data: user, isLoading, isError } = useUserProfile(userId);
  const { data: games } = useGames();
  const championName = useChampionName();

  // 내전 승률 · 라인별 그룹 평균은 "마지막으로 본 그룹"(activeGroupId) 기준 —
  // 내 전적 페이지와 같은 기준이라 두 화면 숫자가 서로 맞음. 그룹이 없으면 조회 안 함.
  const activeGroupIdNum = Number(useActiveGroupId());
  const groupIdForQuery = activeGroupIdNum > 0 ? activeGroupIdNum : NaN;
  const { data: activeGroup } = useGroup(groupIdForQuery);
  const { data: activeGroupTiers } = useTierTable(groupIdForQuery);
  const groupEntry = activeGroupTiers?.tiers.find((t) => t.userId === userId) ?? null;

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
  // 본인 계정이 아니어도 호출 가능하게 백엔드에서 소유권 제한을 풀어서(2026-09-19),
  // 그룹원 프로필에 들어가서 "대신 갱신"을 눌러줄 수 있음 — 전적이 오래된 팀원을
  // 매번 "본인이 갱신할 때까지" 기다릴 필요 없이 아무나 최신화할 수 있게 함.
  const fullSyncGameAccount = useFullSyncGameAccount(accountId);

  const handleFullSync = () => {
    if (!account) return;
    fullSyncGameAccount.mutate(undefined);
  };

  const recentMatches = matchHistory ?? [];
  const champStats = championStats ?? [];
  const masteries = championMasteries ?? [];
  const positionStats = fullStats?.positionStats ?? [];
  const currentMmr = fullStats?.stats?.internalMmr ?? null;
  const officialTier = fullStats?.stats?.officialTier ?? null;
  const mainPosition = fullStats?.stats?.mainPosition ?? null;

  return (
    <PageLayout>
      <Header>
        <Identity>
          <Avatar name={user?.nickname ?? '?'} imageUrl={resolveAssetUrl(user?.profileImageUrl)} size={56} />
          <div>
            <Title>{user?.nickname ?? (isLoading ? '불러오는 중...' : '알 수 없는 사용자')}</Title>
            {user && <Subtitle>{formatDate(user.createdAt)} 가입</Subtitle>}
          </div>
        </Identity>
        {!isError && account && (
          <HeaderActionColumn>
            <HeaderActions>
              <Button
                $variant="primary"
                onClick={handleFullSync}
                disabled={fullSyncGameAccount.isPending || !account}
              >
                <Icon name="refresh" />
                {fullSyncGameAccount.isPending ? '갱신 중...' : '지금 갱신'}
              </Button>
            </HeaderActions>
            {fullSyncGameAccount.isError && (
              <InlineError role="alert">{fullSyncGameAccount.error.message || '전적 갱신에 실패했어요'}</InlineError>
            )}
          </HeaderActionColumn>
        )}
      </Header>

      <Stack $gap="card">
        <Card>
          <SectionHeader icon={<Icon name="user" />} title="자기소개" />
          {isError ? (
            <EmptyText>프로필을 불러올 수 없어요.</EmptyText>
          ) : user?.bio ? (
            <Bio>
              <ReactMarkdown remarkPlugins={[remarkBreaks]}>{user.bio}</ReactMarkdown>
            </Bio>
          ) : (
            <EmptyText>{isLoading ? '불러오는 중...' : '작성된 자기소개가 없어요.'}</EmptyText>
          )}
        </Card>

        {!isError && user && !account ? (
          <Card>
            <SectionHeader icon={<Icon name="link" />} title="라이엇 전적" />
            <EmptyText>게임 계정을 연동하지 않았어요.</EmptyText>
          </Card>
        ) : !isError && account ? (
          <>
            <MmrSummary
              mmr={currentMmr}
              groupTier={
                activeGroup
                  ? {
                      tier: groupEntry?.tier ?? null,
                      groupName: activeGroup.name,
                      emptyLabel: '기록 없음',
                    }
                  : undefined
              }
              officialTier={officialTier ?? '언랭크'}
            />

            <Grid>
              <RecordKpis
                customRecord={
                  groupEntry ? { wins: groupEntry.customMatchWins, losses: groupEntry.customMatchLosses } : null
                }
                customEmptyHint={activeGroup ? `${activeGroup.name} 내전 기록이 없어요` : '같은 그룹 기록이 없어요'}
                matches={recentMatches}
                positionStats={positionStats}
                mainPosition={mainPosition}
                hasAccount
              />
            </Grid>

            <Grid>
              <Col $span={12}>
                <RecentMatchesCard matches={recentMatches} championName={championName} />
              </Col>
            </Grid>

            <Grid>
              <Col $span={8}>
                <ChampionStatsCard stats={champStats} masteries={masteries} championName={championName} />
              </Col>
              <Col $span={4}>
                <LaneMmrCard
                  positionStats={positionStats}
                  groupRows={activeGroupTiers?.tiers}
                  groupName={activeGroup?.name}
                  mainPosition={mainPosition}
                  emptyHint="아직 집계된 라인 기록이 없어요"
                />
              </Col>
            </Grid>
          </>
        ) : null}
      </Stack>
    </PageLayout>
  );
}
