import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { Modal } from '../components/Modal/Modal';
import { Table } from '../components/Table/Table';
import type { Column } from '../components/Table/Table';
import { useCreateGroup, useGroups, useJoinGroup } from '../features/groups/hooks';
import type { Group } from '../features/groups/types';
import { useGames } from '../features/game-accounts/hooks';
import type { Game } from '../features/game-accounts/types';
import { setActiveGroupId } from '../utils/activeGroup';
import { asArrayOrFallback } from '../utils/asArrayOrFallback';

// TODO: no backend yet — shown when GET /groups fails or returns nothing, so the
// design is still reviewable end-to-end without a live server.
const MOCK_GROUPS: Group[] = [
  { id: '1', name: '새벽 내전방', gameId: 1, memberCount: 10, memberCap: 10, inviteCode: 'A7K2-9QMD', myRole: 'owner', myInternalTier: 2 },
  { id: '2', name: '주말 발로 모임', gameId: 2, memberCount: 7, memberCap: 10, inviteCode: 'B3F1-22XZ', myRole: 'member', myInternalTier: 3 },
  { id: '3', name: '회사 점심 내전', gameId: 3, memberCount: 5, memberCap: 12, inviteCode: 'C9K0-77QP', myRole: 'member', myInternalTier: 2 },
];
const MOCK_GAME_NAMES: Record<number, string> = { 1: '리그 오브 레전드', 2: '발로란트', 3: '오버워치 2' };

const Header = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.space.lg}px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const Title = styled.p`
  font: ${({ theme }) => theme.font.title26};
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.color.text.primary};
`;

const Subtitle = styled.p`
  margin-top: 6px;
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.xs}px;
`;

const JoinRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm}px;
  padding: ${({ theme }) => theme.space.md}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const JoinLabel = styled.span`
  width: 100px;
  font: ${({ theme }) => theme.font.label12m};
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const JoinInput = styled(Input)`
  width: 240px;
  font-family: 'IBM Plex Mono', monospace;
`;

const JoinHint = styled.span`
  flex: 1;
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const JoinError = styled.span`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.state.danger};
`;

const TableWrap = styled.div`
  margin-top: ${({ theme }) => theme.space.xs}px;
`;

const TierCell = styled.div<{ $tier: 1 | 2 | 3 | 4 | 5 }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  color: ${({ theme, $tier }) => theme.color.tier[$tier]};
  font: ${({ theme }) => theme.font.body14b};

  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: ${({ theme, $tier }) => theme.color.tier[$tier]};
  }
`;

const ModalTitle = styled.p`
  font: ${({ theme }) => theme.font.sub17};
  color: ${({ theme }) => theme.color.text.primary};
  margin-bottom: ${({ theme }) => theme.space.md}px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.space.xs}px;
  margin-top: ${({ theme }) => theme.space.md}px;
`;

export function GroupsPage() {
  const navigate = useNavigate();
  const { data: groups } = useGroups();
  const { data: games } = useGames();
  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();

  const [joinKey, setJoinKey] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const rows = asArrayOrFallback(groups, MOCK_GROUPS);
  const gameName = (gameId: number) =>
    asArrayOrFallback<Game>(games, []).find((g) => g.id === gameId)?.name
      ?? MOCK_GAME_NAMES[gameId]
      ?? '알 수 없음';

  const enterGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    navigate(`/groups/${groupId}/manage`);
  };

  const columns: Column<Group>[] = [
    { key: 'name', header: '그룹', render: (row) => row.name },
    { key: 'game', header: '게임', render: (row) => gameName(row.gameId) },
    { key: 'memberCount', header: '인원', render: (row) => `${row.memberCount} / ${row.memberCap}` },
    {
      key: 'tier',
      header: '내 티어',
      render: (row) => <TierCell $tier={row.myInternalTier}>{row.myInternalTier}티어</TierCell>,
    },
    { key: 'role', header: '역할', render: (row) => (row.myRole === 'owner' ? '그룹장' : '멤버') },
    {
      key: 'action',
      header: '',
      render: (row) => (
        <Button $variant="ghost" $size="sm" onClick={() => enterGroup(row.id)}>
          입장
        </Button>
      ),
    },
  ];

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    createGroup.mutate(
      { name: newGroupName, gameId: 1 },
      {
        onSuccess: (group) => {
          setCreateOpen(false);
          setNewGroupName('');
          enterGroup(group.id);
        },
      },
    );
  };

  const handleJoinGroup = () => {
    if (!joinKey.trim()) return;
    joinGroup.mutate(
      { inviteCode: joinKey },
      { onSuccess: (group) => enterGroup(group.id) },
    );
  };

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내 그룹</Title>
          <Subtitle>참여 중인 그룹 {rows.length}개</Subtitle>
        </div>
        <HeaderActions>
          <Button $size="sm" onClick={() => setCreateOpen(true)}>그룹 만들기</Button>
        </HeaderActions>
      </Header>
      <JoinRow>
        <JoinLabel>그룹 키로 참여</JoinLabel>
        <JoinInput
          value={joinKey}
          onChange={(e) => setJoinKey(e.target.value)}
          placeholder="A7K2-9QMD"
        />
        <Button $variant="ghost" $size="sm" onClick={handleJoinGroup} disabled={joinGroup.isPending}>
          참여
        </Button>
        {joinGroup.isError ? (
          <JoinError>키를 확인해주세요</JoinError>
        ) : (
          <JoinHint>친구에게 받은 8자리 코드를 입력하면 바로 참여돼요</JoinHint>
        )}
      </JoinRow>
      <TableWrap>
        <Table columns={columns} data={rows} />
      </TableWrap>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <ModalTitle>그룹 만들기</ModalTitle>
        <Input
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="그룹 이름"
          autoFocus
        />
        <ModalActions>
          <Button $variant="ghost" $size="sm" onClick={() => setCreateOpen(false)}>취소</Button>
          <Button $size="sm" onClick={handleCreateGroup} disabled={createGroup.isPending}>만들기</Button>
        </ModalActions>
      </Modal>
    </PageLayout>
  );
}
