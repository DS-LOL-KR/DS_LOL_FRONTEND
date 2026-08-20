export interface Group {
  id: string;
  name: string;
  memberCount: number;
}

export interface CreateGroupRequest {
  name: string;
}
