import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { useMatch, useMmrChanges } from '../features/matches/hooks';
import type { MmrChange, Team, TeamPlayer } from '../features/matches/types';
import { useMe } from '../features/auth/hooks';
import { asArrayOrFallback } from '../utils/asArrayOrFallback';

// TODO: no design frame covers a standalone match-detail page yet (the Figma file
// only has AI 팀 구성 / 사용자 평가) — this view is assembled from the /matches/:id
// and /matches/:id/mmr-changes API shapes until a real design lands.
const MOCK_PLAYERS: TeamPlayer[] = [
  { userId: '1', nickname: '재현', lane: 'MID', tier: 1, mmr: 1990, recentMmrDelta: 14, team: 'A' },
  { userId: '2', nickname: '민석', lane: 'JGL', tier: 2, mmr: 1865, recentMmrDelta: 8, team: 'A' },
  { userId: '3', nickname: '지우', lane: 'BOT', tier: 2, mmr: 1902, recentMmrDelta: -3, team: 'A' },
  { userId: '4', nickname: '현우', lane: 'TOP', tier: 2, mmr: 1858, recentMmrDelta: 4, team: 'B' },
  { userId: '5', nickname: '도현', lane: 'JGL', tier: 3, mmr: 1702, recentMmrDelta: -7, team: 'B' },
  { userId: '6', nickname: '준서', lane: 'MID', tier: 1, mmr: 2015, recentMmrDelta: 11, team: 'B' },
];
const MOCK_WINNING_TEAM: Team = 'A';

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
  const { data: match } = useMatch(id ?? '');
  const { data: mmrChanges } = useMmrChanges(id ?? '');
  const { data: me } = useMe();

  const players = asArrayOrFallback(match?.teams?.players, MOCK_PLAYERS);
  const winningTeam = match?.winningTeam ?? MOCK_WINNING_TEAM;
  const teamA = players.filter((p) => p.team === 'A');
  const teamB = players.filter((p) => p.team === 'B');
  const alreadyRated = asArrayOrFallback<MmrChange>(mmrChanges, []).some((c) => c.userId === me?.id);

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내전 결과</Title>
          <Subtitle>{match?.playedAt ?? '08.08 02:40'} · {match?.mode ?? '5v5'}</Subtitle>
        </div>
        {!alreadyRated && (
          <Button onClick={() => navigate(`/matches/${id}/evaluate`)}>팀원 평가하기</Button>
        )}
      </Header>

      <Roster>
        {([['A', teamA] as const, ['B', teamB] as const]).map(([team, roster], i) => (
          <TeamColumn key={team} $side={i === 0 ? 'left' : 'right'}>
            <TeamHeader>
              <TeamName $won={team === winningTeam}>팀 {team}</TeamName>
              {team === winningTeam && <WinTag>승리</WinTag>}
            </TeamHeader>
            {roster.map((p) => (
              <PlayerRow key={p.userId}>
                <PlayerLane>{p.lane}</PlayerLane>
                <PlayerName>{p.nickname}</PlayerName>
                <PlayerDelta $positive={p.recentMmrDelta >= 0}>
                  {p.recentMmrDelta > 0 ? `+${p.recentMmrDelta}` : p.recentMmrDelta}
                </PlayerDelta>
              </PlayerRow>
            ))}
          </TeamColumn>
        ))}
      </Roster>

      <Section>
        <SectionTitle>MMR 변동 내역</SectionTitle>
        {asArrayOrFallback<MmrChange>(mmrChanges, []).length === 0 ? (
          <ChangeRow>
            <ChangeReason>아직 집계된 변동 내역이 없어요</ChangeReason>
          </ChangeRow>
        ) : (
          asArrayOrFallback<MmrChange>(mmrChanges, []).map((change, i) => (
            <ChangeRow key={i}>
              <ChangeReason>{change.reason}</ChangeReason>
              <ChangeDelta $positive={change.delta >= 0}>
                {change.delta > 0 ? `+${change.delta}` : change.delta}
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
