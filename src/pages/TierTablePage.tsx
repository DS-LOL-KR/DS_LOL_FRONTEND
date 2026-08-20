import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { useRecalculateTiers, useTierTable } from '../features/tiers/hooks';
import type { Lane, TierEntry } from '../features/tiers/types';
import { asArrayOrFallback } from '../utils/asArrayOrFallback';
import { setActiveGroupId } from '../utils/activeGroup';

type Tier = 1 | 2 | 3 | 4 | 5;
const LANES: Lane[] = ['TOP', 'JGL', 'MID', 'BOT', 'SUP'];
const TIERS: Tier[] = [1, 2, 3, 4, 5];

// TODO: no backend yet — shown when GET /groups/:id/tiers returns nothing.
const MOCK_MEMBERS: TierEntry[] = [
  { userId: '1', nickname: '성현', lane: 'MID', tier: 1, wins: 12, losses: 4, mmr: 1990 },
  { userId: '2', nickname: '준서', lane: 'MID', tier: 1, wins: 15, losses: 6, mmr: 2015 },
  { userId: '3', nickname: '민석', lane: 'JGL', tier: 2, wins: 9, losses: 7, mmr: 1865 },
  { userId: '4', nickname: '지우', lane: 'BOT', tier: 2, wins: 11, losses: 5, mmr: 1902 },
  { userId: '5', nickname: '현우', lane: 'TOP', tier: 2, wins: 8, losses: 8, mmr: 1858 },
  { userId: '6', nickname: '하늘', lane: 'BOT', tier: 2, wins: 10, losses: 6, mmr: 1889 },
  { userId: '7', nickname: '재훈', lane: 'TOP', tier: 3, wins: 6, losses: 9, mmr: 1780 },
  { userId: '8', nickname: '도현', lane: 'JGL', tier: 3, wins: 5, losses: 10, mmr: 1702 },
  { userId: '9', nickname: '태윤', lane: 'SUP', tier: 3, wins: 4, losses: 8, mmr: 1673 },
  { userId: '10', nickname: '서진', lane: 'SUP', tier: 4, wins: 3, losses: 11, mmr: 1616 },
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

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.xs}px;
`;

const LaneTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.md}px;
  padding: ${({ theme }) => theme.space.md}px 0;
`;

const LaneTab = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font: ${({ theme, $active }) => ($active ? theme.font.small13b : theme.font.small13)};
  color: ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.text.secondary)};

  &::after {
    content: '';
    display: block;
    width: 28px;
    height: 2px;
    background: ${({ theme, $active }) => ($active ? theme.color.text.primary : 'transparent')};
  }
`;

const TierSection = styled.div`
  display: flex;
  align-items: flex-start;
  padding: ${({ theme }) => theme.space.md}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const TierLabel = styled.div<{ $tier: Tier }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 140px;
  flex-shrink: 0;

  &::before {
    content: '';
    width: 3px;
    height: 16px;
    background: ${({ theme, $tier }) => theme.color.tier[$tier]};
  }
`;

const TierName = styled.span<{ $tier: Tier }>`
  font: ${({ theme }) => theme.font.sub17};
  color: ${({ theme, $tier }) => theme.color.tier[$tier]};
`;

const TierCount = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const MemberList = styled.div`
  flex: 1;
  min-width: 0;
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md}px;
  padding: 7px 0;
`;

const LaneTag = styled.span`
  width: 46px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const MemberName = styled.span`
  flex: 1;
  min-width: 0;
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const Record = styled.span`
  width: 90px;
  text-align: right;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Mmr = styled.span`
  width: 60px;
  text-align: right;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`;

const EmptyLabel = styled.span`
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
`;

export function TierTablePage() {
  const { id: groupId } = useParams();
  const [lane, setLane] = useState<Lane | 'ALL'>('ALL');
  const { data: tierTable } = useTierTable(groupId ?? '', lane === 'ALL' ? undefined : lane);
  const recalculateTiers = useRecalculateTiers(groupId ?? '');

  useEffect(() => {
    if (groupId) setActiveGroupId(groupId);
  }, [groupId]);

  const allMembers = asArrayOrFallback<TierEntry>(tierTable, MOCK_MEMBERS);
  const filtered = useMemo(
    () => (lane === 'ALL' ? allMembers : allMembers.filter((m) => m.lane === lane)),
    [allMembers, lane],
  );

  const byTier = useMemo(() => {
    const groups = new Map<Tier, TierEntry[]>();
    for (const t of TIERS) groups.set(t, []);
    for (const m of filtered) groups.get(m.tier)?.push(m);
    return groups;
  }, [filtered]);

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>티어표</Title>
          <Subtitle>전적 · 그룹 티어 · 사용자 평가를 합산해 계산 · 2시간 전 갱신</Subtitle>
        </div>
        <HeaderActions>
          <Button $variant="ghost" $size="sm">라인별로 보기</Button>
          <Button $size="sm" onClick={() => recalculateTiers.mutate()} disabled={recalculateTiers.isPending}>
            티어 재선정
          </Button>
        </HeaderActions>
      </Header>
      <LaneTabs>
        <LaneTab $active={lane === 'ALL'} onClick={() => setLane('ALL')}>전체</LaneTab>
        {LANES.map((l) => (
          <LaneTab key={l} $active={lane === l} onClick={() => setLane(l)}>
            {l}
          </LaneTab>
        ))}
      </LaneTabs>

      {TIERS.map((tier) => {
        const members = byTier.get(tier) ?? [];
        return (
          <TierSection key={tier}>
            <TierLabel $tier={tier}>
              <TierName $tier={tier}>{tier}티어</TierName>
              <TierCount>{members.length}명</TierCount>
            </TierLabel>
            <MemberList>
              {members.length === 0 ? (
                <EmptyLabel>해당 티어 없음</EmptyLabel>
              ) : (
                members.map((m) => (
                  <MemberRow key={m.userId}>
                    <LaneTag>{m.lane}</LaneTag>
                    <MemberName>{m.nickname}</MemberName>
                    <Record>{m.wins}승 {m.losses}패</Record>
                    <Mmr>{m.mmr}</Mmr>
                  </MemberRow>
                ))
              )}
            </MemberList>
          </TierSection>
        );
      })}
    </PageLayout>
  );
}
