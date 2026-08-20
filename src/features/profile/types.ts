export interface Profile {
  userId: string;
  riotId: string;
  primaryRole: string;
  selfTier: number;
}

export interface UpdateProfileRequest {
  riotId?: string;
  primaryRole?: string;
  selfTier?: number;
}
