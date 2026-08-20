import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { Modal } from '../components/Modal/Modal';
import { Table } from '../components/Table/Table';
import type { Column } from '../components/Table/Table';
import { useCreateGroup, useGroups } from '../features/groups/hooks';

interface GroupRow {
  id: string;
  name: string;
  game: string;
  memberCount: number;
  memberCap: number;
  tier: 1 | 2 | 3 | 4 | 5;
  role: '그룹장' | '멤버';
}

// TODO: the /groups API only returns { id, name, memberCount } today — extend the
// backend contract with game/memberCap/tier/role and swap this mock for useGroups().
const MOCK_GROUPS: GroupRow[] = [
  { id: '1', name: '새벽 내전방', game: '리그 오브 레전드', memberCount: 10, memberCap: 10, tier: 2, role: '그룹장' },
  { id: '2', name: '주말 발로 모임', game: '발로란트', memberCount: 7, memberCap: 10, tier: 3, role: '멤버' },
  { id: '3', name: '회사 점심 내전', game: '오버워치 2', memberCount: 5, memberCap: 12, tier: 2, role: '멤버' },
];

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
  const createGroup = useCreateGroup();

  const [joinKey, setJoinKey] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const rows = groups?.length ? groups.map((g) => ({ ...g, game: '', memberCap: g.memberCount, tier: 2 as const, role: '멤버' as const })) : MOCK_GROUPS;

  const columns: Column<GroupRow>[] = [
    { key: 'name', header: '그룹', render: (row) => row.name },
    { key: 'game', header: '게임' },
    { key: 'memberCount', header: '인원', render: (row) => `${row.memberCount} / ${row.memberCap}` },
    {
      key: 'tier',
      header: '내 티어',
      render: (row) => <TierCell $tier={row.tier}>{row.tier}티어</TierCell>,
    },
    { key: 'role', header: '역할' },
    {
      key: 'action',
      header: '',
      render: (row) => (
        <Button $variant="ghost" $size="sm" onClick={() => navigate(`/groups/${row.id}/manage`)}>
          입장
        </Button>
      ),
    },
  ];

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    createGroup.mutate(
      { name: newGroupName },
      {
        onSuccess: (group) => {
          setCreateOpen(false);
          setNewGroupName('');
          navigate(`/groups/${group.id}/manage`);
        },
      },
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
          <Button $variant="ghost" $size="sm">그룹 키로 참여</Button>
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
        <Button $variant="ghost" $size="sm">참여</Button>
        <JoinHint>친구에게 받은 8자리 코드를 입력하면 바로 참여돼요</JoinHint>
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
