import type { Position } from '../tiers/types';

export type MatchStatus = 'WAITING' | 'MATCHED' | 'FINISHED';
export type Team = 'TEAM_A' | 'TEAM_B';

// Enriched server-side (matches.service.ts buildParticipantDetail) — nickname/
// tier/mmr/hasLinkedAccount/preferredPosition are computed on read, not stored
// columns. `tier` is the account's official Riot tier string (e.g. "PLATINUM III"
// or null if unranked/unlinked) — not the group's 1–5 tier bucket from
// GET /groups/:id/tiers, which is a different number entirely.
export interface TeamParticipant {
  id: number;
  matchId: number;
  userId: number;
  nickname: string;
  assignedTeam: Team;
  assignedPosition: Position | null;
  mmrChange: number;
  tier: string | null;
  mmr: number;
  hasLinkedAccount: boolean;
  preferredPosition: Position | null;
}

export interface TeamSummary {
  totalMmr: number;
  averageMmr: number;
  expectedWinRate: number; // 0–1 fraction, not a percent
}

// Recomputed from the current assignments on every read (not a stored snapshot),
// so a PATCH .../teams adjustment is reflected immediately on the next fetch.
// null while the match is still WAITING (no teams assigned yet).
export interface TeamAnalysis {
  teamA: TeamSummary;
  teamB: TeamSummary;
  balancePercent: number;
  reasoning: string[];
}

// GET /matches/:id, POST .../teams/generate, PATCH .../teams, and POST .../finish
// all return this same enriched shape (matches.service.ts buildMatchDetail).
// POST /groups/:id/matches (create) returns the bare row only — nothing's
// assigned yet — so participants/teamAnalysis stay optional.
export interface Match {
  id: number;
  groupId: number;
  gameId: number;
  createdBy: number;
  status: MatchStatus;
  winningTeam: Team | null;
  createdAt: string;
  participants?: TeamParticipant[];
  teamAnalysis?: TeamAnalysis | null;
}

export interface GenerateTeamsRequest {
  participantUserIds: number[];
}

// The request-side assignment shape — distinct from TeamParticipant since the
// body only carries what the client controls, not id/matchId/mmrChange/etc.
export interface TeamAssignmentInput {
  userId: number;
  assignedTeam: Team;
  assignedPosition?: Position;
}

export interface UpdateTeamsRequest {
  assignments: TeamAssignmentInput[];
}

export interface FinishMatchRequest {
  winningTeam: Team;
}

export interface SubmitEvaluationRequest {
  targetId: number;
  score: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}

export interface Evaluation {
  id: number;
  matchId: number;
  evaluatorId: number;
  targetId: number;
  score: number;
  comment: string | null;
  createdAt: string;
}

export interface MmrChange {
  userId: number;
  assignedTeam: Team;
  mmrChange: number;
}

export interface MmrHistoryEntry {
  matchId: number;
  groupId: number;
  mmrChange: number;
  playedAt: string;
}
