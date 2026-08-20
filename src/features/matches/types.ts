import type { Lane } from '../tiers/types';

export type MatchStatus = 'pending' | 'teams_generated' | 'in_progress' | 'finished';
export type Mode = '5v5' | '3v3' | 'custom';
export type Team = 'A' | 'B';

export interface Match {
  id: string;
  groupId: string;
  gameId: number;
  mode: Mode;
  status: MatchStatus;
  playedAt: string;
}

export interface CreateMatchRequest {
  gameId: number;
  mode: Mode;
  participantUserIds: string[];
  teamAssignment: 'ai' | 'manual';
  tierBasis: 'internal' | 'official';
}

export interface TeamPlayer {
  userId: string;
  nickname: string;
  lane: Lane;
  tier: 1 | 2 | 3 | 4 | 5;
  mmr: number;
  recentMmrDelta: number;
  team: Team;
}

export interface RationaleItem {
  label: string;
  detail: string;
  value: string;
}

export interface MatchTeams {
  matchId: string;
  players: TeamPlayer[];
  balanceScore: number;
  expectedWinRate: { teamA: number; teamB: number };
  rationale: RationaleItem[];
}

export interface UpdateTeamsRequest {
  players: { userId: string; team: Team }[];
}

export interface FinishMatchRequest {
  winningTeam: Team;
}

export interface MatchDetail extends Match {
  winningTeam?: Team;
  teams?: MatchTeams;
}

export interface SubmitEvaluationRequest {
  targetUserId: string;
  score: number;
}

export interface MmrChange {
  userId: string;
  delta: number;
  reason: string;
}

export interface MmrHistoryEntry {
  matchId: string;
  playedAt: string;
  delta: number;
  reason: string;
  mmrAfter: number;
}
