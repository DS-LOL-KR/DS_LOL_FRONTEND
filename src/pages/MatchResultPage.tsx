import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { Avatar } from '../components/Avatar/Avatar';
import { useFinishMatch, useMatch, useMmrChanges } from '../features/matches/hooks';
import type { Position } from '../features/tiers/types';
import { useMe } from '../features/auth/hooks';
import { resolveAssetUrl } from '../utils/assetUrl';

// TODO: no design frame covers a standalone match-detail page yet (the Figma file
// only has AI 팀 구성 / 사용자 평가) — this view is assembled from the /matches/:id
// and /matches/:id/mmr-changes API shapes until a real design lands. Side
// ('A'/'B') is page-local display shorthand for the real TEAM_A/TEAM_B fields.
type Side = 'A' | 'B';

interface RosterPlayer {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  lane: Position | null;
  mmrDelta: number;
  team: Side;
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

const EmptyState = styled.p`
  padding: ${({ theme }) => theme.space.lg}px 0;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  opacity: 0.7;
`;

const Roster = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: ${({ theme }) => theme.space.lg}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const TeamColumn = styled.div<{ $side: 'left' | 'right' }>`
  flex: 1;
  min-width: 0;
  padding-left: ${({ $side }) => ($side === 'right' ? '40px' : '0')};
`;

const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
`;

const TeamName = styled.span<{ $won: boolean }>`
  font: ${({ theme }) => theme.font.sub17};
  color: ${({ theme, $won }) => ($won ? theme.color.state.success : theme.color.text.primary)};
`;

const WinTag = styled.span`
  font: ${({ theme }) => theme.font.label12m};
  color: ${({ theme }) => theme.color.state.success};
`;

const PlayerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const PlayerName = styled.span`
  min-width: 0;
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const PlayerLane = styled.span`
  width: 44px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const PlayerDelta = styled.span<{ $positive: boolean }>`
  width: 48px;
  text-align: right;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme, $positive }) => ($positive ? theme.color.state.success : theme.color.state.danger)};
`;

const Section = styled.div`
  width: 100%;
  padding-top: ${({ theme }) => theme.space.lg}px;
`;

const SectionTitle = styled.p`
  font: ${({ theme }) => theme.font.sub15};
  color: ${({ theme }) => theme.color.text.primary};
  padding-bottom: 10px;
`;

const ChangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm}px;
  padding: 10px 0;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
`;

const ChangeReason = styled.span`
  flex: 1;
  min-width: 0;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ChangeDelta = styled.span<{ $positive: boolean }>`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme, $positive }) => ($positive ? theme.color.state.success : theme.color.state.danger)};
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${({ theme }) => theme.space.lg}px;
`;

const WinnerSection = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.space.lg}px 0;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
`;

const WinnerHint = styled.p`
  margin-top: 4px;
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const WinnerRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.sm}px;
  padding-top: 10px;
`;

export function MatchResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const matchId = Number(id);
  const { data: match } = useMatch(matchId);
  const { data: mmrChanges } = useMmrChanges(matchId);
  const { data: me } = useMe();
  const finishMatch = useFinishMatch(matchId);

  // GET /matches/:id now embeds real `participants` (nickname/profileImageUrl
  // included) — build the roster from that directly instead of a mocked list.
  const participantById = new Map((match?.participants ?? []).map((p) => [p.userId, p]));
  const players: RosterPlayer[] = (match?.participants ?? []).map((p) => ({
    userId: p.userId,
    nickname: p.nickname,
    profileImageUrl: p.profileImageUrl,
    lane: p.assignedPosition ?? null,
    mmrDelta: p.mmrChange,
    team: p.assignedTeam === 'TEAM_A' ? 'A' : 'B',
  }));
  const winningTeam: Side | null =
    match?.winningTeam === 'TEAM_A' ? 'A' : match?.winningTeam === 'TEAM_B' ? 'B' : null;
  const teamA = players.filter((p) => p.team === 'A');
  const teamB = players.filter((p) => p.team === 'B');
  const changes = mmrChanges ?? [];
  const alreadyRated = changes.some((c) => c.userId === me?.id);

  const handleFinish = (winner: 'TEAM_A' | 'TEAM_B') => {
    finishMatch.mutate({ winningTeam: winner });
  };

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내전 결과</Title>
          <Subtitle>{match ? match.createdAt.slice(0, 16).replace('T', ' ') : '불러오는 중...'}</Subtitle>
        </div>
        {match?.status === 'FINISHED' && !alreadyRated && (
          <Button onClick={() => navigate(`/matches/${id}/evaluate`)}>팀원 평가하기</Button>
        )}
      </Header>

      {players.length === 0 ? (
        <EmptyState>아직 팀 배정 정보가 없어요</EmptyState>
      ) : (
        <Roster>
          {([['A', teamA] as const, ['B', teamB] as const]).map(([team, roster], i) => (
            <TeamColumn key={team} $side={i === 0 ? 'left' : 'right'}>
              <TeamHeader>
                <TeamName $won={team === winningTeam}>팀 {team}</TeamName>
                {team === winningTeam && <WinTag>승리</WinTag>}
              </TeamHeader>
              {roster.map((p) => (
                <PlayerRow key={p.userId}>
                  <PlayerLane>{p.lane ?? '-'}</PlayerLane>
                  <PlayerInfo>
                    <Avatar name={p.nickname} imageUrl={resolveAssetUrl(p.profileImageUrl)} size={22} />
                    <PlayerName>{p.nickname}</PlayerName>
                  </PlayerInfo>
                  <PlayerDelta $positive={p.mmrDelta >= 0}>
                    {p.mmrDelta > 0 ? `+${p.mmrDelta}` : p.mmrDelta}
                  </PlayerDelta>
                </PlayerRow>
              ))}
            </TeamColumn>
          ))}
        </Roster>
      )}

      {match?.status === 'MATCHED' && (
        <WinnerSection>
          <SectionTitle>어느 팀이 이겼나요?</SectionTitle>
          <WinnerHint>참가자들의 라이엇 전적이 동기화되면 자동으로 반영돼요. 급하면 직접 골라도 돼요.</WinnerHint>
          <WinnerRow>
            <Button onClick={() => handleFinish('TEAM_A')} disabled={finishMatch.isPending}>팀 A 승리</Button>
            <Button onClick={() => handleFinish('TEAM_B')} disabled={finishMatch.isPending}>팀 B 승리</Button>
          </WinnerRow>
        </WinnerSection>
      )}

      {match?.status === 'FINISHED' && (
        <Section>
          <SectionTitle>MMR 변동 내역</SectionTitle>
          {changes.length === 0 ? (
            <ChangeRow>
              <ChangeReason>아직 집계된 변동 내역이 없어요</ChangeReason>
            </ChangeRow>
          ) : (
            changes.map((change) => (
              <ChangeRow key={change.userId}>
                <ChangeReason>{participantById.get(change.userId)?.nickname ?? `유저 #${change.userId}`}</ChangeReason>
                <ChangeDelta $positive={change.mmrChange >= 0}>
                  {change.mmrChange > 0 ? `+${change.mmrChange}` : change.mmrChange}
                </ChangeDelta>
              </ChangeRow>
            ))
          )}
        </Section>
      )}

      <Footer>
        <Button $variant="ghost" $size="sm" onClick={() => navigate(-1)}>목록으로</Button>
        {match && match.status !== 'WAITING' && (
          <Button $variant="ghost" $size="sm" onClick={() => navigate(`/matches/${id}/teams`)}>
            팀 구성 보기
          </Button>
        )}
      </Footer>
    </PageLayout>
  );
}
