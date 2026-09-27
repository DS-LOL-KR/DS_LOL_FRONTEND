import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader as Header, PageTitle as Title, PageSubtitle as Subtitle, HeaderActions } from '../components/layout/PageHeader';
import { Grid, Col } from '../components/layout/Grid';
import { Button } from '../components/Button/Button';
import { Card, SectionHeader } from '../components/Card/Card';
import { Avatar } from '../components/Avatar/Avatar';
import { Badge } from '../components/Badge/Badge';
import { Icon } from '../components/Icon/Icon';
import { Unit } from '../components/Kpi/Kpi';
import { LaneLabel } from '../components/LaneIcon/LaneIcon';
import { useCreateMatch } from '../features/matches/hooks';
import { useGroup } from '../features/groups/hooks';
import { useGames } from '../features/game-accounts/hooks';
import { useTierTable } from '../features/tiers/hooks';
import { setActiveGroupId } from '../utils/activeGroup';
import { resolveAssetUrl } from '../utils/assetUrl';
import { getGameDisplayName } from '../utils/gameDisplayName';
import type { Position } from '../features/tiers/types';

type Mode = '5v5' | '3v3' | 'custom';

const MODE_TARGET: Record<Mode, number | null> = { '5v5': 10, '3v3': 6, custom: null };

// On narrower layouts the summary + settings column goes first — the mode
// decides how many people to pick, so it reads before the roster.
const SideCol = styled(Col)`
  ${({ theme }) => theme.media.wide} {
    order: -1;
  }
`;

const Muted = styled.span`
  color: ${({ theme }) => theme.color.text.muted};
`;

// --- Summary card ---------------------------------------------------------

const CountRow = styled.p`
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
  font: ${({ theme }) => theme.type.metric};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: ${({ theme }) => theme.color.text.primary};
`;

const CountHint = styled.p<{ $match: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: var(--space-1);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme, $match }) => ($match ? theme.color.text.primary : theme.color.text.muted)};
`;

const StatList = styled.dl`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-4);
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-height: 40px;
  padding: 0 var(--space-3);
  background: ${({ theme }) => theme.color.surface.subtle};
  border-radius: ${({ theme }) => theme.radius.control}px;
`;

const StatLabel = styled.dt`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const StatValue = styled.dd`
  font: ${({ theme }) => theme.type.bodyStrong};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: ${({ theme }) => theme.color.text.primary};
`;

const Caption = styled.p`
  margin-top: var(--space-3);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

const ParticipantError = styled.p`
  margin-top: var(--space-3);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.state.danger};
`;

// --- Settings card --------------------------------------------------------

const FieldLabel = styled.p`
  margin-bottom: var(--space-2);
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Field = styled.div`
  & + & {
    margin-top: var(--space-5);
  }
`;

const GameRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const GameChip = styled.div<{ $active: boolean; $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: var(--control-height);
  padding: 0 var(--space-3);
  white-space: nowrap;
  border-radius: ${({ theme }) => theme.radius.control}px;
  font: ${({ theme, $active }) => ($active ? theme.type.labelStrong : theme.type.label)};
  background: ${({ theme, $active }) => ($active ? theme.color.surface.hover : theme.color.surface.subtle)};
  border: 1px ${({ $disabled }) => ($disabled ? 'dashed' : 'solid')}
    ${({ theme, $active }) => ($active ? theme.color.border.strong : theme.color.border.base)};
  color: ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.text.muted)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'default')};
`;

const GameSoon = styled.span`
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

// docs/design-system.md §3.11 — raised track, selected = hover step (no white fill).
const Segmented = styled.div`
  display: flex;
  gap: 2px;
  height: var(--control-height);
  padding: 2px;
  background: ${({ theme }) => theme.color.surface.subtle};
  border: 1px solid ${({ theme }) => theme.color.border.base};
  border-radius: ${({ theme }) => theme.radius.control}px;
`;

const SegmentButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0 var(--space-3);
  border: 0;
  border-radius: ${({ theme }) => theme.radius.badge}px;
  cursor: pointer;
  white-space: nowrap;
  font: ${({ theme, $active }) => ($active ? theme.type.labelStrong : theme.type.label)};
  color: ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.text.secondary)};
  background: ${({ theme, $active }) => ($active ? theme.color.surface.hover : 'transparent')};
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);

  &:hover {
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

const Notice = styled.p`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

// --- Participant picker ---------------------------------------------------

// Raised rows inside one card rather than a grid of boxed cards — a
// 12-person group shouldn't look like a product catalogue.
const MemberList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-2);

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

// Selected = hover step + strong border + check (never a white/blue fill).
const MemberCell = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  min-height: 56px;
  padding: 0 var(--space-3);
  border: 1px solid ${({ theme, $selected }) => ($selected ? theme.color.border.strong : 'transparent')};
  border-radius: ${({ theme }) => theme.radius.control}px;
  background: ${({ theme, $selected }) => ($selected ? theme.color.surface.hover : theme.color.surface.subtle)};
  cursor: pointer;
  text-align: left;
  transition:
    background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);

  &:hover {
    background: ${({ theme }) => theme.color.surface.hover};
  }
`;

const CheckMark = styled.span<{ $selected: boolean }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: ${({ theme }) => theme.radius.badge}px;
  border: 1px solid ${({ theme, $selected }) => ($selected ? theme.color.text.secondary : theme.color.border.strong)};
  color: ${({ theme }) => theme.color.text.primary};
`;

const MemberName = styled.span<{ $selected: boolean }>`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font: ${({ theme }) => theme.type.bodyStrong};
  color: ${({ theme, $selected }) => ($selected ? theme.color.text.primary : theme.color.text.secondary)};
`;

const MemberMeta = styled.span<{ $selected: boolean }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--space-2);
  opacity: ${({ $selected }) => ($selected ? 1 : 0.6)};
`;

// Full "TOP" label on wide rows, icon only on phones so nicknames keep room.
const LaneFull = styled.span`
  display: inline-flex;
  width: 44px;

  ${({ theme }) => theme.media.narrow} {
    display: none;
  }
`;

const LaneCompact = styled.span`
  display: none;

  ${({ theme }) => theme.media.narrow} {
    display: inline-flex;
  }
`;

const MemberMmr = styled.span`
  min-width: 44px;
  text-align: right;
  font: ${({ theme }) => theme.type.label};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.secondary};
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
  // MMR(internalMmr)도 라인 무관 계정 전체 값이라 같은 행에서 가져옴 — 티어표에
  // 행이 없으면(미연동/전적 없음) null로 두고 '—'로 표시.
  const memberInfoByUserId = new Map<
    number,
    { tier: 1 | 2 | 3 | 4 | 5 | null; lane: Position | null; mmr: number | null }
  >();
  for (const m of group?.members ?? []) {
    const rows = (tierTable?.tiers ?? []).filter((row) => row.userId === m.userId);
    const mainRow = rows.length
      ? rows.reduce((best, row) => (row.wins + row.losses > best.wins + best.losses ? row : best))
      : null;
    memberInfoByUserId.set(m.userId, {
      tier: mainRow?.tier ?? null,
      lane: mainRow?.position ?? null,
      mmr: mainRow?.internalMmr ?? null,
    });
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
  const countMatches = target !== null && selectedUserIds.size === target;

  const selectedMmrs = Array.from(selectedUserIds)
    .map((uid) => memberInfoByUserId.get(uid)?.mmr ?? null)
    .filter((v): v is number => v !== null);
  const avgSelectedMmr = selectedMmrs.length
    ? Math.round(selectedMmrs.reduce((sum, v) => sum + v, 0) / selectedMmrs.length)
    : null;
  const unknownMmrCount = selectedUserIds.size - selectedMmrs.length;

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
        <HeaderActions>
          <Button $variant="primary" onClick={handleCreate} disabled={createMatch.isPending}>
            AI로 팀 짜기
          </Button>
        </HeaderActions>
      </Header>

      <Grid>
        <Col $span={8}>
          <Card>
            <SectionHeader
              icon={<Icon name="groups" />}
              title="참여자"
              description="클릭해서 이번 판에 빠지는 그룹원을 뺄 수 있어요."
            />
            {group ? (
              <MemberList>
                {sortedMembers.map((m) => {
                  const info = memberInfoByUserId.get(m.userId);
                  const selected = selectedUserIds.has(m.userId);
                  return (
                    <MemberCell
                      key={m.userId}
                      type="button"
                      $selected={selected}
                      aria-pressed={selected}
                      onClick={() => toggleParticipant(m.userId)}
                    >
                      <CheckMark $selected={selected} aria-hidden="true">
                        {selected && <Icon name="check" size={14} />}
                      </CheckMark>
                      <Avatar name={m.user.nickname} imageUrl={resolveAssetUrl(m.user.profileImageUrl)} size={28} />
                      <MemberName $selected={selected}>{m.user.nickname}</MemberName>
                      <MemberMeta $selected={selected}>
                        {info?.lane ? (
                          <>
                            <LaneFull>
                              <LaneLabel lane={info.lane} />
                            </LaneFull>
                            <LaneCompact aria-label={info.lane}>
                              <LaneLabel lane={info.lane} iconOnly />
                            </LaneCompact>
                          </>
                        ) : (
                          <LaneFull>
                            <Muted>—</Muted>
                          </LaneFull>
                        )}
                        {info?.tier ? <Badge tier={info.tier} /> : <Badge>미확인</Badge>}
                        <MemberMmr>{info?.mmr != null ? info.mmr.toLocaleString() : <Muted>—</Muted>}</MemberMmr>
                      </MemberMeta>
                    </MemberCell>
                  );
                })}
              </MemberList>
            ) : (
              <Notice>그룹원 불러오는 중...</Notice>
            )}
          </Card>
        </Col>

        <SideCol $span={4}>
          <Card>
            <SectionHeader icon={<Icon name="stats" />} title="선택 요약" />
            <CountRow>
              {selectedUserIds.size.toLocaleString()}
              <Unit>{target !== null ? `/ ${target}명` : '명'}</Unit>
            </CountRow>
            <CountHint $match={countMatches}>
              {countMatches && <Icon name="check" size={14} />}
              {target !== null
                ? countMatches
                  ? `${mode} 인원이 맞아요`
                  : `${mode}는 ${target}명이 필요해요`
                : '2명 이상이면 팀을 짤 수 있어요'}
            </CountHint>
            <StatList>
              <StatRow>
                <StatLabel>평균 MMR</StatLabel>
                <StatValue>{avgSelectedMmr !== null ? avgSelectedMmr.toLocaleString() : <Muted>—</Muted>}</StatValue>
              </StatRow>
            </StatList>
            {unknownMmrCount > 0 && (
              <Caption>MMR을 확인할 수 없는 {unknownMmrCount}명은 평균에서 빠졌어요 (라이엇 계정 미연동·전적 없음)</Caption>
            )}
            {participantError && <ParticipantError role="alert">{participantError}</ParticipantError>}
          </Card>

          <Card>
            <SectionHeader icon={<Icon name="settings" />} title="내전 설정" />
            <Field>
              <FieldLabel>게임 종목</FieldLabel>
              <GameRow>
                {gameList.length === 0 ? (
                  <Notice>불러오는 중...</Notice>
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
                      {game.id === currentGame?.id && <Icon name="check" size={14} />}
                      {getGameDisplayName(game)}
                      {game.id !== currentGame?.id && game.code === 'VALORANT' && <GameSoon>준비 중</GameSoon>}
                    </GameChip>
                  ))
                )}
              </GameRow>
            </Field>
            <Field>
              <FieldLabel>인원</FieldLabel>
              <Segmented role="radiogroup" aria-label="인원">
                {(['5v5', '3v3', 'custom'] as Mode[]).map((m) => (
                  <SegmentButton
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={mode === m}
                    $active={mode === m}
                    onClick={() => setMode(m)}
                  >
                    {m === 'custom' ? '커스텀' : m}
                  </SegmentButton>
                ))}
              </Segmented>
            </Field>
            <Field>
              <FieldLabel>팀 구성 · 티어 기준</FieldLabel>
              <Notice>AI가 그룹 내부 티어를 기준으로 자동 배정해요 (다음 화면에서 팀을 직접 조정할 수 있어요)</Notice>
            </Field>
          </Card>
        </SideCol>
      </Grid>
    </PageLayout>
  );
}
