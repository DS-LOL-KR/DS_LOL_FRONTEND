import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader as Header, PageTitle as Title, PageSubtitle as Subtitle } from '../components/layout/PageHeader';
import { Button } from '../components/Button/Button';
import { LaneIcon } from '../components/LaneIcon/LaneIcon';
import { useCreateMatch } from '../features/matches/hooks';
import { useGroup } from '../features/groups/hooks';
import { useGames } from '../features/game-accounts/hooks';
import { useTierTable } from '../features/tiers/hooks';
import { setActiveGroupId } from '../utils/activeGroup';
import { getGameDisplayName } from '../utils/gameDisplayName';
import type { Position } from '../features/tiers/types';

type Mode = '5v5' | '3v3' | 'custom';

const MODE_TARGET: Record<Mode, number | null> = { '5v5': 10, '3v3': 6, custom: null };

const Section = styled.div`
  display: flex;
  align-items: flex-start;
  padding: ${({ theme }) => theme.space.lg}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    gap: ${({ theme }) => theme.space.sm}px;
  }
`;

const SectionLabel = styled.p`
  width: 140px;
  flex-shrink: 0;
  padding-top: 8px;
  font: ${({ theme }) => theme.font.label12m};
  color: ${({ theme }) => theme.color.text.secondary};

  ${({ theme }) => theme.media.mobile} {
    padding-top: 0;
  }
`;

const SectionBody = styled.div`
  flex: 1;
  min-width: 0;
  width: 100%;
`;

const GameRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.xs}px;
  flex: 1;
`;

const GameChip = styled.div<{ $active: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  height: 40px;
  padding: 0 14px;
  white-space: nowrap;
  border-radius: 5px;
  font: ${({ theme, $active }) => ($active ? theme.font.body14b : theme.font.body14)};
  background: ${({ theme, $active }) => ($active ? theme.color.surface.subtle : 'transparent')};
  border: 1px ${({ $disabled }) => ($disabled ? 'dashed' : 'solid')}
    ${({ theme, $active }) => ($active ? theme.color.text.secondary : theme.color.border.strong)};
  color: ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.text.secondary)};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'default')};
`;

const OptionGroups = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.lg}px ${({ theme }) => theme.space.xl}px;
  flex: 1;
`;

const GameSoon = styled.span`
  margin-left: 6px;
  font: ${({ theme }) => theme.font.caption11};
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
  min-height: 40px;
  padding: 0 14px;
  border-radius: 4px;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
  cursor: pointer;
  white-space: nowrap;
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

// A roster checklist in the same hairline-row vocabulary as the tier table —
// the previous grid of twelve identical boxed cards was a template pattern and
// made a 12-person group look like a product catalogue.
const MemberList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  column-gap: 32px;
  margin-top: ${({ theme }) => theme.space.sm}px;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
`;

const MemberCell = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 52px;
  padding: 0 4px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
  background: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.color.surface.row};
  }
`;

const CheckMark = styled.span<{ $selected: boolean }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1.5px solid ${({ theme, $selected }) => ($selected ? theme.color.text.primary : theme.color.border.strong)};
  background: ${({ theme, $selected }) => ($selected ? theme.color.text.primary : 'transparent')};
  color: #121315;
  transition:
    background 0.12s ease,
    border-color 0.12s ease;
`;

const MemberName = styled.span<{ $selected: boolean }>`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme, $selected }) => ($selected ? theme.color.text.primary : theme.color.text.secondary)};
  transition: color 0.12s ease;
`;

const MemberMeta = styled.span<{ $selected: boolean }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
  font: ${({ theme }) => theme.font.caption11m};
  opacity: ${({ $selected }) => ($selected ? 1 : 0.5)};
`;

const MemberLane = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 52px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const MemberTier = styled.span<{ $tier: 1 | 2 | 3 | 4 | 5 | null }>`
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
  const memberInfoByUserId = new Map<number, { tier: 1 | 2 | 3 | 4 | 5 | null; lane: Position | null }>();
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
              <GameChip
                key={game.id}
                $active={game.id === currentGame?.id}
                $disabled={game.id !== currentGame?.id}
                aria-disabled={game.id !== currentGame?.id}
              >
                {getGameDisplayName(game)}
                {game.id !== currentGame?.id && game.code === 'VALORANT' && <GameSoon>준비 중</GameSoon>}
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
                <Chip key={m} type="button" aria-pressed={mode === m} $active={mode === m} onClick={() => setMode(m)}>
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
        <SectionBody>
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
                      aria-pressed={selectedUserIds.has(m.userId)}
                      onClick={() => toggleParticipant(m.userId)}
                    >
                      <CheckMark $selected={selectedUserIds.has(m.userId)} aria-hidden="true">
                        {selectedUserIds.has(m.userId) && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </CheckMark>
                      <MemberName $selected={selectedUserIds.has(m.userId)}>{m.user.nickname}</MemberName>
                      <MemberMeta $selected={selectedUserIds.has(m.userId)}>
                        <MemberTier $tier={info?.tier ?? null}>{info?.tier ? `${info.tier}티어` : '미확인'}</MemberTier>
                        <MemberLane>
                          {info?.lane && <LaneIcon lane={info.lane} size={13} />}
                          {info?.lane ?? '-'}
                        </MemberLane>
                      </MemberMeta>
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
        </SectionBody>
      </Section>
    </PageLayout>
  );
}
