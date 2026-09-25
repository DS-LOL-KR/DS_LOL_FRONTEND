import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader as Header, PageTitle as Title, PageSubtitle as Subtitle, HeaderActions } from '../components/layout/PageHeader';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal/Modal';
import { Table } from '../components/Table/Table';
import type { Column } from '../components/Table/Table';
import { Avatar } from '../components/Avatar/Avatar';
import { Input } from '../components/Input/Input';
import {
  useDeleteGroup,
  useDiscordInviteUrl,
  useGroup,
  useKickMember,
  useLeaveGroup,
  useRefreshInviteCode,
  useTransferOwner,
  useUpdateDiscordWebhook,
} from '../features/groups/hooks';
import type { GroupMember } from '../features/groups/types';
import { useTierTable } from '../features/tiers/hooks';
import { useMe } from '../features/auth/hooks';
import { setActiveGroupId } from '../utils/activeGroup';
import { resolveAssetUrl } from '../utils/assetUrl';
import { formatDate } from '../utils/formatDateTime';

const InviteRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm}px;
  padding: ${({ theme }) => theme.space.md}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const InviteLabel = styled.span`
  width: 130px;
  flex-shrink: 0;
  font: ${({ theme }) => theme.font.label12m};
  color: ${({ theme }) => theme.color.text.secondary};

  ${({ theme }) => theme.media.mobile} {
    width: 100%;
  }
`;

const InviteLinkBox = styled.div`
  width: 320px;
  height: 40px;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.space.sm}px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  border: 1px solid ${({ theme }) => theme.color.border.base};
  background: ${({ theme }) => theme.color.surface.subtle};
  font-variant-numeric: tabular-nums;
  font-size: 18px;
  color: ${({ theme }) => theme.color.text.primary};

  ${({ theme }) => theme.media.mobile} {
    flex: 1;
    width: auto;
    min-width: 0;
  }
`;

const InviteHint = styled.span`
  flex: 1 1 240px;
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const WebhookInputWrap = styled.div`
  width: 320px;

  ${({ theme }) => theme.media.mobile} {
    flex: 1 1 100%;
    width: auto;
    min-width: 0;
  }
`;

const TableWrap = styled.div`
  margin-top: ${({ theme }) => theme.space.xs}px;
`;

const MemberCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs}px;
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

const InlineError = styled.p`
  margin-top: ${({ theme }) => theme.space.xs}px;
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.state.danger};
`;

const InlineSuccess = styled.p`
  margin-top: ${({ theme }) => theme.space.xs}px;
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.state.success};
`;

export function GroupManagePage() {
  const { id: groupId } = useParams();
  const numericGroupId = Number(groupId);
  const navigate = useNavigate();
  const { data: group, isLoading: groupLoading, isError: groupError } = useGroup(numericGroupId);
  const { data: tierRows } = useTierTable(numericGroupId);
  const { data: me } = useMe();
  const deleteGroup = useDeleteGroup(numericGroupId);
  const kickMember = useKickMember(numericGroupId);
  const transferOwner = useTransferOwner(numericGroupId);
  const refreshInviteCode = useRefreshInviteCode(numericGroupId);
  const leaveGroup = useLeaveGroup(numericGroupId);
  const updateDiscordWebhook = useUpdateDiscordWebhook(numericGroupId);
  const discordInviteUrl = useDiscordInviteUrl(numericGroupId);

  // 디스코드 OAuth 콜백(discord.controller.ts handleOAuthCallback)이 성공/실패를
  // 쿼리로 알려주며 이 화면으로 돌려보냄 — 한 번 보여준 뒤엔 새로고침해도 다시
  // 안 뜨게 쿼리를 지움.
  const [searchParams, setSearchParams] = useSearchParams();
  const discordLinked = searchParams.get('discordLinked') === '1';
  const discordLinkError = searchParams.get('discordLinkError') === '1';
  useEffect(() => {
    if (!discordLinked && !discordLinkError) return;
    const next = new URLSearchParams(searchParams);
    next.delete('discordLinked');
    next.delete('discordLinkError');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [kickTarget, setKickTarget] = useState<GroupMember | null>(null);
  const [transferTarget, setTransferTarget] = useState<GroupMember | null>(null);
  const [webhookInput, setWebhookInput] = useState('');

  useEffect(() => {
    if (groupId) setActiveGroupId(groupId);
  }, [groupId]);

  useEffect(() => {
    if (group) setInviteCode(group.inviteCode);
  }, [group]);

  useEffect(() => {
    if (group) setWebhookInput(group.discordWebhookUrl ?? '');
  }, [group]);

  // GET /groups/:id gives role/joinedAt/nickname/profile image; GET /groups/:id/tiers
  // gives per-line tier/MMR. Neither alone has everything the table wants, so merge
  // by userId — picking each member's most-played line as their "주 라인" row
  // (tier/mmr은 라인 무관 계정 전체 값이라 어느 행에서 가져와도 동일함).
  const members: GroupMember[] = useMemo(() => {
    if (!group) return [];
    return group.members.map((membership) => {
      const rows = (tierRows?.tiers ?? []).filter((row) => row.userId === membership.userId);
      const mainRow = rows.length
        ? rows.reduce((best, row) => (row.wins + row.losses > best.wins + best.losses ? row : best))
        : null;
      // 유저가 프로필에서 주라인을 직접 지정했으면 그걸 최우선으로 쓰고, 없으면
      // 지금까지처럼 판수(승+패)가 가장 많은 라인으로 자동 추론 — 직접 지정해도
      // 이 컬럼이 반영을 안 하던 버그 수정(2026-09-12). mainPosition은 라인 무관
      // 계정 전체 값이라 rows 중 아무 거서나 읽어도 동일함.
      const mainLane = rows[0]?.mainPosition ?? mainRow?.position ?? null;
      return {
        userId: membership.userId,
        nickname: membership.user.nickname,
        profileImageUrl: membership.user.profileImageUrl,
        isOwner: membership.role === 'OWNER',
        internalTier: mainRow?.tier ?? null,
        mainLane,
        mmr: mainRow?.internalMmr ?? null,
        joinedAt: membership.joinedAt,
      };
    });
  }, [group, tierRows]);

  const isViewerOwner = group !== undefined && me !== undefined && group.ownerId === me.id;

  const handleCopyKey = () => {
    if (!inviteCode) return;
    navigator.clipboard?.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRefreshInviteCode = () => {
    refreshInviteCode.mutate(undefined, {
      onSuccess: (result) => setInviteCode(result.inviteCode),
    });
  };

  // 위임하는 순간 내 관리 권한이 사라지는데 한 번 클릭으로 바로 실행되던 걸
  // 추방/삭제와 같은 확인 모달로 맞춤.
  const handleTransferConfirmed = () => {
    if (!transferTarget) return;
    transferOwner.mutate({ newOwnerId: transferTarget.userId }, { onSuccess: () => setTransferTarget(null) });
  };

  const handleSaveDiscordWebhook = () => {
    const trimmed = webhookInput.trim();
    updateDiscordWebhook.mutate({ webhookUrl: trimmed || null });
  };

  const handleClearDiscordWebhook = () => {
    setWebhookInput('');
    updateDiscordWebhook.mutate({ webhookUrl: null });
  };

  const handleKickConfirmed = () => {
    if (!kickTarget) return;
    kickMember.mutate(kickTarget.userId, { onSuccess: () => setKickTarget(null) });
  };

  const handleDeleteGroup = () => {
    deleteGroup.mutate(undefined, { onSuccess: () => navigate('/groups') });
  };

  const handleLeaveGroup = () => {
    leaveGroup.mutate(undefined, { onSuccess: () => navigate('/groups') });
  };

  const columns: Column<GroupMember>[] = [
    {
      key: 'nickname',
      header: '그룹원',
      render: (m) => (
        <MemberCell>
          <Avatar name={m.nickname} imageUrl={resolveAssetUrl(m.profileImageUrl)} size={22} />
          <MemberName>{m.nickname}</MemberName>
          {m.isOwner && <OwnerTag>그룹장</OwnerTag>}
        </MemberCell>
      ),
    },
    {
      key: 'internalTier',
      header: '내부 티어',
      width: 100,
      render: (m) =>
        m.internalTier ? (
          <TierCell $tier={m.internalTier}>{m.internalTier}티어</TierCell>
        ) : (
          <NoAction>미확인</NoAction>
        ),
    },
    { key: 'mainLane', header: '주 라인', width: 90, render: (m) => m.mainLane ?? '-' },
    { key: 'mmr', header: 'MMR', width: 80, align: 'right', render: (m) => m.mmr ?? '-' },
    { key: 'joinedAt', header: '가입일', width: 115, align: 'right', render: (m) => formatDate(m.joinedAt).slice(2) },
    {
      key: 'action',
      header: '관리',
      width: 215,
      align: 'right',
      render: (m) =>
        isViewerOwner && !m.isOwner ? (
          <ActionCell>
            <Button $variant="ghost" $size="sm" onClick={() => setTransferTarget(m)}>
              그룹장 위임
            </Button>
            <Button $variant="dangerGhost" $size="sm" onClick={() => setKickTarget(m)}>
              추방
            </Button>
          </ActionCell>
        ) : (
          <NoAction>—</NoAction>
        ),
    },
  ];

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>{group?.name ?? (groupError ? '그룹 정보를 불러올 수 없어요' : groupLoading ? '불러오는 중...' : '')}</Title>
          <Subtitle>
            그룹원 {members.length}명 · 내 역할 {isViewerOwner ? '그룹장' : '멤버'}
          </Subtitle>
        </div>
        <HeaderActions>
          <Button onClick={() => navigate(`/groups/${groupId}/matches/new`)}>
            새 내전 만들기
          </Button>
          {isViewerOwner ? (
            <Button $variant="dangerGhost" onClick={() => setDeleteOpen(true)}>
              그룹 삭제
            </Button>
          ) : (
            <Button $variant="dangerGhost" onClick={handleLeaveGroup} disabled={leaveGroup.isPending}>
              그룹 나가기
            </Button>
          )}
        </HeaderActions>
      </Header>
      <InviteRow>
        <InviteLabel>초대 키</InviteLabel>
        <InviteLinkBox>{inviteCode ?? '-'}</InviteLinkBox>
        <Button $variant="ghost" $size="sm" onClick={handleCopyKey} disabled={!inviteCode}>
          {copied ? '복사됨' : '복사'}
        </Button>
        <Button $variant="ghost" $size="sm" onClick={handleRefreshInviteCode} disabled={refreshInviteCode.isPending}>
          키 재발급
        </Button>
        <InviteHint>키가 유출됐다면 재발급하세요. 기존 키는 즉시 만료됩니다</InviteHint>
      </InviteRow>
      {refreshInviteCode.isError && (
        <InlineError>{refreshInviteCode.error.message || '초대 키 재발급에 실패했어요'}</InlineError>
      )}
      {transferOwner.isError && (
        <InlineError>{transferOwner.error.message || '그룹장 위임에 실패했어요'}</InlineError>
      )}
      {isViewerOwner && (
        <InviteRow>
          <InviteLabel>디스코드 알림</InviteLabel>
          <WebhookInputWrap>
            <Input
              value={webhookInput}
              onChange={(e) => setWebhookInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSaveDiscordWebhook();
              }}
              placeholder="https://discord.com/api/webhooks/..."
            />
          </WebhookInputWrap>
          <Button $variant="ghost" $size="sm" onClick={handleSaveDiscordWebhook} disabled={updateDiscordWebhook.isPending}>
            저장
          </Button>
          {group?.discordWebhookUrl && (
            <Button $variant="dangerGhost" $size="sm" onClick={handleClearDiscordWebhook} disabled={updateDiscordWebhook.isPending}>
              끄기
            </Button>
          )}
          <InviteHint>등록하면 팀 구성/내전 종료 결과가 이 채널로 자동 전송돼요</InviteHint>
        </InviteRow>
      )}
      {updateDiscordWebhook.isError && (
        <InlineError>{updateDiscordWebhook.error.message || '디스코드 웹후크 설정에 실패했어요'}</InlineError>
      )}
      {isViewerOwner && (
        <InviteRow>
          <InviteLabel>디스코드 명령어</InviteLabel>
          {group?.discordGuildId ? (
            <InviteHint>연동됨 · 디스코드 서버에서 /티어표, /전적, /내전결과 명령어를 쓸 수 있어요</InviteHint>
          ) : (
            <>
              <Button
                $variant="ghost"
                $size="sm"
                onClick={() => discordInviteUrl.mutate()}
                disabled={discordInviteUrl.isPending}
              >
                디스코드 봇 초대
              </Button>
              <InviteHint>봇을 서버에 초대하면 그 서버가 자동으로 이 그룹에 연동돼요</InviteHint>
            </>
          )}
        </InviteRow>
      )}
      {discordInviteUrl.isError && (
        <InlineError>{discordInviteUrl.error.message || '초대 링크를 만들지 못했어요'}</InlineError>
      )}
      {discordLinked && <InlineSuccess>디스코드 서버가 이 그룹에 연동됐어요.</InlineSuccess>}
      {discordLinkError && (
        <InlineError>디스코드 연동에 실패했어요. 서버 선택을 취소했거나 권한이 없을 수 있어요 — 다시 시도해주세요.</InlineError>
      )}
      <TableWrap>
        {groupLoading ? (
          <EmptyLabel>불러오는 중...</EmptyLabel>
        ) : members.length === 0 ? (
          <EmptyLabel>그룹원이 없어요</EmptyLabel>
        ) : (
          <Table columns={columns} data={members} minWidth={820} />
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

      <Modal open={Boolean(transferTarget)} onClose={() => setTransferTarget(null)}>
        <ModalTitle>{transferTarget?.nickname}님에게 그룹장을 넘길까요?</ModalTitle>
        <ModalBody>넘기면 초대 키·디스코드 연동·그룹원 관리 권한이 바로 넘어가요.</ModalBody>
        {transferOwner.isError && <InlineError>{transferOwner.error.message || '그룹장 위임에 실패했어요'}</InlineError>}
        <ModalActions>
          <Button $variant="ghost" $size="sm" onClick={() => setTransferTarget(null)}>취소</Button>
          <Button $size="sm" onClick={handleTransferConfirmed} disabled={transferOwner.isPending}>그룹장 위임</Button>
        </ModalActions>
      </Modal>

      <Modal open={Boolean(kickTarget)} onClose={() => setKickTarget(null)}>
        <ModalTitle>{kickTarget?.nickname}님을 추방할까요?</ModalTitle>
        <ModalBody>추방된 그룹원은 초대 링크로 다시 참여할 수 있어요.</ModalBody>
        {kickMember.isError && <InlineError>{kickMember.error.message || '추방에 실패했어요'}</InlineError>}
        <ModalActions>
          <Button $variant="ghost" $size="sm" onClick={() => setKickTarget(null)}>취소</Button>
          <Button $variant="danger" $size="sm" onClick={handleKickConfirmed} disabled={kickMember.isPending}>추방</Button>
        </ModalActions>
      </Modal>
    </PageLayout>
  );
}
