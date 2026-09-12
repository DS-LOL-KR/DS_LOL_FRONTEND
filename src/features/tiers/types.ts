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
  // "전체" 탭 전용 — 라이엇 전적이 아니라 이 그룹 내전(custom_matches) 결과 기준
  // 승/패. 라인별로 안 나뉘는 계정 전체 값이라 이 유저의 모든 라인 행에 동일하게
  // 들어감(internalMmr과 같은 성격).
  customMatchWins: number;
  customMatchLosses: number;
  // 유저가 프로필에서 직접 지정한 주라인(없으면 null) — 라인별로 안 나뉘는 계정
  // 전체 값이라 이 유저의 모든 라인 행에 동일하게 들어감.
  mainPosition: Position | null;
}

export interface TierTable {
  tiers: TierEntry[];
  // Most recent game_account stats update among the group's linked accounts —
  // null if nobody in the group has a linked account yet.
  lastUpdatedAt: string | null;
}
