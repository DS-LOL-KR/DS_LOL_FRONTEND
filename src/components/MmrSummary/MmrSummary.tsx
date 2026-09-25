import type { ReactNode } from 'react';
import styled from 'styled-components';

type Tier = 1 | 2 | 3 | 4 | 5;

// MMR is the number every other screen (티어표, 팀 구성) is built on, so it
// leads; the recent swing hangs off it, and the two tiers read as labelled
// tags on the right — they're categories, not quantities, so they don't get
// the same big-number treatment as MMR.
const Row = styled.section`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space.md}px 40px;
  padding: 28px 0 24px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const Primary = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 14px;
`;

const Mmr = styled.span`
  font-size: 56px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.primary};

  ${({ theme }) => theme.media.mobile} {
    font-size: 44px;
  }
`;

const MmrUnit = styled.span`
  font: ${({ theme }) => theme.font.small13b};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Delta = styled.span<{ $positive: boolean }>`
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${({ theme, $positive }) => ($positive ? theme.color.state.success : theme.color.state.danger)};

  small {
    margin-left: 6px;
    font: ${({ theme }) => theme.font.caption11};
    color: ${({ theme }) => theme.color.text.secondary};
  }
`;

const Tags = styled.dl`
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  gap: 8px 16px;
`;

const TagLabel = styled.dt`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const TagValue = styled.dd`
  display: flex;
  align-items: center;
  gap: 8px;
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const TierChip = styled.span<{ $tier: Tier }>`
  padding: 1px 10px;
  border-radius: 4px;
  font: ${({ theme }) => theme.font.small13b};
  color: #0B0D14;
  background: ${({ theme, $tier }) => theme.color.tier[$tier]};
`;

const Muted = styled.span`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

export interface MmrSummaryProps {
  mmr: number | null;
  delta?: { value: number; label: string } | null;
  groupTier?: { tier: Tier | null; groupName?: string; emptyLabel: string };
  officialTier: ReactNode;
}

export function MmrSummary({ mmr, delta, groupTier, officialTier }: MmrSummaryProps) {
  return (
    <Row aria-label="MMR 요약">
      <Primary>
        <Mmr>{mmr ?? '-'}</Mmr>
        <MmrUnit>MMR</MmrUnit>
        {delta && (
          <Delta $positive={delta.value >= 0}>
            {delta.value > 0 ? `+${delta.value}` : delta.value}
            <small>{delta.label}</small>
          </Delta>
        )}
      </Primary>
      <Tags>
        {groupTier && (
          <>
            <TagLabel>그룹 내부 티어</TagLabel>
            <TagValue>
              {groupTier.tier ? (
                <>
                  <TierChip $tier={groupTier.tier}>{groupTier.tier}티어</TierChip>
                  {groupTier.groupName && <Muted>{groupTier.groupName}</Muted>}
                </>
              ) : (
                <Muted>{groupTier.emptyLabel}</Muted>
              )}
            </TagValue>
          </>
        )}
        <TagLabel>게임 공식 티어</TagLabel>
        <TagValue>{officialTier}</TagValue>
      </Tags>
    </Row>
  );
}
