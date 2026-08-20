export interface GroupMember {
  userId: string;
  nickname: string;
  isOwner: boolean;
  internalTier: 1 | 2 | 3 | 4 | 5;
  mainLane: 'TOP' | 'JGL' | 'MID' | 'BOT' | 'SUP';
  mmr: number;
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  gameId: number;
  memberCount: number;
  memberCap: number;
  inviteCode: string;
  myRole: 'owner' | 'member';
  myInternalTier: 1 | 2 | 3 | 4 | 5;
}

export interface GroupDetail extends Group {
  members: GroupMember[];
}

export interface CreateGroupRequest {
  name: string;
  gameId: number;
}

export interface JoinGroupRequest {
  inviteCode: string;
}
