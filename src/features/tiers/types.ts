export type Lane = 'TOP' | 'JGL' | 'MID' | 'BOT' | 'SUP';

export interface TierEntry {
  userId: string;
  nickname: string;
  lane: Lane;
  tier: 1 | 2 | 3 | 4 | 5;
  wins: number;
  losses: number;
  mmr: number;
}
