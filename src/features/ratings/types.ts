export interface Rating {
  id: string;
  matchId: string;
  raterId: string;
  targetId: string;
  score: number;
}

export interface SubmitRatingRequest {
  matchId: string;
  targetId: string;
  score: number;
}
