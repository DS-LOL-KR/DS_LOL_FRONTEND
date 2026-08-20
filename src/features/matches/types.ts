export interface Match {
  id: string;
  scrimId: string;
  winningTeam: 'blue' | 'red';
  playedAt: string;
}

export interface MatchHistoryQuery {
  groupId: string;
  page?: number;
}
