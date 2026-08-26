// Position values for group tiers / custom-match team assignment (distinct from
// the Riot-native TOP/JUNGLE/MIDDLE/BOTTOM/UTILITY used in match-history sync).
export type Position = 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';

export interface TierEntry {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  position: Position;
  officialTier: string | null;
  internalMmr: number;
  positionMmr: number;
  // 그룹 내 internal_mmr 순위를 상위 20%씩 5구간으로 나눈 값 (1이 최상위).
  // 라인 탭을 바꿔도 그룹 전체 순위 기준이라 같은 사람은 항상 같은 티어.
  tier: 1 | 2 | 3 | 4 | 5;
  wins: number;
  losses: number;
}
