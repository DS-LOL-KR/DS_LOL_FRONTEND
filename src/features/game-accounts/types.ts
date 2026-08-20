export interface Game {
  id: number;
  name: string;
  code: string;
}

export interface GameAccountStats {
  id: number;
  gameAccountId: number;
  officialTier: string;
  internalMmr: number;
}

export interface GameAccount {
  id: number;
  gameId: number;
  game: Game;
  summonerName: string;
  stats: GameAccountStats;
  syncedAt: string;
}

export interface LinkGameAccountRequest {
  gameId: number;
  riotId: string;
}

export interface MatchHistoryEntry {
  id: string;
  playedAt: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
}

export interface ChampionStat {
  championName: string;
  games: number;
  wins: number;
  losses: number;
  kda: number;
}

export interface ChampionMastery {
  championName: string;
  masteryLevel: number;
  masteryPoints: number;
}
