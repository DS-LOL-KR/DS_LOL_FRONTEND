export interface Scrim {
  id: string;
  groupId: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface CreateScrimRequest {
  groupId: string;
  participantIds: string[];
}
