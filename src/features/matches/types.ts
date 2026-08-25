import type { Position } from '../tiers/types';

export type MatchStatus = 'WAITING' | 'MATCHED' | 'FINISHED';
export type Team = 'TEAM_A' | 'TEAM_B';

// The full participant row (custom_match_participants) — returned embedded in
// Match (GET) and as the array in MatchTeamsResult/FinishMatchResult. id/matchId
// aren't guaranteed on every response variant (the finish-match example omits
// them), so they stay optional rather than assumed present.
export interface TeamParticipant {
  id?: number;
  matchId?: number;
  userId: number;
  assignedTeam: Team;
  assignedPosition?: Position | null;
  mmrChange: number;
}

export interface Match {
  id: number;
  groupId: number;
  gameId: number;
  createdBy: number;
  status: MatchStatus;
  winningTeam: Team | null;
  createdAt: string;
  // GET /matches/:id and GET /groups/:id/matches embed this; POST (create)
  // doesn't return it since nothing's assigned yet.
  participants?: TeamParticipant[];
}

// POST .../teams/generate and PATCH .../teams both return this narrower shape,
// not the full Match.
export interface MatchTeamsResult {
  id: number;
  status: MatchStatus;
  participants: TeamParticipant[];
}

// POST .../finish returns this — also narrower than Match (no groupId/gameId/
// createdBy/createdAt), but winningTeam is guaranteed non-null once FINISHED.
export interface FinishMatchResult {
  id: number;
  status: MatchStatus;
  winningTeam: Team;
  participants: TeamParticipant[];
}

export interface GenerateTeamsRequest {
  participantUserIds: number[];
}

// The request-side assignment shape — distinct from TeamParticipant since the
// body only carries what the client controls, not id/matchId/mmrChange.
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
  // Added to user_evaluations on 2026-08-23 specifically to support this
  // endpoint's duplicate-prevention and per-match manner-score recalculation.
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
