// GET /groups/:id includes the member roster inline (no separate "그룹원 목록"
// endpoint) — confirmed against the real response, not just the spec doc.
export interface GroupMembership {
  id: number;
  groupId: number;
  userId: number;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
  user: {
    id: number;
    nickname: string;
    profileImageUrl: string | null;
  };
}

export interface Group {
  id: number;
  name: string;
  ownerId: number;
  gameId: number;
  inviteCode: string;
  // 팀 구성 완료/내전 종료 알림을 보낼 디스코드 웹후크 URL — 그룹장이 설정,
  // 안 하면 null(알림 없음).
  discordWebhookUrl: string | null;
  createdAt: string;
}

// GET /groups/:id only — list/create/transfer-owner/refresh-invite-code all
// return the bare Group above (no `include: { members }` on those queries).
export interface GroupDetail extends Group {
  members: GroupMembership[];
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

export interface UpdateDiscordWebhookRequest {
  // null을 보내면 알림 끄기(연동 해제).
  webhookUrl: string | null;
}

// Merges GET /groups/:id's roster with GET /groups/:id/tiers per member — the
// roster alone has no tier/lane/MMR, and the tiers endpoint has no role/joinedAt.
// internalTier/mainLane/mmr are null when the member has no linked account or no
// synced match history yet (nothing to fake there).
export interface GroupMember {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  isOwner: boolean;
  internalTier: 1 | 2 | 3 | 4 | 5 | null;
  mainLane: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP' | null;
  mmr: number | null;
  joinedAt: string;
}
