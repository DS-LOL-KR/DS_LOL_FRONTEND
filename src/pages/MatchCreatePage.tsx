import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { useCreateMatch } from '../features/matches/hooks';
import { useGroup } from '../features/groups/hooks';
import type { GroupMember } from '../features/groups/types';
import { useGames } from '../features/game-accounts/hooks';
import type { Game } from '../features/game-accounts/types';
import { setActiveGroupId } from '../utils/activeGroup';
import { asArrayOrFallback } from '../utils/asArrayOrFallback';

type Lane = 'TOP' | 'JGL' | 'MID' | 'BOT' | 'SUP';
type Mode = '5v5' | '3v3' | 'custom';
type TeamMode = 'ai' | 'manual';
type TierBasis = 'internal' | 'official';

interface Participant {
  id: string;
  name: string;
  lane: Lane;
  tier: 1 | 2 | 3 | 4 | 5;
}

// TODO: no backend yet — shown when GET /games or the group roster is unavailable.
const MOCK_GAMES: Game[] = [
  { id: 1, name: '리그 오브 레전드', code: 'LOL' },
  { id: 2, name: '발로란트', code: 'VALORANT' },
  { id: 3, name: '오버워치 2', code: 'OW2' },
];

const MODE_TARGET: Record<Mode, number | null> = { '5v5': 10, '3v3': 6, custom: null };

// TODO: no backend yet — shown when GET /groups/:id returns no roster.
const MOCK_PARTICIPANTS: Participant[] = [
  { id: '1', name: '재현', lane: 'MID', tier: 1 },
  { id: '2', name: '성현', lane: 'MID', tier: 1 },
  { id: '3', name: '민석', lane: 'JGL', tier: 2 },
  { id: '4', name: '지우', lane: 'BOT', tier: 2 },
  { id: '5', name: '태윤', lane: 'SUP', tier: 3 },
  { id: '6', name: '현우', lane: 'TOP', tier: 2 },
  { id: '7', name: '도현', lane: 'JGL', tier: 3 },
  { id: '8', name: '준서', lane: 'MID', tier: 1 },
  { id: '9', name: '하늘', lane: 'BOT', tier: 2 },
  { id: '10', name: '서진', lane: 'SUP', tier: 4 },
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

const ParticipantCount = styled.span`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const ParticipantHint = styled.span<{ $match: boolean }>`
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme, $match }) => ($match ? theme.color.state.success : theme.color.text.secondary)};
`;

const ParticipantGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-top: ${({ theme }) => theme.space.sm}px;
`;

const ParticipantTile = styled.button<{ $selected: boolean }>`
  flex: 1;
  min-width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 12px 8px;
  border: none;
  border-left: 1px solid ${({ theme }) => theme.color.border.base};
  background: none;
  cursor: pointer;
  opacity: ${({ $selected }) => ($selected ? 1 : 0.4)};

  &:first-child {
    border-left: none;
  }
`;

const ParticipantName = styled.span`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const ParticipantLane = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ParticipantTier = styled.span<{ $tier: 1 | 2 | 3 | 4 | 5 }>`
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme, $tier }) => theme.color.tier[$tier]};
`;

export function MatchCreatePage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const createMatch = useCreateMatch(groupId ?? '');
  const { data: group } = useGroup(groupId ?? '');
  const { data: games } = useGames();

  const gameList = asArrayOrFallback(games, MOCK_GAMES);
  const groupMembers = asArrayOrFallback<GroupMember>(group?.members, []);
  const participants: Participant[] = groupMembers.length
    ? groupMembers.map((m) => ({
        id: m.userId,
        name: m.nickname,
        lane: m.mainLane,
        tier: m.internalTier,
      }))
    : MOCK_PARTICIPANTS;

  const [gameId, setGameId] = useState(gameList[0]?.id ?? 1);
  const [mode, setMode] = useState<Mode>('5v5');
  const [teamMode, setTeamMode] = useState<TeamMode>('ai');
  const [tierBasis, setTierBasis] = useState<TierBasis>('internal');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected(new Set(participants.map((p) => p.id)));
    // Only seed selection once the real roster arrives — participants' identity
    // changes whenever `group` refetches, which would otherwise reset picks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.members]);

  useEffect(() => {
    if (groupId) setActiveGroupId(groupId);
  }, [groupId]);

  const target = MODE_TARGET[mode];
  const matchesTarget = target !== null && selected.size === target;

  const toggle = (participantId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(participantId)) next.delete(participantId);
      else next.add(participantId);
      return next;
    });
  };

  const handleCreate = () => {
    if (!groupId) return;
    createMatch.mutate(
      {
        gameId,
        mode,
        participantUserIds: Array.from(selected),
        teamAssignment: teamMode,
        tierBasis,
      },
      { onSuccess: (match) => navigate(`/matches/${match.id}/teams`) },
    );
  };

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>새 내전</Title>
          <Subtitle>{group?.name ?? '새벽 내전방'}</Subtitle>
        </div>
        <Button onClick={handleCreate} disabled={createMatch.isPending}>AI로 팀 짜기</Button>
      </Header>

      <Section>
        <SectionLabel>게임 종목</SectionLabel>
        <GameRow>
          {gameList.map((g) => (
            <GameChip key={g.id} $active={gameId === g.id} onClick={() => setGameId(g.id)}>
              {g.name}
            </GameChip>
          ))}
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
            <ParticipantCount>{selected.size}명 선택됨</ParticipantCount>
            {target !== null && (
              <ParticipantHint $match={matchesTarget}>
                {matchesTarget ? `${mode}에 정확히 맞습니다` : `${mode}는 ${target}명이 필요해요`}
              </ParticipantHint>
            )}
          </ParticipantSummary>
          <ParticipantGrid>
            {participants.map((p) => (
              <ParticipantTile key={p.id} $selected={selected.has(p.id)} onClick={() => toggle(p.id)}>
                <ParticipantName>{p.name}</ParticipantName>
                <ParticipantLane>{p.lane}</ParticipantLane>
                <ParticipantTier $tier={p.tier}>{p.tier}티어</ParticipantTier>
              </ParticipantTile>
            ))}
          </ParticipantGrid>
        </div>
      </Section>
    </PageLayout>
  );
}
