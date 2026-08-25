import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { useMatch, useMmrChanges } from '../features/matches/hooks';
import type { Position } from '../features/tiers/types';
import { useMe } from '../features/auth/hooks';

// TODO: no design frame covers a standalone match-detail page yet (the Figma file
// only has AI 팀 구성 / 사용자 평가) — this view is assembled from the /matches/:id
// and /matches/:id/mmr-changes API shapes until a real design lands. There's no
// nickname source for participants (no roster/join endpoint — see ERD), so
// players are labeled by userId. Side ('A'/'B') is page-local display shorthand
// for the real TEAM_A/TEAM_B fields.
type Side = 'A' | 'B';

interface RosterPlayer {
  userId: number;
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

const PlayerName = styled.span`
  flex: 1;
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
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.space.lg}px;
`;

export function MatchResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const matchId = Number(id);
  const { data: match } = useMatch(matchId);
  const { data: mmrChanges } = useMmrChanges(matchId);
  const { data: me } = useMe();

  // GET /matches/:id now embeds real `participants` — build the roster from
  // that directly instead of a mocked player list.
  const players: RosterPlayer[] = (match?.participants ?? []).map((p) => ({
    userId: p.userId,
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

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내전 결과</Title>
          <Subtitle>{match ? match.createdAt.slice(0, 16).replace('T', ' ') : '불러오는 중...'}</Subtitle>
        </div>
        {!alreadyRated && (
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
                  <PlayerName>유저 #{p.userId}</PlayerName>
                  <PlayerDelta $positive={p.mmrDelta >= 0}>
                    {p.mmrDelta > 0 ? `+${p.mmrDelta}` : p.mmrDelta}
                  </PlayerDelta>
                </PlayerRow>
              ))}
            </TeamColumn>
          ))}
        </Roster>
      )}

      <Section>
        <SectionTitle>MMR 변동 내역</SectionTitle>
        {changes.length === 0 ? (
          <ChangeRow>
            <ChangeReason>아직 집계된 변동 내역이 없어요</ChangeReason>
          </ChangeRow>
        ) : (
          changes.map((change) => (
            <ChangeRow key={change.userId}>
              <ChangeReason>유저 #{change.userId}</ChangeReason>
              <ChangeDelta $positive={change.mmrChange >= 0}>
                {change.mmrChange > 0 ? `+${change.mmrChange}` : change.mmrChange}
              </ChangeDelta>
            </ChangeRow>
          ))
        )}
      </Section>

      <Footer>
        <Button $variant="ghost" $size="sm" onClick={() => navigate(-1)}>목록으로</Button>
      </Footer>
    </PageLayout>
  );
}
