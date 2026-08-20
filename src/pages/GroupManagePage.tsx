import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal/Modal';
import { Table } from '../components/Table/Table';
import type { Column } from '../components/Table/Table';

interface Member {
  id: string;
  name: string;
  isOwner: boolean;
  tier: 1 | 2 | 3 | 4 | 5;
  lane: string;
  mmr: number;
  joinedAt: string;
}

// TODO: no /groups/:id/members or invite-link endpoint yet — swap this mock for a
// real query once the group detail API lands (see the 기능명세서 "그룹원 목록 보기" spec).
const MOCK_MEMBERS: Member[] = [
  { id: '1', name: '재현', isOwner: true, tier: 1, lane: 'MID', mmr: 1990, joinedAt: '26.05.02' },
  { id: '2', name: '성현', isOwner: false, tier: 1, lane: 'MID', mmr: 1990, joinedAt: '26.05.04' },
  { id: '3', name: '민석', isOwner: false, tier: 2, lane: 'JGL', mmr: 1865, joinedAt: '26.05.04' },
  { id: '4', name: '지우', isOwner: false, tier: 2, lane: 'BOT', mmr: 1902, joinedAt: '26.05.11' },
  { id: '5', name: '태윤', isOwner: false, tier: 3, lane: 'SUP', mmr: 1673, joinedAt: '26.06.01' },
  { id: '6', name: '현우', isOwner: false, tier: 2, lane: 'TOP', mmr: 1858, joinedAt: '26.06.18' },
  { id: '7', name: '서진', isOwner: false, tier: 4, lane: 'SUP', mmr: 1616, joinedAt: '26.07.02' },
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
  font-size: 13px;
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

export function GroupManagePage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [kickTarget, setKickTarget] = useState<Member | null>(null);

  const inviteLink = `ds-lol.gg/join/A7K2-9QMD`;
  const owner = members.find((m) => m.isOwner);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTransferOwner = (memberId: string) => {
    setMembers((prev) => prev.map((m) => ({ ...m, isOwner: m.id === memberId })));
  };

  const handleKickConfirmed = () => {
    if (!kickTarget) return;
    setMembers((prev) => prev.filter((m) => m.id !== kickTarget.id));
    setKickTarget(null);
  };

  const columns: Column<Member>[] = [
    {
      key: 'name',
      header: '그룹원',
      render: (m) => (
        <MemberCell>
          <MemberAvatar />
          <MemberName>{m.name}</MemberName>
          {m.isOwner && <OwnerTag>그룹장</OwnerTag>}
        </MemberCell>
      ),
    },
    { key: 'tier', header: '내부 티어', render: (m) => <TierCell $tier={m.tier}>{m.tier}티어</TierCell> },
    { key: 'lane', header: '주 라인' },
    { key: 'mmr', header: 'MMR' },
    { key: 'joinedAt', header: '가입일' },
    {
      key: 'action',
      header: '관리',
      render: (m) =>
        m.isOwner ? (
          <NoAction>—</NoAction>
        ) : (
          <ActionCell>
            <Button $variant="ghost" $size="sm" onClick={() => handleTransferOwner(m.id)}>
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
          <Title>새벽 내전방</Title>
          <Subtitle>
            그룹원 {members.length}명 · 내 역할 {owner?.name === '재현' ? '그룹장' : '멤버'}
          </Subtitle>
        </div>
        <Button $variant="dangerGhost" $size="sm" onClick={() => setDeleteOpen(true)}>
          그룹 삭제
        </Button>
      </Header>
      <InviteRow>
        <InviteLabel>초대 링크</InviteLabel>
        <InviteLinkBox>{inviteLink}</InviteLinkBox>
        <Button $variant="ghost" $size="sm" onClick={handleCopyLink}>
          {copied ? '복사됨' : '복사'}
        </Button>
        {/* TODO: wire to a real reissue-key endpoint once it exists. */}
        <Button $variant="ghost" $size="sm">키 재발급</Button>
        <InviteHint>키가 유출됐다면 재발급하세요. 기존 링크는 즉시 만료됩니다</InviteHint>
      </InviteRow>
      <TableWrap>
        <Table columns={columns} data={members} />
      </TableWrap>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <ModalTitle>그룹을 삭제할까요?</ModalTitle>
        <ModalBody>그룹과 관련된 모든 내전 기록이 함께 삭제되며 되돌릴 수 없어요.</ModalBody>
        <ModalActions>
          <Button $variant="ghost" $size="sm" onClick={() => setDeleteOpen(false)}>취소</Button>
          <Button $variant="danger" $size="sm" onClick={() => navigate('/groups')}>삭제</Button>
        </ModalActions>
      </Modal>

      <Modal open={Boolean(kickTarget)} onClose={() => setKickTarget(null)}>
        <ModalTitle>{kickTarget?.name}님을 추방할까요?</ModalTitle>
        <ModalBody>추방된 그룹원은 초대 링크로 다시 참여할 수 있어요.</ModalBody>
        <ModalActions>
          <Button $variant="ghost" $size="sm" onClick={() => setKickTarget(null)}>취소</Button>
          <Button $variant="danger" $size="sm" onClick={handleKickConfirmed}>추방</Button>
        </ModalActions>
      </Modal>
    </PageLayout>
  );
}
