import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Input, Textarea } from '../components/Input/Input';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal/Modal';
import { LaneIcon } from '../components/LaneIcon/LaneIcon';
import { Wordmark } from '../components/Wordmark/Wordmark';
import { useProfile, useUpdateProfile, useUploadProfileImage } from '../features/profile/hooks';
import { useLogout } from '../features/auth/hooks';
import {
  useGames,
  useLinkAndSyncGameAccount,
  useMyGameAccounts,
  useFullSyncGameAccount,
  useUnlinkGameAccount,
  useUpdatePreferredPosition,
} from '../features/game-accounts/hooks';
import type { Position } from '../features/game-accounts/types';
import { resolveAssetUrl } from '../utils/assetUrl';
import { getGameDisplayName } from '../utils/gameDisplayName';
import { formatDate } from '../utils/formatDateTime';

const POSITIONS: Position[] = ['TOP', 'JUG', 'MID', 'ADC', 'SUP'];

const Screen = styled.div`
  min-height: 100vh;
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 ${({ theme }) => theme.space.lg}px;
  background: ${({ theme }) => theme.color.surface.raised};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};

  ${({ theme }) => theme.media.mobile} {
    padding: 0 ${({ theme }) => theme.space.md}px;
  }
`;


const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md}px;
`;

const PageName = styled.span`
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Body = styled.main`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.space.xl * 2}px ${({ theme }) => theme.space.lg}px;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.space.xl}px ${({ theme }) => theme.space.md}px 48px;
  }
`;

const Form = styled.form`
  width: 100%;
  max-width: 620px;
`;

const Heading = styled.h1`
  font: ${({ theme }) => theme.font.title26};
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.color.text.primary};
`;

const HeadingSub = styled.p`
  margin-top: ${({ theme }) => theme.space.xs}px;
  font: ${({ theme }) => theme.font.small13};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Spacer = styled.div<{ $size: number }>`
  height: ${({ $size }) => $size}px;
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: ${({ theme }) => theme.color.border.base};
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md}px;
  padding: ${({ theme }) => theme.space.md}px 0;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs}px;
  padding: ${({ theme }) => theme.space.md}px 0;
`;

const FieldLabel = styled.label`
  font: ${({ theme }) => theme.font.label12m};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const FieldHint = styled.span`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Avatar = styled.div<{ $src?: string }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme, $src }) => ($src ? `url(${$src}) center/cover` : theme.color.surface.subtle)};
  border: 1px solid ${({ theme }) => theme.color.border.base};
  flex-shrink: 0;
`;

const AvatarInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AvatarName = styled.p`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const AvatarHint = styled.p`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const FileInput = styled.input`
  display: none;
`;

// Linked accounts are rows in the form, not boxed cards stacked inside it —
// the rest of the form already separates groups with hairlines.
const GameAccounts = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
`;

const AccountCard = styled.div<{ $column?: boolean }>`
  display: flex;
  ${({ $column }) => ($column ? 'flex-direction: column; align-items: stretch;' : 'align-items: center;')}
  gap: ${({ theme }) => theme.space.md}px;
  padding: ${({ theme }) => theme.space.md}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const AccountCardRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space.md}px;
`;

const PositionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PositionRowLabel = styled.span`
  font: ${({ theme }) => theme.font.caption11m};
  color: ${({ theme }) => theme.color.text.secondary};
  margin-right: 2px;
`;

const PositionIconButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.border.base)};
  background: ${({ theme, $active }) => ($active ? theme.color.text.primary : 'transparent')};
  color: ${({ theme, $active }) => ($active ? '#121315' : theme.color.text.secondary)};
  cursor: pointer;
  transition: filter 0.15s ease;

  &:hover:not(:disabled) { filter: brightness(1.1); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const AccountInfo = styled.div`
  flex: 1 1 220px;
  min-width: 0;
`;

const AccountNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs}px;
`;

const AccountName = styled.span<{ $linked?: boolean }>`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme, $linked }) => ($linked ? theme.color.text.primary : theme.color.text.secondary)};
`;

const LinkedTag = styled.span`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.state.success};
`;

const AccountHint = styled.p`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const TierBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const TierLabel = styled.span`
  font: ${({ theme }) => theme.font.caption11m};
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const TierValue = styled.span`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.space.lg}px;
`;

const ModalTitle = styled.p`
  font: ${({ theme }) => theme.font.sub17};
  color: ${({ theme }) => theme.color.text.primary};
  margin-bottom: ${({ theme }) => theme.space.md}px;
`;

const ModalError = styled.p`
  margin-top: ${({ theme }) => theme.space.xs}px;
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.state.danger};
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

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadProfileImage = useUploadProfileImage();
  const { data: games } = useGames();
  const { data: gameAccounts } = useMyGameAccounts();
  const linkGameAccount = useLinkAndSyncGameAccount();
  const unlinkGameAccount = useUnlinkGameAccount();
  const logout = useLogout();

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [linkingGameId, setLinkingGameId] = useState<number | null>(null);
  const [riotIdInput, setRiotIdInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<{ id: number; gameNickname: string } | null>(null);

  useEffect(() => {
    if (!profile) return;
    setNickname(profile.nickname);
    // profile.bio can be null (never set) — a Textarea can't take a null value,
    // and sending null back to PATCH /users/me fails its zod string validation.
    setBio(profile.bio ?? '');
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Nothing changed — treat "저장하고 시작하기" as just "시작하기" instead of
    // firing a no-op request (and blocking navigation on it).
    if (profile && nickname === profile.nickname && bio === (profile.bio ?? '')) {
      navigate('/groups');
      return;
    }
    updateProfile.mutate(
      { nickname, bio },
      { onSuccess: () => navigate('/groups') },
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadProfileImage.mutate(file);
  };

  const handleLinkGameAccount = () => {
    if (linkingGameId === null || !riotIdInput.trim()) return;
    const [gameName, tagLine] = riotIdInput.split('#');
    if (!gameName || !tagLine) {
      setLinkError('"이름#태그" 형식으로 입력해주세요 (예: Hide on bush#KR1)');
      return;
    }
    setLinkError(null);
    // 전적 갱신/동기화는 아직 LOL 전용 라이엇 API만 붙어있어서(발로란트는 계정
    // 연동까지만) gameCode로 분기함 — useLinkAndSyncGameAccount 참고.
    const gameCode = games?.find((g) => g.id === linkingGameId)?.code ?? '';
    linkGameAccount.mutate(
      { gameId: linkingGameId, gameName, tagLine, gameCode },
      {
        onSuccess: () => {
          setLinkingGameId(null);
          setRiotIdInput('');
        },
        onError: (err) => setLinkError(err.message || '계정 연동에 실패했어요'),
      },
    );
  };

  const closeLinkModal = () => {
    setLinkingGameId(null);
    setRiotIdInput('');
    setLinkError(null);
  };

  const handleUnlinkConfirmed = () => {
    if (!unlinkTarget) return;
    unlinkGameAccount.mutate(unlinkTarget.id, { onSuccess: () => setUnlinkTarget(null) });
  };

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => navigate('/login') });
  };

  return (
    <Screen>
      <TopBar>
        <Wordmark size={21} />
        <TopBarRight>
          <PageName>프로필 설정</PageName>
          <Button $variant="ghost" $size="sm" onClick={handleLogout} disabled={logout.isPending}>
            로그아웃
          </Button>
        </TopBarRight>
      </TopBar>
      <Body>
        <Form onSubmit={handleSave}>
          <Heading>프로필 설정</Heading>
          <HeadingSub>그룹원들에게 보여질 정보예요</HeadingSub>
          <Spacer $size={24} />
          <Divider />
          <Row>
            <Avatar $src={resolveAssetUrl(profile?.profileImageUrl)} />
            <AvatarInfo>
              <AvatarName>프로필 이미지</AvatarName>
              <AvatarHint>JPG, PNG · 5MB 이하</AvatarHint>
            </AvatarInfo>
            <Button as="label" $variant="ghost" $size="sm">
              {uploadProfileImage.isPending ? '업로드 중...' : '파일 선택'}
              <FileInput type="file" accept="image/png,image/jpeg" onChange={handleAvatarChange} />
            </Button>
          </Row>
          <Divider />
          <Field>
            <FieldLabel htmlFor="profile-nickname">이름</FieldLabel>
            <Input
              id="profile-nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="재현"
            />
            <FieldHint>그룹 안에서 표시되는 이름이에요</FieldHint>
          </Field>
          <Divider />
          <Field>
            <FieldLabel htmlFor="profile-bio">자기소개</FieldLabel>
            <Textarea
              id="profile-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={'미드 주력 / 정글 서브\n야간 내전만 참여합니다'}
            />
            <FieldHint>마크다운 지원 · **굵게**, *기울임*, - 목록</FieldHint>
          </Field>
          <Divider />
          <Field>
            <FieldLabel>게임 계정 연동</FieldLabel>
            <GameAccounts>
              {(!games || games.length === 0) && <AccountHint>연동 가능한 게임을 불러오는 중이에요</AccountHint>}
              {(games ?? []).map((game) => {
                const account = (gameAccounts ?? []).find((a) => a.gameId === game.id);
                // 전적 갱신/동기화, 주라인 선택은 아직 LOL 전용 라이엇 API·라인 개념이라
                // (발로란트는 계정 연동까지만, 2026-09-13) 게임별로 분기함.
                const isLol = game.code === 'LOL';
                return account ? (
                  <AccountCard key={game.id} $column>
                    <AccountCardRow>
                      <AccountInfo>
                        <AccountNameRow>
                          <AccountName $linked>{account.gameNickname}</AccountName>
                          <LinkedTag>연동됨</LinkedTag>
                        </AccountNameRow>
                        <AccountHint>
                          {isLol
                            ? `티어는 라이엇 API에서 자동으로 가져와요 · ${formatDate(account.createdAt)} 연동`
                            : `계정 연동만 지원돼요 · 전적/티어 갱신은 준비 중이에요 · ${formatDate(account.createdAt)} 연동`}
                        </AccountHint>
                      </AccountInfo>
                      {isLol && (
                        <TierBlock>
                          <TierLabel>게임 티어</TierLabel>
                          <TierValue>{account.stats?.officialTier ?? '미확인'}</TierValue>
                        </TierBlock>
                      )}
                      {isLol && <RefreshAccountButton accountId={account.id} />}
                      <Button
                        type="button"
                        $variant="dangerGhost"
                        $size="sm"
                        onClick={() => setUnlinkTarget({ id: account.id, gameNickname: account.gameNickname })}
                      >
                        연동 해제
                      </Button>
                    </AccountCardRow>
                    {isLol && (
                      <PreferredPositionPicker accountId={account.id} mainPosition={account.stats?.mainPosition ?? null} />
                    )}
                  </AccountCard>
                ) : (
                  <AccountCard key={game.id}>
                    <AccountInfo>
                      <AccountName>{getGameDisplayName(game)}</AccountName>
                      <AccountHint>연동하면 티어와 전적을 자동으로 불러와요</AccountHint>
                    </AccountInfo>
                    <Button type="button" $variant="ghost" $size="sm" onClick={() => setLinkingGameId(game.id)}>
                      계정 연동
                    </Button>
                  </AccountCard>
                );
              })}
            </GameAccounts>
            <FieldHint>
              티어는 직접 고칠 수 없어요. 그룹 내부 티어는 전적·평가를 합산해 따로 계산돼요
            </FieldHint>
          </Field>
          <Divider />
          <Footer>
            <Button type="submit" disabled={updateProfile.isPending}>
              저장하고 시작하기
            </Button>
          </Footer>
        </Form>
      </Body>

      <Modal open={linkingGameId !== null} onClose={closeLinkModal}>
        <ModalTitle>게임 계정 연동</ModalTitle>
        <Input
          value={riotIdInput}
          onChange={(e) => setRiotIdInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleLinkGameAccount();
          }}
          placeholder="Hide on bush#KR1"
          autoFocus
        />
        {linkError && <ModalError>{linkError}</ModalError>}
        <ModalActions>
          <Button $variant="ghost" $size="sm" onClick={closeLinkModal}>취소</Button>
          <Button $size="sm" onClick={handleLinkGameAccount} disabled={linkGameAccount.isPending}>
            {linkGameAccount.isPending ? '연동하고 전적 가져오는 중...' : '연동'}
          </Button>
        </ModalActions>
      </Modal>

      <Modal open={unlinkTarget !== null} onClose={() => setUnlinkTarget(null)}>
        <ModalTitle>{unlinkTarget?.gameNickname} 연동을 해제할까요?</ModalTitle>
        <ModalBody>동기화된 전적·숙련도·라인 기록이 모두 삭제되며 되돌릴 수 없어요.</ModalBody>
        <ModalActions>
          <Button $variant="ghost" $size="sm" onClick={() => setUnlinkTarget(null)}>취소</Button>
          <Button $variant="danger" $size="sm" onClick={handleUnlinkConfirmed} disabled={unlinkGameAccount.isPending}>
            {unlinkGameAccount.isPending ? '해제 중...' : '연동 해제'}
          </Button>
        </ModalActions>
      </Modal>
    </Screen>
  );
}

function RefreshAccountButton({ accountId }: { accountId: number }) {
  // 티어/레벨/숙련도/MMR 갱신 + 전적·라인별 MMR 동기화를 한 번에 — /stats 페이지의
  // "지금 갱신"/"전적 동기화"와 동일한 동작으로 맞춤.
  const fullSync = useFullSyncGameAccount(accountId);
  return (
    <Button type="button" $variant="ghost" $size="sm" onClick={() => fullSync.mutate(undefined)} disabled={fullSync.isPending}>
      {fullSync.isPending ? '동기화 중...' : '동기화'}
    </Button>
  );
}

// 지금까지 팀 구성 시 주라인은 무조건 "판수 1위 라인" 자동 추론이었음 — 억지로
// 많이 돌린 라인이 실제 선호 라인과 다를 수 있어서 직접 지정할 수 있게 함
// (2026-09-09). 이미 선택된 라인을 다시 누르면 지정을 해제하고 자동 추론으로
// 되돌아감. subPosition은 스키마/API는 준비돼 있지만 아직 팀 밸런서가 안 써서
// (mainPosition만 봄) 여기서는 뺐음 — 아무 효과 없는 UI를 보여주는 게 더 혼란스러움.
function PreferredPositionPicker({ accountId, mainPosition }: { accountId: number; mainPosition: string | null }) {
  const updatePosition = useUpdatePreferredPosition(accountId);
  return (
    <PositionRow>
      <PositionRowLabel>주라인{mainPosition ? '' : ' (자동)'}</PositionRowLabel>
      {POSITIONS.map((p) => (
        <PositionIconButton
          key={p}
          type="button"
          title={p}
          aria-label={`주라인 ${p}`}
          aria-pressed={mainPosition === p}
          $active={mainPosition === p}
          disabled={updatePosition.isPending}
          onClick={() => updatePosition.mutate({ mainPosition: mainPosition === p ? null : p })}
        >
          <LaneIcon lane={p} size={13} />
        </PositionIconButton>
      ))}
    </PositionRow>
  );
}
