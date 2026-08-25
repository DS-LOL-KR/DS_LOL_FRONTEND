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
import { useMe } from '../features/auth/hooks';
import { setActiveGroupId } from '../utils/activeGroup';

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

const ModalError = styled.p`
  margin-top: ${({ theme }) => theme.space.xs}px;
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.state.danger};
`;

const EmptyLabel = styled.p`
  padding: ${({ theme }) => theme.space.lg}px 0;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  opacity: 0.7;
`;

export function GroupsPage() {
  const navigate = useNavigate();
  const { data: groups, isLoading: groupsLoading, isError: groupsError } = useGroups();
  const { data: games } = useGames();
  const { data: me } = useMe();
  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();

  const [joinKey, setJoinKey] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const rows = groups ?? [];
  const gameName = (gameId: number) => games?.find((g) => g.id === gameId)?.name ?? `게임 #${gameId}`;

  const enterGroup = (groupId: number) => {
    setActiveGroupId(String(groupId));
    navigate(`/groups/${groupId}/manage`);
  };

  const columns: Column<Group>[] = [
    { key: 'name', header: '그룹', render: (row) => row.name },
    { key: 'game', header: '게임', width: 160, render: (row) => gameName(row.gameId) },
    {
      key: 'role',
      header: '역할',
      width: 90,
      align: 'right',
      render: (row) => (row.ownerId === me?.id ? '그룹장' : '멤버'),
    },
    {
      key: 'action',
      header: '',
      width: 90,
      align: 'right',
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
      { onSuccess: (membership) => enterGroup(membership.groupId) },
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
        {groupsLoading ? (
          <EmptyLabel>불러오는 중...</EmptyLabel>
        ) : groupsError ? (
          <EmptyLabel>그룹 목록을 불러오지 못했어요</EmptyLabel>
        ) : rows.length === 0 ? (
          <EmptyLabel>참여 중인 그룹이 없어요. 그룹을 만들거나 초대 코드로 참여해보세요</EmptyLabel>
        ) : (
          <Table columns={columns} data={rows} />
        )}
      </TableWrap>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <ModalTitle>그룹 만들기</ModalTitle>
        <Input
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="그룹 이름"
          autoFocus
        />
        {createGroup.isError && <ModalError>{createGroup.error.message || '그룹 생성에 실패했어요'}</ModalError>}
        <ModalActions>
          <Button $variant="ghost" $size="sm" onClick={() => setCreateOpen(false)}>취소</Button>
          <Button $size="sm" onClick={handleCreateGroup} disabled={createGroup.isPending}>만들기</Button>
        </ModalActions>
      </Modal>
    </PageLayout>
  );
}
