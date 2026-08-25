export interface Group {
  id: number;
  name: string;
  ownerId: number;
  gameId: number;
  inviteCode: string;
  createdAt: string;
}

export interface Membership {
  id: number;
  groupId: number;
  userId: number;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
}

export interface CreateGroupRequest {
  name: string;
  gameId: number;
}

export interface JoinGroupRequest {
  inviteCode: string;
}

export interface TransferOwnerRequest {
  newOwnerId: number;
}

// TODO: no "그룹원 목록" endpoint exists yet — GET /groups/:id's spec doc explicitly
// leaves open whether members are included inline or via a separate endpoint. This
// type describes what the UI needs; it isn't backed by any real response today.
export interface GroupMember {
  userId: number;
  nickname: string;
  isOwner: boolean;
  internalTier: 1 | 2 | 3 | 4 | 5;
  mainLane: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  mmr: number;
  joinedAt: string;
}
