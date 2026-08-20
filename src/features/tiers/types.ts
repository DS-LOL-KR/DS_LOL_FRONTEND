export interface TierEntry {
  userId: string;
  nickname: string;
  tier: 1 | 2 | 3 | 4 | 5;
}

export interface UpdateTierRequest {
  userId: string;
  tier: 1 | 2 | 3 | 4 | 5;
}
