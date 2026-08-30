export interface UpdateProfileRequest {
  nickname?: string;
  bio?: string;
}

export interface PublicGameAccount {
  id: number;
  gameId: number;
}
