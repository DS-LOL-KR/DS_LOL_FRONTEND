import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal/Modal';
import { Avatar } from '../components/Avatar/Avatar';
import {
  useDuplicateMatchTeams,
  useFinishMatch,
  useMatch,
  useMmrChanges,
  useSubmitEvaluation,
} from '../features/matches/hooks';
import type { Position } from '../features/tiers/types';
import { useMe } from '../features/auth/hooks';
import { resolveAssetUrl } from '../utils/assetUrl';

type RatingOption = '아쉬웠어요' | '무난했어요' | '좋았어요';
const RATING_OPTIONS: RatingOption[] = ['아쉬웠어요', '무난했어요', '좋았어요'];
const RATING_SCORE: Record<RatingOption, 1 | 2 | 3 | 4 | 5> = { 아쉬웠어요: 1, 무난했어요: 3, 좋았어요: 5 };

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

const FooterActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.xs}px;
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

const EvalPanel = styled.div`
  width: 640px;
  max-width: 80vw;
`;

const EvalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const EvalTitle = styled.p`
  font: ${({ theme }) => theme.font.title22};
  letter-spacing: -0.3px;
  color: ${({ theme }) => theme.color.text.primary};
`;

const EvalResultLabel = styled.span<{ $won: boolean }>`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme, $won }) => ($won ? theme.color.state.success : theme.color.text.secondary)};
`;

const EvalHint = styled.p`
  margin-top: 6px;
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const EvalDivider = styled.hr`
  border: none;
  height: 1px;
  background: ${({ theme }) => theme.color.border.base};
  width: 100%;
  margin: 18px 0 0;
`;

const EvalProgressRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 14px;
`;

const EvalProgressCount = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.primary};
`;

const TeammateRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md}px;
  padding: 14px 0;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};

  &:last-of-type {
    border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
  }
`;

const TeammateInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TeammateNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TeammateName = styled.span`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const TeammateLane = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const TeammateKda = styled.span`
  display: block;
  margin-top: 3px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const OptionRow = styled.div`
  display: flex;
  gap: 6px;
`;

const OptionChip = styled.button<{ $selected: boolean }>`
  padding: 8px 13px;
  border-radius: 4px;
  cursor: pointer;
  font: ${({ theme, $selected }) => ($selected ? theme.font.small13b : theme.font.small13)};
  background: ${({ theme, $selected }) => ($selected ? theme.color.text.primary : 'transparent')};
  border: 1px solid ${({ theme, $selected }) => ($selected ? theme.color.text.primary : theme.color.border.base)};
  color: ${({ theme, $selected }) => ($selected ? '#121315' : theme.color.text.secondary)};
`;

const EvalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
  margin-top: 4px;
`;

const AnonymousHint = styled.span`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const EvalFooterActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.xs}px;
`;

export function MatchResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const matchId = Number(id);
  const { data: match } = useMatch(matchId);
  const { data: mmrChanges } = useMmrChanges(matchId);
  const { data: me } = useMe();
  const finishMatch = useFinishMatch(matchId);
  const duplicateTeams = useDuplicateMatchTeams(matchId, match?.groupId ?? 0);
  const submitEvaluation = useSubmitEvaluation(matchId);

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

  const handleDuplicateTeams = () => {
    duplicateTeams.mutate(undefined, { onSuccess: (next) => navigate(`/matches/${next.id}`) });
  };

  // 내전이 끝나면(수동 종료든 자동판정이든) 상세 화면에 들어와 있을 때 바로
  // 평가 모달이 뜨게 함 — "평가하기" 버튼을 따로 눌러야 했던 것 대신.
  const [evalOpen, setEvalOpen] = useState(false);
  const [ratings, setRatings] = useState<Record<number, RatingOption>>({});
  useEffect(() => {
    if (match?.status === 'FINISHED' && !alreadyRated) setEvalOpen(true);
  }, [match?.status, alreadyRated]);

  const myTeam = match?.participants?.find((p) => p.userId === me?.id)?.assignedTeam;
  const teammates = match?.participants && myTeam
    ? match.participants
        .filter((p) => p.assignedTeam === myTeam && p.userId !== me?.id)
        .map((p) => ({
          id: p.userId,
          name: p.nickname,
          profileImageUrl: p.profileImageUrl,
          lane: p.assignedPosition ?? '-',
          subtitle: `MMR 변동 ${p.mmrChange > 0 ? '+' : ''}${p.mmrChange}`,
        }))
    : [];
  const wonForEval = myTeam ? match?.winningTeam === myTeam : null;
  const completedCount = Object.keys(ratings).length;

  const handleSelectRating = (teammateId: number, option: RatingOption) => {
    setRatings((prev) => ({ ...prev, [teammateId]: option }));
  };

  const handleSubmitEvaluation = () => {
    Promise.all(
      Object.entries(ratings).map(([targetId, option]) =>
        submitEvaluation.mutateAsync({ targetId: Number(targetId), score: RATING_SCORE[option] }),
      ),
    ).then(() => setEvalOpen(false));
  };

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내전 결과</Title>
          <Subtitle>{match ? match.createdAt.slice(0, 16).replace('T', ' ') : '불러오는 중...'}</Subtitle>
        </div>
        {match?.status === 'FINISHED' && !alreadyRated && (
          <Button onClick={() => setEvalOpen(true)}>팀원 평가하기</Button>
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
        <FooterActions>
          {match?.status === 'FINISHED' && (
            <Button $variant="ghost" $size="sm" onClick={handleDuplicateTeams} disabled={duplicateTeams.isPending}>
              이 팀 그대로 다음 판 만들기
            </Button>
          )}
          {match && match.status !== 'WAITING' && (
            <Button $variant="ghost" $size="sm" onClick={() => navigate(`/matches/${id}/teams`)}>
              팀 구성 보기
            </Button>
          )}
        </FooterActions>
      </Footer>

      <Modal open={evalOpen} onClose={() => setEvalOpen(false)}>
        <EvalPanel>
          <EvalHeader>
            <EvalTitle>팀원 평가</EvalTitle>
            {wonForEval !== null && <EvalResultLabel $won={wonForEval}>{wonForEval ? '승리' : '패배'}</EvalResultLabel>}
          </EvalHeader>
          <EvalHint>평가는 다음 내전의 팀 밸런스와 그룹 티어에 반영돼요</EvalHint>
          <EvalDivider />
          <EvalProgressRow>
            <span>팀원 평가</span>
            <EvalProgressCount>{completedCount} / {teammates.length}명 완료</EvalProgressCount>
          </EvalProgressRow>

          {teammates.length === 0 && <EmptyState>평가할 팀원이 없어요</EmptyState>}
          {teammates.map((mate) => (
            <TeammateRow key={mate.id}>
              <TeammateInfo>
                <Avatar name={mate.name} imageUrl={resolveAssetUrl(mate.profileImageUrl)} size={30} />
                <div>
                  <TeammateNameRow>
                    <TeammateName>{mate.name}</TeammateName>
                    <TeammateLane>{mate.lane}</TeammateLane>
                  </TeammateNameRow>
                  <TeammateKda>{mate.subtitle}</TeammateKda>
                </div>
              </TeammateInfo>
              <OptionRow>
                {RATING_OPTIONS.map((option) => (
                  <OptionChip
                    key={option}
                    $selected={ratings[mate.id] === option}
                    onClick={() => handleSelectRating(mate.id, option)}
                  >
                    {option}
                  </OptionChip>
                ))}
              </OptionRow>
            </TeammateRow>
          ))}

          <EvalFooter>
            <AnonymousHint>평가는 익명으로 반영돼요</AnonymousHint>
            <EvalFooterActions>
              <Button $variant="ghost" $size="sm" onClick={() => setEvalOpen(false)}>나중에</Button>
              <Button
                $size="sm"
                onClick={handleSubmitEvaluation}
                disabled={submitEvaluation.isPending || completedCount === 0}
              >
                평가 제출
              </Button>
            </EvalFooterActions>
          </EvalFooter>
        </EvalPanel>
      </Modal>
    </PageLayout>
  );
}
