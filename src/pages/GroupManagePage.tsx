import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal/Modal';
import { Table } from '../components/Table/Table';
import type { Column } from '../components/Table/Table';
import {
  useDeleteGroup,
  useGroup,
  useKickMember,
  useRefreshInviteCode,
  useTransferOwner,
} from '../features/groups/hooks';
import type { GroupMember } from '../features/groups/types';
import { setActiveGroupId } from '../utils/activeGroup';

const Header = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.space.lg}px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.xs}px;
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

const InviteRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm}px;
  padding: ${({ theme }) => theme.space.md}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const InviteLabel = styled.span`
  width: 100px;
  font: ${({ theme }) => theme.font.label12m};
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const InviteLinkBox = styled.div`
  width: 320px;
  height: 38px;
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.space.sm}px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  border: 1px solid ${({ theme }) => theme.color.border.base};
  background: ${({ theme }) => theme.color.surface.subtle};
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px;
  color: ${({ theme }) => theme.color.text.primary};
`;

const InviteHint = styled.span`
  flex: 1;
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const TableWrap = styled.div`
  margin-top: ${({ theme }) => theme.space.xs}px;
`;

const MemberCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs}px;
`;

const MemberAvatar = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 3px;
  background: ${({ theme }) => theme.color.surface.subtle};
`;

const MemberName = styled.span`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const OwnerTag = styled.span`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const TierCell = styled.div<{ $tier: 1 | 2 | 3 | 4 | 5 }>`
  display: flex;
  align-items: center;
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

const ActionCell = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.space.xs}px;
`;

const NoAction = styled.span`
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ModalTitle = styled.p`
  font: ${({ theme }) => theme.font.sub17};
  color: ${({ theme }) => theme.color.text.primary};
  margin-bottom: ${({ theme }) => theme.space.sm}px;
`;

const ModalBody = styled.p`
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.space.xs}px;
  margin-top: ${({ theme }) => theme.space.md}px;
`;

const EmptyLabel = styled.p`
  padding: ${({ theme }) => theme.space.lg}px 0;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  opacity: 0.7;
`;

export function GroupManagePage() {
  const { id: groupId } = useParams();
  const numericGroupId = Number(groupId);
  const navigate = useNavigate();
  const { data: group, isLoading: groupLoading, isError: groupError } = useGroup(numericGroupId);
  const deleteGroup = useDeleteGroup(numericGroupId);
  const kickMember = useKickMember(numericGroupId);
  const transferOwner = useTransferOwner(numericGroupId);
  const refreshInviteCode = useRefreshInviteCode(numericGroupId);

  // No "그룹원 목록" endpoint exists yet (GET /groups/:id's spec doc leaves open
  // whether members are inline or a separate call) — the roster stays empty
  // until that lands, rather than showing a fake member list.
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [kickTarget, setKickTarget] = useState<GroupMember | null>(null);

  useEffect(() => {
    if (groupId) setActiveGroupId(groupId);
  }, [groupId]);

  useEffect(() => {
    if (group) setInviteCode(group.inviteCode);
  }, [group]);

  const inviteLink = inviteCode ? `ds-lol.gg/join/${inviteCode}` : null;
  const owner = members.find((m) => m.isOwner);

  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard?.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRefreshInviteCode = () => {
    refreshInviteCode.mutate(undefined, {
      onSuccess: (result) => setInviteCode(result.inviteCode),
    });
  };

  const handleTransferOwner = (userId: number) => {
    setMembers((prev) => prev.map((m) => ({ ...m, isOwner: m.userId === userId })));
    transferOwner.mutate({ newOwnerId: userId });
  };

  const handleKickConfirmed = () => {
    if (!kickTarget) return;
    setMembers((prev) => prev.filter((m) => m.userId !== kickTarget.userId));
    kickMember.mutate(kickTarget.userId);
    setKickTarget(null);
  };

  const handleDeleteGroup = () => {
    deleteGroup.mutate(undefined, { onSuccess: () => navigate('/groups') });
  };

  const columns: Column<GroupMember>[] = [
    {
      key: 'nickname',
      header: '그룹원',
      render: (m) => (
        <MemberCell>
          <MemberAvatar />
          <MemberName>{m.nickname}</MemberName>
          {m.isOwner && <OwnerTag>그룹장</OwnerTag>}
        </MemberCell>
      ),
    },
    {
      key: 'internalTier',
      header: '내부 티어',
      width: 100,
      render: (m) => <TierCell $tier={m.internalTier}>{m.internalTier}티어</TierCell>,
    },
    { key: 'mainLane', header: '주 라인', width: 90 },
    { key: 'mmr', header: 'MMR', width: 80, align: 'right' },
    { key: 'joinedAt', header: '가입일', width: 100, align: 'right' },
    {
      key: 'action',
      header: '관리',
      width: 200,
      align: 'right',
      render: (m) =>
        m.isOwner ? (
          <NoAction>—</NoAction>
        ) : (
          <ActionCell>
            <Button $variant="ghost" $size="sm" onClick={() => handleTransferOwner(m.userId)}>
              그룹장 위임
            </Button>
            <Button $variant="dangerGhost" $size="sm" onClick={() => setKickTarget(m)}>
              추방
            </Button>
          </ActionCell>
        ),
    },
  ];

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>{group?.name ?? (groupError ? '그룹 정보를 불러올 수 없어요' : groupLoading ? '불러오는 중...' : '')}</Title>
          <Subtitle>
            그룹원 {members.length}명 · 내 역할 {owner?.isOwner ? '그룹장' : '멤버'}
          </Subtitle>
        </div>
        <HeaderActions>
          <Button $size="sm" onClick={() => navigate(`/groups/${groupId}/matches/new`)}>
            새 내전 만들기
          </Button>
          <Button $variant="dangerGhost" $size="sm" onClick={() => setDeleteOpen(true)}>
            그룹 삭제
          </Button>
        </HeaderActions>
      </Header>
      <InviteRow>
        <InviteLabel>초대 링크</InviteLabel>
        <InviteLinkBox>{inviteLink ?? '-'}</InviteLinkBox>
        <Button $variant="ghost" $size="sm" onClick={handleCopyLink} disabled={!inviteLink}>
          {copied ? '복사됨' : '복사'}
        </Button>
        <Button $variant="ghost" $size="sm" onClick={handleRefreshInviteCode} disabled={refreshInviteCode.isPending}>
          키 재발급
        </Button>
        <InviteHint>키가 유출됐다면 재발급하세요. 기존 링크는 즉시 만료됩니다</InviteHint>
      </InviteRow>
      <TableWrap>
        {members.length === 0 ? (
          <EmptyLabel>그룹원 목록 기능은 아직 준비 중이에요</EmptyLabel>
        ) : (
          <Table columns={columns} data={members} />
        )}
      </TableWrap>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <ModalTitle>그룹을 삭제할까요?</ModalTitle>
        <ModalBody>그룹과 관련된 모든 내전 기록이 함께 삭제되며 되돌릴 수 없어요.</ModalBody>
        <ModalActions>
          <Button $variant="ghost" $size="sm" onClick={() => setDeleteOpen(false)}>취소</Button>
          <Button $variant="danger" $size="sm" onClick={handleDeleteGroup} disabled={deleteGroup.isPending}>삭제</Button>
        </ModalActions>
      </Modal>

      <Modal open={Boolean(kickTarget)} onClose={() => setKickTarget(null)}>
        <ModalTitle>{kickTarget?.nickname}님을 추방할까요?</ModalTitle>
        <ModalBody>추방된 그룹원은 초대 링크로 다시 참여할 수 있어요.</ModalBody>
        <ModalActions>
          <Button $variant="ghost" $size="sm" onClick={() => setKickTarget(null)}>취소</Button>
          <Button $variant="danger" $size="sm" onClick={handleKickConfirmed}>추방</Button>
        </ModalActions>
      </Modal>
    </PageLayout>
  );
}
