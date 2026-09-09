export interface Game {
  id: number;
  name: string;
  code: string;
}

export interface GameAccountStats {
  id: number;
  gameAccountId: number;
  officialTier: string | null;
  internalMmr: number;
  mainPosition: string | null;
  subPosition: string | null;
  mannerScore: number;
  summonerLevel: number;
  profileIconId: number;
  updatedAt: string;
}

export interface GameAccount {
  id: number;
  userId: number;
  gameId: number;
  gameNickname: string;
  puuid: string;
  createdAt: string;
  game: Game;
  stats: GameAccountStats | null;
}

// POST /users/me/game-accounts' 201 response is the bare row — it doesn't embed
// `game`/`stats` the way GET /users/me/game-accounts does.
export type LinkedGameAccount = Omit<GameAccount, 'game' | 'stats'>;

export interface PositionStat {
  id: number;
  gameAccountId: number;
  position: string;
  positionMmr: number;
  gamesPlayed: number;
  winRate: number;
}

export interface GameAccountFullStats {
  stats: GameAccountStats | null;
  positionStats: PositionStat[];
}

export interface LinkGameAccountRequest {
  gameId: number;
  gameName: string;
  tagLine: string;
}

// 내전 팀 배정 쪽(assignedPosition 등)과 같은 내부 약어 — 라이엇 원본 값
// (TOP/JUNGLE/MIDDLE/BOTTOM/UTILITY, RiotPosition)과는 다름.
export type Position = 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';

export interface UpdatePreferredPositionRequest {
  // 명시적으로 null을 보내면 "직접 지정 해제 → 자동 추론(판수 1위 라인)으로 되돌리기".
  mainPosition?: Position | null;
  subPosition?: Position | null;
}

// Riot's own lane naming (from match-history sync), distinct from the
// TOP/JUG/MID/ADC/SUP used for custom-match team assignment.
export type RiotPosition = 'TOP' | 'JUNGLE' | 'MIDDLE' | 'BOTTOM' | 'UTILITY';

export interface MatchHistoryEntry {
  matchId: string;
  queueType: string;
  playedAt: string;
  durationSeconds: number;
  championId: number;
  // Resolved server-side from Data Dragon — null only if that lookup failed
  // (e.g. a brand-new champion Data Dragon hasn't caught up on yet).
  championName: string | null;
  position: RiotPosition;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  goldEarned: number;
  damageDealt: number;
  visionScore: number;
  win: boolean;
}

// winRate is a 0–1 float (not a percent), and scoped only to matches synced via
// POST .../match-history/sync — not the account's lifetime record.
export interface ChampionStat {
  championId: number;
  championName: string | null;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface ChampionMastery {
  championId: number;
  championName: string | null;
  masteryLevel: number;
  masteryPoints: number;
  lastPlayTime: string;
}

export interface SyncMatchHistoryRequest {
  count?: number;
}

export interface SyncMatchHistoryResult {
  syncedCount: number;
  skippedCount: number;
  positionStats: Pick<PositionStat, 'position' | 'gamesPlayed' | 'winRate'>[];
}
