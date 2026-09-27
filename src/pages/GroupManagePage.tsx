import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader as Header, PageTitle as Title, PageSubtitle as Subtitle, HeaderActions } from '../components/layout/PageHeader';
import { Grid, Col } from '../components/layout/Grid';
import { Card, SectionHeader } from '../components/Card/Card';
import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Icon } from '../components/Icon/Icon';
import { Modal } from '../components/Modal/Modal';
import { Table } from '../components/Table/Table';
import type { Column } from '../components/Table/Table';
import { Avatar } from '../components/Avatar/Avatar';
import { Input } from '../components/Input/Input';
import { LaneLabel } from '../components/LaneIcon/LaneIcon';
import {
  useDeleteGroup,
  useDiscordInviteUrl,
  useGroupMembers,
  useKickMember,
  useLeaveGroup,
  useRefreshInviteCode,
  useTransferOwner,
  useUpdateDiscordWebhook,
} from '../features/groups/hooks';
import type { GroupMember } from '../features/groups/types';
import { useMe } from '../features/auth/hooks';
import { setActiveGroupId } from '../utils/activeGroup';
import { resolveAssetUrl } from '../utils/assetUrl';
import { formatDate } from '../utils/formatDateTime';

// ── Side cards: raised rows inside a card (no card-in-card) ─────────────────
const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const RaisedRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: ${({ theme }) => theme.color.surface.subtle};
  border-radius: ${({ theme }) => theme.radius.control}px;
`;

const RowLabel = styled.span`
  font: ${({ theme }) => theme.type.labelStrong};
  color: ${({ theme }) => theme.color.text.primary};
`;

const RowActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
`;

const InviteCodeBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-width: 0;
`;

const InviteCodeText = styled.span`
  font: ${({ theme }) => theme.type.metric};
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.color.text.primary};
`;

const Hint = styled.p`
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

const StatusLine = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Dot = styled.span<{ $on: boolean }>`
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: var(--radius-full);
  background: ${({ theme, $on }) => ($on ? theme.color.state.success : theme.color.text.muted)};
`;

const DangerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
`;

const DangerText = styled.div`
  flex: 1 1 180px;
  min-width: 0;
`;

// ── Member table ────────────────────────────────────────────────────────────
const MemberCell = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
`;

const MemberName = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font: ${({ theme }) => theme.type.bodyStrong};
  color: ${({ theme }) => theme.color.text.primary};
`;

const Secondary = styled.span`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Mmr = styled.span`
  font: ${({ theme }) => theme.type.bodyStrong};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.primary};
`;

const ActionCell = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
`;

const NoAction = styled.span`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.muted};
`;

const TableFooter = styled.p`
  padding: var(--space-3) var(--card-padding);
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

const EmptyLabel = styled.p`
  padding: var(--space-8) var(--card-padding);
  text-align: center;
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const CardMessages = styled.div`
  padding: 0 var(--card-padding) var(--space-3);
`;

// ── Messages / modal ────────────────────────────────────────────────────────
const InlineError = styled.p`
  margin-top: var(--space-2);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.state.danger};
`;

const InlineSuccess = styled.p`
  margin-top: var(--space-2);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.state.success};
`;

const ModalTitle = styled.h2`
  font: ${({ theme }) => theme.type.heading};
  color: ${({ theme }) => theme.color.text.primary};
  margin-bottom: var(--space-3);
`;

const ModalBody = styled.p`
  font: ${({ theme }) => theme.type.body};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-5);
`;

export function GroupManagePage() {
  const { id: groupId } = useParams();
  const numericGroupId = Number(groupId);
  const navigate = useNavigate();
  // GET /groups/:id(역할·가입일·프로필)와 GET /groups/:id/tiers(티어·MMR·주 라인)를
  // userId로 합친 로스터 — 병합 규칙(주 라인 우선순위 등)은 useGroupMembers에 있음.
  const { group, members, groupQuery } = useGroupMembers(numericGroupId);
  const groupLoading = groupQuery.isLoading;
  const groupError = groupQuery.isError;
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

  const isViewerOwner = group !== undefined && me !== undefined && group.ownerId === me.id;
  const hasUnlinkedMember = members.some((m) => m.internalTier === null || m.mmr === null);

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
          <Avatar name={m.nickname} imageUrl={resolveAssetUrl(m.profileImageUrl)} size={24} />
          <MemberName>{m.nickname}</MemberName>
          {m.isOwner && <Badge>그룹장</Badge>}
        </MemberCell>
      ),
    },
    {
      key: 'internalTier',
      header: '내부 티어',
      width: 96,
      render: (m) => (m.internalTier ? <Badge tier={m.internalTier} /> : <NoAction>—</NoAction>),
    },
    {
      key: 'mainLane',
      header: '주 라인',
      width: 88,
      render: (m) => (m.mainLane ? <LaneLabel lane={m.mainLane} /> : <NoAction>—</NoAction>),
    },
    {
      key: 'mmr',
      header: 'MMR',
      width: 84,
      align: 'right',
      render: (m) => (m.mmr !== null ? <Mmr>{m.mmr.toLocaleString()}</Mmr> : <NoAction>—</NoAction>),
    },
    {
      key: 'joinedAt',
      header: '가입일',
      width: 104,
      align: 'right',
      render: (m) => <Secondary>{formatDate(m.joinedAt).slice(2)}</Secondary>,
    },
    {
      key: 'action',
      header: '관리',
      width: 190,
      align: 'right',
      render: (m) =>
        isViewerOwner && !m.isOwner ? (
          <ActionCell>
            {/* 행마다 반복되는 액션은 ghost — 빨간 강조는 확인 모달에서만 */}
            <Button $variant="ghost" $size="sm" onClick={() => setTransferTarget(m)}>
              그룹장 위임
            </Button>
            <Button $variant="ghost" $size="sm" onClick={() => setKickTarget(m)}>
              추방
            </Button>
          </ActionCell>
        ) : (
          <NoAction>—</NoAction>
        ),
    },
  ];

  const showDiscordCard = isViewerOwner || discordLinked || discordLinkError || discordInviteUrl.isError;

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>{group?.name ?? (groupError ? '그룹 정보를 불러올 수 없어요' : groupLoading ? '불러오는 중...' : '')}</Title>
          <Subtitle>
            그룹원 {members.length.toLocaleString()}명 · 내 역할 {isViewerOwner ? '그룹장' : '멤버'}
          </Subtitle>
        </div>
        <HeaderActions>
          <Button $variant="primary" onClick={() => navigate(`/groups/${groupId}/matches/new`)}>
            <Icon name="plus" size={14} />
            새 내전 만들기
          </Button>
        </HeaderActions>
      </Header>

      <Grid>
        <Col $span={8}>
          <Card flush>
            <SectionHeader
              inset
              icon={<Icon name="groups" />}
              title="멤버"
              description={`그룹원 ${members.length.toLocaleString()}명 · MMR은 계정 전체 기준이에요`}
            />
            {transferOwner.isError && (
              <CardMessages>
                <InlineError>{transferOwner.error.message || '그룹장 위임에 실패했어요'}</InlineError>
              </CardMessages>
            )}
            {groupLoading ? (
              <EmptyLabel>불러오는 중...</EmptyLabel>
            ) : members.length === 0 ? (
              <EmptyLabel>그룹원이 없어요</EmptyLabel>
            ) : (
              <>
                <Table columns={columns} data={members} minWidth={720} rowKey={(m) => m.userId} />
                {hasUnlinkedMember && (
                  <TableFooter>— 표시는 아직 라이엇 계정을 연동하지 않았거나 전적이 동기화되지 않은 그룹원이에요</TableFooter>
                )}
              </>
            )}
          </Card>
        </Col>

        <Col $span={4}>
          <Card>
            <SectionHeader icon={<Icon name="link" />} title="초대 키" description="이 키를 받은 사람은 바로 그룹에 참여해요" />
            <Rows>
              <RaisedRow>
                <InviteCodeBox>
                  <InviteCodeText>{inviteCode ?? '—'}</InviteCodeText>
                  <Button $size="sm" onClick={handleCopyKey} disabled={!inviteCode}>
                    <Icon name={copied ? 'check' : 'copy'} size={14} />
                    {copied ? '복사됨' : '복사'}
                  </Button>
                </InviteCodeBox>
              </RaisedRow>
              <RowActions>
                <Button $size="sm" onClick={handleRefreshInviteCode} disabled={refreshInviteCode.isPending}>
                  <Icon name="refresh" size={14} />
                  키 재발급
                </Button>
              </RowActions>
              <Hint>키가 유출됐다면 재발급하세요. 기존 키는 즉시 만료됩니다</Hint>
            </Rows>
            {refreshInviteCode.isError && (
              <InlineError>{refreshInviteCode.error.message || '초대 키 재발급에 실패했어요'}</InlineError>
            )}
          </Card>

          {showDiscordCard && (
            <Card>
              <SectionHeader icon={<Icon name="chat" />} title="디스코드 연동" description="알림과 슬래시 명령어를 연결해요" />
              {isViewerOwner && (
                <Rows>
                  <RaisedRow>
                    <RowLabel as="label" htmlFor="discord-webhook">
                      디스코드 알림
                    </RowLabel>
                    <Input
                      id="discord-webhook"
                      value={webhookInput}
                      onChange={(e) => setWebhookInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSaveDiscordWebhook();
                      }}
                      placeholder="https://discord.com/api/webhooks/..."
                      aria-invalid={updateDiscordWebhook.isError || undefined}
                    />
                    <RowActions>
                      <Button $size="sm" onClick={handleSaveDiscordWebhook} disabled={updateDiscordWebhook.isPending}>
                        저장
                      </Button>
                      {group?.discordWebhookUrl && (
                        <Button
                          $variant="ghost"
                          $size="sm"
                          onClick={handleClearDiscordWebhook}
                          disabled={updateDiscordWebhook.isPending}
                        >
                          끄기
                        </Button>
                      )}
                    </RowActions>
                    <Hint>등록하면 팀 구성/내전 종료 결과가 이 채널로 자동 전송돼요</Hint>
                    {updateDiscordWebhook.isError && (
                      <InlineError>{updateDiscordWebhook.error.message || '디스코드 웹후크 설정에 실패했어요'}</InlineError>
                    )}
                  </RaisedRow>
                  <RaisedRow>
                    <RowLabel>디스코드 명령어</RowLabel>
                    {group?.discordGuildId ? (
                      <>
                        <StatusLine>
                          <Dot $on />
                          연동됨
                        </StatusLine>
                        <Hint>디스코드 서버에서 /티어표, /전적, /내전결과 명령어를 쓸 수 있어요</Hint>
                      </>
                    ) : (
                      <>
                        <StatusLine>
                          <Dot $on={false} />
                          연동 안 됨
                        </StatusLine>
                        <RowActions>
                          <Button
                            $size="sm"
                            onClick={() => discordInviteUrl.mutate()}
                            disabled={discordInviteUrl.isPending}
                          >
                            디스코드 봇 초대
                          </Button>
                        </RowActions>
                        <Hint>봇을 서버에 초대하면 그 서버가 자동으로 이 그룹에 연동돼요</Hint>
                      </>
                    )}
                  </RaisedRow>
                </Rows>
              )}
              {discordInviteUrl.isError && (
                <InlineError>{discordInviteUrl.error.message || '초대 링크를 만들지 못했어요'}</InlineError>
              )}
              {discordLinked && <InlineSuccess>디스코드 서버가 이 그룹에 연동됐어요.</InlineSuccess>}
              {discordLinkError && (
                <InlineError>디스코드 연동에 실패했어요. 서버 선택을 취소했거나 권한이 없을 수 있어요 — 다시 시도해주세요.</InlineError>
              )}
            </Card>
          )}

          <Card>
            <SectionHeader icon={<Icon name="settings" />} title="위험 영역" description="되돌릴 수 없는 작업이에요" />
            <DangerRow>
              {isViewerOwner ? (
                <>
                  <DangerText>
                    <RowLabel>그룹 삭제</RowLabel>
                    <Hint>모든 내전 기록이 함께 삭제돼요</Hint>
                  </DangerText>
                  <Button $variant="danger" onClick={() => setDeleteOpen(true)}>
                    그룹 삭제
                  </Button>
                </>
              ) : (
                <>
                  <DangerText>
                    <RowLabel>그룹 나가기</RowLabel>
                    <Hint>초대 키로 다시 참여할 수 있어요</Hint>
                  </DangerText>
                  <Button $variant="danger" onClick={handleLeaveGroup} disabled={leaveGroup.isPending}>
                    그룹 나가기
                  </Button>
                </>
              )}
            </DangerRow>
          </Card>
        </Col>
      </Grid>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <ModalTitle>그룹을 삭제할까요?</ModalTitle>
        <ModalBody>그룹과 관련된 모든 내전 기록이 함께 삭제되며 되돌릴 수 없어요.</ModalBody>
        <ModalActions>
          <Button $variant="ghost" onClick={() => setDeleteOpen(false)}>
            취소
          </Button>
          <Button $variant="danger" onClick={handleDeleteGroup} disabled={deleteGroup.isPending}>
            삭제
          </Button>
        </ModalActions>
      </Modal>

      <Modal open={Boolean(transferTarget)} onClose={() => setTransferTarget(null)}>
        <ModalTitle>{transferTarget?.nickname}님에게 그룹장을 넘길까요?</ModalTitle>
        <ModalBody>넘기면 초대 키·디스코드 연동·그룹원 관리 권한이 바로 넘어가요.</ModalBody>
        {transferOwner.isError && <InlineError>{transferOwner.error.message || '그룹장 위임에 실패했어요'}</InlineError>}
        <ModalActions>
          <Button $variant="ghost" onClick={() => setTransferTarget(null)}>
            취소
          </Button>
          <Button $variant="primary" onClick={handleTransferConfirmed} disabled={transferOwner.isPending}>
            그룹장 위임
          </Button>
        </ModalActions>
      </Modal>

      <Modal open={Boolean(kickTarget)} onClose={() => setKickTarget(null)}>
        <ModalTitle>{kickTarget?.nickname}님을 추방할까요?</ModalTitle>
        <ModalBody>추방된 그룹원은 초대 링크로 다시 참여할 수 있어요.</ModalBody>
        {kickMember.isError && <InlineError>{kickMember.error.message || '추방에 실패했어요'}</InlineError>}
        <ModalActions>
          <Button $variant="ghost" onClick={() => setKickTarget(null)}>
            취소
          </Button>
          <Button $variant="danger" onClick={handleKickConfirmed} disabled={kickMember.isPending}>
            추방
          </Button>
        </ModalActions>
      </Modal>
    </PageLayout>
  );
}
