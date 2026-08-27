import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { Avatar } from '../components/Avatar/Avatar';
import { LaneIcon } from '../components/LaneIcon/LaneIcon';
import { WinRateBar } from '../components/WinRateBar/WinRateBar';
import { useRecalculateTiers, useTierTable } from '../features/tiers/hooks';
import type { Position, TierEntry } from '../features/tiers/types';
import { setActiveGroupId } from '../utils/activeGroup';
import { resolveAssetUrl } from '../utils/assetUrl';
import { formatRelativeTime } from '../utils/formatRelativeTime';

type Tier = 1 | 2 | 3 | 4 | 5;
const POSITIONS: Position[] = ['TOP', 'JUG', 'MID', 'ADC', 'SUP'];
const TIERS: Tier[] = [1, 2, 3, 4, 5];

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
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 0 6px;
  border-bottom: 2px solid ${({ theme, $active }) => ($active ? theme.color.text.primary : 'transparent')};
  font: ${({ theme, $active }) => ($active ? theme.font.small13b : theme.font.small13)};
  color: ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.text.secondary)};
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
  font-size: 15px;
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
  padding: 8px 0;
`;

const LaneBadge = styled.div`
  width: 26px;
  height: 26px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.text.secondary};
  background: ${({ theme }) => theme.color.surface.subtle};
`;

const NameButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
`;

const MemberName = styled.span`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};

  ${NameButton}:hover & {
    text-decoration: underline;
  }
`;

const RecordCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 130px;
  flex-shrink: 0;
`;

const RecordBar = styled(WinRateBar)`
  width: 90px;
`;

const WinRatePct = styled.span`
  width: 40px;
  text-align: right;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Mmr = styled.span`
  width: 60px;
  text-align: right;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 17px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`;

const EmptyLabel = styled.span`
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const NoticeLabel = styled.p`
  padding: ${({ theme }) => theme.space.lg}px 0;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  opacity: 0.7;
`;

export function TierTablePage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const groupIdNum = Number(groupId);
  const [position, setPosition] = useState<Position | 'ALL'>('ALL');
  const { data: tierTable, isError: tierTableError } = useTierTable(groupIdNum, position === 'ALL' ? undefined : position);
  const recalculateTiers = useRecalculateTiers(groupIdNum);

  useEffect(() => {
    if (groupId) setActiveGroupId(groupId);
  }, [groupId]);

  const allMembers = tierTable?.tiers ?? [];
  // '전체' 탭에서는 한 사람이 여러 라인으로 중복 등장하면 지저분하니, 라인별
  // position_mmr가 가장 높은 한 줄만 남김.
  const filtered = useMemo(() => {
    if (position !== 'ALL') return allMembers.filter((m) => m.position === position);
    const bestByUser = new Map<number, TierEntry>();
    for (const m of allMembers) {
      const current = bestByUser.get(m.userId);
      if (!current || m.positionMmr > current.positionMmr) bestByUser.set(m.userId, m);
    }
    return Array.from(bestByUser.values());
  }, [allMembers, position]);

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
          <Subtitle>전적 · 그룹 티어 · 사용자 평가를 합산해 계산 · {formatRelativeTime(tierTable?.lastUpdatedAt ?? null)}</Subtitle>
        </div>
        <HeaderActions>
          <Button $size="sm" onClick={() => recalculateTiers.mutate()} disabled={recalculateTiers.isPending}>
            티어 재선정
          </Button>
        </HeaderActions>
      </Header>
      <LaneTabs>
        <LaneTab $active={position === 'ALL'} onClick={() => setPosition('ALL')}>전체</LaneTab>
        {POSITIONS.map((p) => (
          <LaneTab key={p} $active={position === p} onClick={() => setPosition(p)}>
            <LaneIcon lane={p} size={13} />
            {p}
          </LaneTab>
        ))}
      </LaneTabs>

      {tierTableError ? (
        <NoticeLabel>이 그룹의 티어표를 볼 수 없어요 (멤버가 아니거나 그룹을 찾을 수 없어요)</NoticeLabel>
      ) : (
        TIERS.map((tier) => {
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
                members.map((m) => {
                  const total = m.wins + m.losses;
                  const winRate = total > 0 ? Math.round((m.wins / total) * 100) : 0;
                  return (
                    <MemberRow key={m.userId}>
                      <LaneBadge>
                        <LaneIcon lane={m.position} />
                      </LaneBadge>
                      <NameButton onClick={() => navigate(`/users/${m.userId}`)}>
                        <Avatar name={m.nickname} imageUrl={resolveAssetUrl(m.profileImageUrl)} size={22} />
                        <MemberName>{m.nickname}</MemberName>
                      </NameButton>
                      <RecordCell>
                        <RecordBar wins={m.wins} losses={m.losses} />
                        <WinRatePct>{winRate}%</WinRatePct>
                      </RecordCell>
                      <Mmr>{m.positionMmr}</Mmr>
                    </MemberRow>
                  );
                })
              )}
            </MemberList>
          </TierSection>
        );
        })
      )}
    </PageLayout>
  );
}
