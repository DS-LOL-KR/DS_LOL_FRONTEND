import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { useCreateMatch } from '../features/matches/hooks';
import { useGroup } from '../features/groups/hooks';
import { useGames } from '../features/game-accounts/hooks';
import { setActiveGroupId } from '../utils/activeGroup';

type Mode = '5v5' | '3v3' | 'custom';
type TeamMode = 'ai' | 'manual';
type TierBasis = 'internal' | 'official';

const MODE_TARGET: Record<Mode, number | null> = { '5v5': 10, '3v3': 6, custom: null };

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

const Section = styled.div`
  display: flex;
  align-items: flex-start;
  padding: ${({ theme }) => theme.space.lg}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const SectionLabel = styled.p`
  width: 140px;
  flex-shrink: 0;
  font: ${({ theme }) => theme.font.label12m};
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const GameRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.xs}px;
  flex: 1;
`;

const GameChip = styled.button<{ $active: boolean }>`
  width: 140px;
  height: 38px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  cursor: pointer;
  font: ${({ theme, $active }) => ($active ? theme.font.body14b : theme.font.body14)};
  background: ${({ theme, $active }) => ($active ? theme.color.surface.subtle : 'transparent')};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.color.text.secondary : theme.color.border.base)};
  color: ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.text.secondary)};
`;

const OptionGroups = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.xl}px;
  flex: 1;
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs}px;
`;

const OptionLabel = styled.span`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ChipRow = styled.div`
  display: flex;
  gap: 6px;
`;

const Chip = styled.button<{ $active: boolean }>`
  padding: 7px 12px;
  border-radius: 4px;
  cursor: pointer;
  font: ${({ theme, $active }) => ($active ? theme.font.small13b : theme.font.small13)};
  background: ${({ theme, $active }) => ($active ? theme.color.text.primary : 'transparent')};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.border.base)};
  color: ${({ theme, $active }) => ($active ? '#121315' : theme.color.text.secondary)};
`;

const ParticipantSummary = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs}px;
`;

const ParticipantHint = styled.span<{ $match: boolean }>`
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme, $match }) => ($match ? theme.color.state.success : theme.color.text.secondary)};
`;

const NoticeLabel = styled.p`
  margin-top: ${({ theme }) => theme.space.sm}px;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  opacity: 0.7;
`;

export function MatchCreatePage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const createMatch = useCreateMatch(Number(groupId));
  const { data: group, isError: groupError } = useGroup(Number(groupId));
  const { data: games } = useGames();

  const gameList = games ?? [];

  const [gameId, setGameId] = useState<number | undefined>(gameList[0]?.id);
  const [mode, setMode] = useState<Mode>('5v5');
  const [teamMode, setTeamMode] = useState<TeamMode>('ai');
  const [tierBasis, setTierBasis] = useState<TierBasis>('internal');

  useEffect(() => {
    if (groupId) setActiveGroupId(groupId);
  }, [groupId]);

  useEffect(() => {
    if (gameId === undefined && gameList[0]) setGameId(gameList[0].id);
    // Only seed once the real game list arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games]);

  const target = MODE_TARGET[mode];

  // POST /groups/:id/matches takes no body — the group's game is already fixed
  // and team assignment happens afterwards via /matches/:id/teams/generate.
  // gameId/mode/teamMode/tierBasis stay local until the backend grows fields for
  // them. There's no "그룹원 목록" endpoint yet, so participants can't be picked
  // here — /matches/:id/teams falls back to its own roster.
  const handleCreate = () => {
    if (!groupId) return;
    createMatch.mutate(undefined, {
      onSuccess: (match) => navigate(`/matches/${match.id}/teams`),
    });
  };

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>새 내전</Title>
          <Subtitle>{group?.name ?? (groupError ? '그룹 정보를 불러올 수 없어요' : '불러오는 중...')}</Subtitle>
        </div>
        <Button onClick={handleCreate} disabled={createMatch.isPending}>AI로 팀 짜기</Button>
      </Header>

      <Section>
        <SectionLabel>게임 종목</SectionLabel>
        <GameRow>
          {gameList.length === 0 ? (
            <NoticeLabel>불러오는 중...</NoticeLabel>
          ) : (
            gameList.map((g) => (
              <GameChip key={g.id} $active={gameId === g.id} onClick={() => setGameId(g.id)}>
                {g.name}
              </GameChip>
            ))
          )}
        </GameRow>
      </Section>

      <Section>
        <SectionLabel>모드</SectionLabel>
        <OptionGroups>
          <OptionGroup>
            <OptionLabel>인원</OptionLabel>
            <ChipRow>
              {(['5v5', '3v3', 'custom'] as Mode[]).map((m) => (
                <Chip key={m} $active={mode === m} onClick={() => setMode(m)}>
                  {m === 'custom' ? '커스텀' : m}
                </Chip>
              ))}
            </ChipRow>
          </OptionGroup>
          <OptionGroup>
            <OptionLabel>팀 구성</OptionLabel>
            <ChipRow>
              <Chip $active={teamMode === 'ai'} onClick={() => setTeamMode('ai')}>AI 자동</Chip>
              <Chip $active={teamMode === 'manual'} onClick={() => setTeamMode('manual')}>직접 배정</Chip>
            </ChipRow>
          </OptionGroup>
          <OptionGroup>
            <OptionLabel>티어 기준</OptionLabel>
            <ChipRow>
              <Chip $active={tierBasis === 'internal'} onClick={() => setTierBasis('internal')}>그룹 내부 티어</Chip>
              <Chip $active={tierBasis === 'official'} onClick={() => setTierBasis('official')}>게임 공식 티어</Chip>
            </ChipRow>
          </OptionGroup>
        </OptionGroups>
      </Section>

      <Section>
        <SectionLabel>참여자</SectionLabel>
        <div style={{ flex: 1 }}>
          <ParticipantSummary>
            {target !== null && <ParticipantHint $match={false}>{mode}는 {target}명이 필요해요</ParticipantHint>}
          </ParticipantSummary>
          <NoticeLabel>
            그룹원 목록 기능이 아직 없어서 참여자를 직접 고를 수 없어요. 팀 구성 화면에서 전체 인원으로 배정돼요.
          </NoticeLabel>
        </div>
      </Section>
    </PageLayout>
  );
}
