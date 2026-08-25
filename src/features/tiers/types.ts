// Position values for group tiers / custom-match team assignment (distinct from
// the Riot-native TOP/JUNGLE/MIDDLE/BOTTOM/UTILITY used in match-history sync).
export type Position = 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';

export interface TierEntry {
  userId: number;
  nickname: string;
  position: Position;
  officialTier: string | null;
  internalMmr: number;
  // TODO: the spec's own example response says "정확한 필드 구성은 구현 시 확정 필요" —
  // no 1-5 internal-tier bucket or win/loss record is actually documented yet.
  // These stay for the UI (grouping headers, record column) until the real
  // response lands.
  tier: 1 | 2 | 3 | 4 | 5;
  wins: number;
  losses: number;
}
