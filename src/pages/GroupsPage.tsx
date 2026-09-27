import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader as Header, PageTitle as Title, PageSubtitle as Subtitle, HeaderActions } from '../components/layout/PageHeader';
import { Col, Grid } from '../components/layout/Grid';
import { Card, SectionHeader, IconBox, CardTitle } from '../components/Card/Card';
import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Icon } from '../components/Icon/Icon';
import { Input } from '../components/Input/Input';
import { Modal } from '../components/Modal/Modal';
import { Table } from '../components/Table/Table';
import type { Column } from '../components/Table/Table';
import { useCreateGroup, useGroups, useJoinGroup } from '../features/groups/hooks';
import type { Group } from '../features/groups/types';
import { useGames } from '../features/game-accounts/hooks';
import { useMe } from '../features/auth/hooks';
import { setActiveGroupId } from '../utils/activeGroup';
import { getGameDisplayName } from '../utils/gameDisplayName';

const JoinForm = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
`;

const JoinInput = styled(Input)`
  flex: 1;
  width: auto;
  min-width: 0;
  letter-spacing: 0.04em;
`;

// Input + button share the first line; the hint/error takes the next one.
const JoinHint = styled.span`
  flex-basis: 100%;
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

const JoinError = styled.span`
  flex-basis: 100%;
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.state.danger};
`;

const GroupName = styled.span`
  font: ${({ theme }) => theme.type.bodyStrong};
  color: ${({ theme }) => theme.color.text.primary};
`;

const Secondary = styled.span`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8) var(--card-padding);
  text-align: center;
`;

const EmptyText = styled.p`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ModalTitle = styled.h2`
  font: ${({ theme }) => theme.type.heading};
  color: ${({ theme }) => theme.color.text.primary};
  margin-bottom: var(--space-4);
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-4);
`;

const ModalError = styled.p`
  margin-top: var(--space-2);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.state.danger};
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
  const gameName = (gameId: number) => {
    const game = games?.find((g) => g.id === gameId);
    return game ? getGameDisplayName(game) : `게임 #${gameId}`;
  };

  const enterGroup = (groupId: number) => {
    setActiveGroupId(String(groupId));
    navigate(`/groups/${groupId}/manage`);
  };

  const columns: Column<Group>[] = [
    { key: 'name', header: '그룹', render: (row) => <GroupName>{row.name}</GroupName> },
    { key: 'game', header: '게임', width: 180, render: (row) => <Secondary>{gameName(row.gameId)}</Secondary> },
    {
      key: 'role',
      header: '역할',
      width: 96,
      render: (row) => (row.ownerId === me?.id ? <Badge>그룹장</Badge> : <Secondary>멤버</Secondary>),
    },
    {
      key: 'action',
      header: '',
      width: 96,
      align: 'right',
      render: (row) => (
        <Button
          $size="sm"
          onClick={(e) => {
            e.stopPropagation();
            enterGroup(row.id);
          }}
        >
          입장
          <Icon name="chevronRight" size={14} />
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
          <Subtitle>참여 중인 그룹 {rows.length.toLocaleString()}개</Subtitle>
        </div>
        <HeaderActions>
          <Button $variant="primary" onClick={() => setCreateOpen(true)}>
            <Icon name="plus" size={14} />
            그룹 만들기
          </Button>
        </HeaderActions>
      </Header>

      <Grid>
        <Col $span={8}>
        <Card flush>
          <SectionHeader
            inset
            icon={<Icon name="groups" />}
            title="참여 중인 그룹"
            description="그룹을 누르면 그룹 설정으로 이동해요"
          />
          {groupsLoading ? (
            <EmptyState>
              <EmptyText>불러오는 중...</EmptyText>
            </EmptyState>
          ) : groupsError ? (
            <EmptyState>
              <EmptyText>그룹 목록을 불러오지 못했어요</EmptyText>
            </EmptyState>
          ) : rows.length === 0 ? (
            <EmptyState>
              <IconBox aria-hidden="true">
                <Icon name="groups" />
              </IconBox>
              <CardTitle as="h3">아직 그룹이 없어요</CardTitle>
              <EmptyText>참여 중인 그룹이 없어요. 그룹을 만들거나 초대 코드로 참여해보세요</EmptyText>
            </EmptyState>
          ) : (
            <Table
              columns={columns}
              data={rows}
              minWidth={520}
              rowKey={(row) => row.id}
              onRowClick={(row) => enterGroup(row.id)}
            />
          )}
        </Card>
        </Col>
        <Col $span={4}>
        <Card>
          <SectionHeader
            icon={<Icon name="link" />}
            title={<label htmlFor="join-key">그룹 키로 참여</label>}
            description="친구에게 받은 초대 코드로 기존 그룹에 들어가요"
          />
          <JoinForm>
            <JoinInput
              id="join-key"
              value={joinKey}
              onChange={(e) => setJoinKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleJoinGroup();
              }}
              placeholder="A7K2-9QMD"
              aria-invalid={joinGroup.isError || undefined}
            />
            <Button onClick={handleJoinGroup} disabled={joinGroup.isPending}>
              참여
            </Button>
            {joinGroup.isError ? (
              <JoinError>키를 확인해주세요</JoinError>
            ) : (
              <JoinHint>친구에게 받은 8자리 코드를 입력하면 바로 참여돼요</JoinHint>
            )}
          </JoinForm>
        </Card>
        </Col>
      </Grid>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <ModalTitle>그룹 만들기</ModalTitle>
        <Input
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleCreateGroup();
          }}
          placeholder="그룹 이름"
          autoFocus
        />
        {createGroup.isError && <ModalError>{createGroup.error.message || '그룹 생성에 실패했어요'}</ModalError>}
        <ModalActions>
          <Button $variant="ghost" onClick={() => setCreateOpen(false)}>
            취소
          </Button>
          <Button $variant="primary" onClick={handleCreateGroup} disabled={createGroup.isPending}>
            만들기
          </Button>
        </ModalActions>
      </Modal>
    </PageLayout>
  );
}
