import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { useCreateMatch } from '../features/matches/hooks';
import { useGroup } from '../features/groups/hooks';
import { useGames } from '../features/game-accounts/hooks';
import { useTierTable } from '../features/tiers/hooks';
import { setActiveGroupId } from '../utils/activeGroup';
import { getGameDisplayName } from '../utils/gameDisplayName';

type Mode = '5v5' | '3v3' | 'custom';

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

const GameChip = styled.div<{ $active: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 168px;
  height: 38px;
  padding: 0 12px;
  border-radius: 5px;
  font: ${({ theme, $active }) => ($active ? theme.font.body14b : theme.font.body14)};
  background: ${({ theme, $active }) => ($active ? theme.color.surface.subtle : 'transparent')};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.color.text.secondary : theme.color.border.base)};
  color: ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.text.secondary)};
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'default')};
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

const MemberList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.space.sm}px;
`;

const MemberCell = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex: 1 0 76px;
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

const MemberName = styled.span`
  font: ${({ theme }) => theme.font.label12m};
  color: ${({ theme }) => theme.color.text.primary};
`;

const MemberLane = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const MemberTier = styled.span<{ $tier: 1 | 2 | 3 | 4 | 5 | null }>`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme, $tier }) => ($tier ? theme.color.tier[$tier] : theme.color.text.secondary)};
`;

const ParticipantError = styled.p`
  margin-top: ${({ theme }) => theme.space.xs}px;
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.state.danger};
`;

export function MatchCreatePage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const createMatch = useCreateMatch(Number(groupId));
  const { data: group, isError: groupError } = useGroup(Number(groupId));
  const { data: games } = useGames();
  const { data: tierTable } = useTierTable(Number(groupId));

  const gameList = games ?? [];
  const currentGame = gameList.find((g) => g.id === group?.gameId) ?? null;

  // 이 페이지가 그동안 티어 데이터를 아예 안 불러오고 있어서(useGroup만 씀)
  // 참여자 칩에 티어가 안 보였던 문제 수정(2026-09-13 문의). "전체" 등급은
  // 라인 무관 계정 전체 값이라 그 유저의 아무 행에서나 가져와도 동일함. 주
  // 라인은 GroupManagePage와 동일하게 판수(승+패)가 가장 많은 라인 행을 씀.
  const memberInfoByUserId = new Map<number, { tier: 1 | 2 | 3 | 4 | 5 | null; lane: string | null }>();
  for (const m of group?.members ?? []) {
    const rows = (tierTable?.tiers ?? []).filter((row) => row.userId === m.userId);
    const mainRow = rows.length
      ? rows.reduce((best, row) => (row.wins + row.losses > best.wins + best.losses ? row : best))
      : null;
    memberInfoByUserId.set(m.userId, { tier: mainRow?.tier ?? null, lane: mainRow?.position ?? null });
  }

  // 티어 순(1티어 먼저)으로 보여줌 — 미확인(연동 안 됐거나 전적 없음)은 맨 뒤.
  const sortedMembers = [...(group?.members ?? [])].sort((a, b) => {
    const tierA = memberInfoByUserId.get(a.userId)?.tier ?? 6;
    const tierB = memberInfoByUserId.get(b.userId)?.tier ?? 6;
    return tierA - tierB;
  });

  const [mode, setMode] = useState<Mode>('5v5');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [participantError, setParticipantError] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) setActiveGroupId(groupId);
  }, [groupId]);

  // Default to everyone in (most matches use the whole group), but let members
  // be unchecked for a round they're sitting out.
  useEffect(() => {
    if (group) setSelectedUserIds(new Set(group.members.map((m) => m.userId)));
  }, [group]);

  const target = MODE_TARGET[mode];

  const toggleParticipant = (userId: number) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  // POST /groups/:id/matches takes no body — the group's game is already fixed.
  // The actual participant list is only needed by /matches/:id/teams/generate,
  // so the selection made here is carried over via router state for
  // TeamFormationPage to use on its first generate call.
  const handleCreate = () => {
    if (!groupId) return;
    if (target !== null && selectedUserIds.size !== target) {
      setParticipantError(`${mode}는 참여자를 정확히 ${target}명 선택해주세요`);
      return;
    }
    if (target === null && selectedUserIds.size < 2) {
      setParticipantError('참여자를 2명 이상 선택해주세요');
      return;
    }
    setParticipantError(null);
    createMatch.mutate(undefined, {
      onSuccess: (match) =>
        navigate(`/matches/${match.id}/teams`, {
          state: { participantUserIds: Array.from(selectedUserIds) },
        }),
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
            // 그룹의 게임 종목은 생성 시 이미 고정돼있어 여기서 바꿀 수 없음 — 다른
            // 게임(예: 발로란트)도 존재한다는 걸 보여주되 클릭은 안 되게 흐리게 표시.
            gameList.map((game) => (
              <GameChip key={game.id} $active={game.id === currentGame?.id} $disabled={game.id !== currentGame?.id}>
                {getGameDisplayName(game)}
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
            <OptionLabel>팀 구성 · 티어 기준</OptionLabel>
            <NoticeLabel style={{ marginTop: 0 }}>
              AI가 그룹 내부 티어를 기준으로 자동 배정해요 (다음 화면에서 팀을 직접 조정할 수 있어요)
            </NoticeLabel>
          </OptionGroup>
        </OptionGroups>
      </Section>

      <Section>
        <SectionLabel>참여자</SectionLabel>
        <div style={{ flex: 1 }}>
          <ParticipantSummary>
            <ParticipantHint $match={target !== null && selectedUserIds.size === target}>
              {selectedUserIds.size}명 선택됨{target !== null ? ` · ${mode}는 ${target}명이 필요해요` : ''}
            </ParticipantHint>
          </ParticipantSummary>
          {group ? (
            <>
              <MemberList>
                {sortedMembers.map((m) => {
                  const info = memberInfoByUserId.get(m.userId);
                  return (
                    <MemberCell
                      key={m.userId}
                      type="button"
                      $selected={selectedUserIds.has(m.userId)}
                      onClick={() => toggleParticipant(m.userId)}
                    >
                      <MemberName>{m.user.nickname}</MemberName>
                      <MemberLane>{info?.lane ?? '-'}</MemberLane>
                      <MemberTier $tier={info?.tier ?? null}>{info?.tier ? `${info.tier}티어` : '미확인'}</MemberTier>
                    </MemberCell>
                  );
                })}
              </MemberList>
              <NoticeLabel>클릭해서 이번 판에 빠지는 그룹원을 뺄 수 있어요.</NoticeLabel>
              {participantError && <ParticipantError>{participantError}</ParticipantError>}
            </>
          ) : (
            <NoticeLabel>그룹원 불러오는 중...</NoticeLabel>
          )}
        </div>
      </Section>
    </PageLayout>
  );
}
