import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Input, Textarea } from '../components/Input/Input';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal/Modal';
import { useProfile, useUpdateProfile, useUploadProfileImage } from '../features/profile/hooks';
import { useLogout } from '../features/auth/hooks';
import {
  useGames,
  useLinkGameAccount,
  useMyGameAccounts,
  useFullSyncGameAccount,
  useUnlinkGameAccount,
} from '../features/game-accounts/hooks';
import { resolveAssetUrl } from '../utils/assetUrl';

const Screen = styled.div`
  min-height: 100vh;
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 ${({ theme }) => theme.space.lg}px;
  background: ${({ theme }) => theme.color.surface.subtle};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const Brand = styled.span`
  font: ${({ theme }) => theme.font.sub15};
  letter-spacing: 0.4px;
  color: ${({ theme }) => theme.color.text.primary};
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
  padding: ${({ theme }) => theme.space.xl * 2}px 0;
`;

const Form = styled.form`
  width: 620px;
`;

const Heading = styled.p`
  font: ${({ theme }) => theme.font.title26};
  letter-spacing: -0.5px;
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

const FieldLabel = styled.span`
  font: ${({ theme }) => theme.font.label12m};
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const FieldHint = styled.span`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Avatar = styled.div<{ $src?: string }>`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
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

const GameAccounts = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm}px;
`;

const AccountCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md}px;
  padding: ${({ theme }) => theme.space.md}px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  border: 1px solid ${({ theme }) => theme.color.border.base};
  background: ${({ theme }) => theme.color.surface.subtle};
`;

const AccountInfo = styled.div`
  flex: 1;
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
  color: ${({ theme }) => theme.color.tier[2]};
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
  const linkGameAccount = useLinkGameAccount();
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
    linkGameAccount.mutate(
      { gameId: linkingGameId, gameName, tagLine },
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
        <Brand>DS_LOL</Brand>
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
            <FieldLabel>이름</FieldLabel>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="재현"
            />
            <FieldHint>그룹 안에서 표시되는 이름이에요</FieldHint>
          </Field>
          <Divider />
          <Field>
            <FieldLabel>자기소개</FieldLabel>
            <Textarea
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
                return account ? (
                  <AccountCard key={game.id}>
                    <AccountInfo>
                      <AccountNameRow>
                        <AccountName $linked>{account.gameNickname}</AccountName>
                        <LinkedTag>연동됨</LinkedTag>
                      </AccountNameRow>
                      <AccountHint>티어는 라이엇 API에서 자동으로 가져와요 · {account.createdAt.slice(0, 10)} 연동</AccountHint>
                    </AccountInfo>
                    <TierBlock>
                      <TierLabel>게임 티어</TierLabel>
                      <TierValue>{account.stats?.officialTier ?? '미확인'}</TierValue>
                    </TierBlock>
                    <RefreshAccountButton accountId={account.id} />
                    <Button
                      type="button"
                      $variant="dangerGhost"
                      $size="sm"
                      onClick={() => setUnlinkTarget({ id: account.id, gameNickname: account.gameNickname })}
                    >
                      연동 해제
                    </Button>
                  </AccountCard>
                ) : (
                  <AccountCard key={game.id}>
                    <AccountInfo>
                      <AccountName>{game.name}</AccountName>
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
          placeholder="Hide on bush#KR1"
          autoFocus
        />
        {linkError && <ModalError>{linkError}</ModalError>}
        <ModalActions>
          <Button $variant="ghost" $size="sm" onClick={closeLinkModal}>취소</Button>
          <Button $size="sm" onClick={handleLinkGameAccount} disabled={linkGameAccount.isPending}>
            {linkGameAccount.isPending ? '연동 중...' : '연동'}
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
