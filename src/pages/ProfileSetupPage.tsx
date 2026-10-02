import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Input, Textarea } from '../components/Input/Input';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal/Modal';
import { LaneLabel } from '../components/LaneIcon/LaneIcon';
import { Wordmark } from '../components/Wordmark/Wordmark';
import { Avatar } from '../components/Avatar/Avatar';
import { CardBox, SectionHeader } from '../components/Card/Card';
import { Icon } from '../components/Icon/Icon';
import { PageHeader, PageTitle, PageSubtitle } from '../components/layout/PageHeader';
import { useProfile, useUnlinkDiscord, useUpdateProfile, useUploadProfileImage } from '../features/profile/hooks';
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

// Standalone (no sidebar shell): /onboarding runs before the user has a group,
// and the same screen doubles as "내 프로필" edit.
const Screen = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.color.canvas};
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  height: 56px;
  padding: 0 var(--space-6);
  background: ${({ theme }) => theme.color.sidebar};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};

  ${({ theme }) => theme.media.mobile} {
    padding: 0 var(--space-4);
  }
`;

const Body = styled.main`
  display: flex;
  justify-content: center;
  padding: var(--space-12) var(--space-6);

  ${({ theme }) => theme.media.mobile} {
    padding: var(--space-6) var(--space-4) var(--space-12);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--card-gap);
  width: 100%;
  max-width: 720px;
  min-width: 0;
`;

const Header = styled(PageHeader)`
  margin-bottom: var(--space-3);
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  & + & {
    margin-top: var(--space-5);
  }
`;

const FieldLabel = styled.label`
  font: ${({ theme }) => theme.type.labelStrong};
  color: ${({ theme }) => theme.color.text.primary};
`;

const FieldHint = styled.span`
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

// Raised row inside the card (no card-in-card).
const RaisedRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  background: ${({ theme }) => theme.color.surface.subtle};
  border: 1px solid ${({ theme }) => theme.color.border.strong};
  border-radius: ${({ theme }) => theme.radius.control}px;
`;

const AvatarRow = styled(RaisedRow)`
  flex-direction: row;
  align-items: center;
  margin-bottom: var(--space-5);
`;

const AvatarInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AvatarName = styled.p`
  font: ${({ theme }) => theme.type.bodyStrong};
  color: ${({ theme }) => theme.color.text.primary};
`;

const AvatarHint = styled.p`
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const FileInput = styled.input`
  display: none;
`;

const GameAccounts = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const AccountTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-4);
`;

const AccountInfo = styled.div`
  flex: 1 1 220px;
  min-width: 0;
`;

const AccountNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
`;

const AccountName = styled.span<{ $linked?: boolean }>`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: ${({ theme }) => theme.type.bodyStrong};
  color: ${({ theme, $linked }) => ($linked ? theme.color.text.primary : theme.color.text.secondary)};
`;

// Connection state = 6px dot + text (same pattern as the sidebar Discord card).
const LinkedTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.secondary};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    background: ${({ theme }) => theme.color.state.success};
  }
`;

const AccountHint = styled.p`
  margin-top: 2px;
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.secondary};
`;

// Riot official tier — uncolored text; only group tiers (1~5) get tier colors.
const TierBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;

  ${({ theme }) => theme.media.mobile} {
    align-items: flex-start;
  }
`;

const TierLabel = styled.span`
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

const TierValue = styled.span`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const AccountActions = styled.div`
  display: flex;
  gap: var(--space-2);

  ${({ theme }) => theme.media.mobile} {
    flex: 1 1 100%;

    & > * {
      flex: 1;
    }
  }
`;

const PositionRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid ${({ theme }) => theme.color.border.strong};
`;

const PositionRowLabel = styled.span`
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.secondary};
`;

// Segmented-style toggle track (docs/design-system.md → Segmented Control):
// selected = hover fill + primary text, never a white fill.
const PositionTrack = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 2px;
  padding: 2px;
  background: ${({ theme }) => theme.color.surface.card};
  border: 1px solid ${({ theme }) => theme.color.border.base};
  border-radius: ${({ theme }) => theme.radius.control}px;
`;

const PositionButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: 32px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.badge}px;
  background: ${({ theme, $active }) => ($active ? theme.color.surface.hover : 'transparent')};
  color: ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.text.secondary)};
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.color.text.primary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  ${({ theme }) => theme.media.mobile} {
    height: 40px;
  }

  /* Icon only on phones — the abbreviation stays in aria-label/title. */
  ${({ theme }) => theme.media.narrow} {
    & > span {
      gap: 0;
      font-size: 0;
    }
  }
`;

const CardFootnote = styled.p`
  margin-top: var(--space-3);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: var(--space-3);

  ${({ theme }) => theme.media.mobile} {
    & > * {
      flex: 1;
    }
  }
`;

const ModalTitle = styled.h2`
  font: ${({ theme }) => theme.type.heading};
  color: ${({ theme }) => theme.color.text.primary};
  margin-bottom: var(--space-4);
`;

const ModalError = styled.p`
  margin-top: var(--space-2);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.state.danger};
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
  const unlinkDiscord = useUnlinkDiscord();
  const [unlinkDiscordOpen, setUnlinkDiscordOpen] = useState(false);

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
        <Wordmark size={18} />
        <Button $variant="ghost" onClick={handleLogout} disabled={logout.isPending}>
          로그아웃
        </Button>
      </TopBar>
      <Body>
        <Form onSubmit={handleSave}>
          <Header>
            <div>
              <PageTitle>프로필 설정</PageTitle>
              <PageSubtitle>그룹원들에게 보여질 정보예요</PageSubtitle>
            </div>
          </Header>

          <CardBox>
            <SectionHeader icon={<Icon name="user" />} title="프로필" description="이름과 사진은 그룹 안에서 보여요" />
            <AvatarRow>
              <Avatar
                name={nickname || profile?.nickname || '?'}
                imageUrl={resolveAssetUrl(profile?.profileImageUrl)}
                size={48}
              />
              <AvatarInfo>
                <AvatarName>프로필 이미지</AvatarName>
                <AvatarHint>JPG, PNG · 5MB 이하</AvatarHint>
              </AvatarInfo>
              <Button as="label">
                {uploadProfileImage.isPending ? '업로드 중...' : '파일 선택'}
                <FileInput type="file" accept="image/png,image/jpeg" onChange={handleAvatarChange} />
              </Button>
            </AvatarRow>
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
          </CardBox>

          <CardBox>
            <SectionHeader
              icon={<Icon name="link" />}
              title="게임 계정 연동"
              description="연동하면 티어와 전적을 자동으로 불러와요"
            />
            <GameAccounts>
              {(!games || games.length === 0) && <AccountHint>연동 가능한 게임을 불러오는 중이에요</AccountHint>}
              {(games ?? []).map((game) => {
                const account = (gameAccounts ?? []).find((a) => a.gameId === game.id);
                // 전적 갱신/동기화, 주라인 선택은 아직 LOL 전용 라이엇 API·라인 개념이라
                // (발로란트는 계정 연동까지만, 2026-09-13) 게임별로 분기함.
                const isLol = game.code === 'LOL';
                return account ? (
                  <RaisedRow key={game.id}>
                    <AccountTop>
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
                      <AccountActions>
                        {isLol && <RefreshAccountButton accountId={account.id} />}
                        <Button
                          type="button"
                          $variant="danger"
                          onClick={() => setUnlinkTarget({ id: account.id, gameNickname: account.gameNickname })}
                        >
                          연동 해제
                        </Button>
                      </AccountActions>
                    </AccountTop>
                    {isLol && (
                      <PreferredPositionPicker accountId={account.id} mainPosition={account.stats?.mainPosition ?? null} />
                    )}
                  </RaisedRow>
                ) : (
                  <RaisedRow key={game.id}>
                    <AccountTop>
                      <AccountInfo>
                        <AccountName>{getGameDisplayName(game)}</AccountName>
                        <AccountHint>연동하면 티어와 전적을 자동으로 불러와요</AccountHint>
                      </AccountInfo>
                      <AccountActions>
                        <Button type="button" onClick={() => setLinkingGameId(game.id)}>
                          계정 연동
                        </Button>
                      </AccountActions>
                    </AccountTop>
                  </RaisedRow>
                );
              })}
            </GameAccounts>
            <CardFootnote>
              티어는 직접 고칠 수 없어요. 그룹 내부 티어는 전적·평가를 합산해 따로 계산돼요
            </CardFootnote>
          </CardBox>

          {/* 디스코드 봇 계정 연결(2026-09-29) — 연결은 봇이 보내는 /discord/link 링크로만
              해요. 여기서는 상태 확인과 해제만. */}
          <CardBox>
            <SectionHeader
              icon={<Icon name="chat" />}
              title="디스코드 계정"
              description="연결하면 디스코드 봇이 이 계정을 알아볼 수 있어요"
            />
            <RaisedRow>
              <AccountTop>
                <AccountInfo>
                  <AccountNameRow>
                    <AccountName $linked={Boolean(profile?.discordUserId)}>
                      {profile?.discordUserId ? '디스코드' : '연결 안 됨'}
                    </AccountName>
                    {profile?.discordUserId && <LinkedTag>연결됨</LinkedTag>}
                  </AccountNameRow>
                  <AccountHint>
                    {profile?.discordUserId
                      ? '디스코드 봇 명령어를 쓰면 이 계정으로 처리돼요'
                      : '디스코드에서 봇 명령어를 쓰면 연결 링크를 보내줘요'}
                  </AccountHint>
                </AccountInfo>
                {profile?.discordUserId && (
                  <AccountActions>
                    <Button type="button" $variant="danger" onClick={() => setUnlinkDiscordOpen(true)}>
                      연결 해제
                    </Button>
                  </AccountActions>
                )}
              </AccountTop>
            </RaisedRow>
          </CardBox>

          <Footer>
            <Button type="submit" $variant="primary" disabled={updateProfile.isPending}>
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
          aria-label="라이엇 ID (이름#태그)"
          aria-invalid={linkError ? true : undefined}
          autoFocus
        />
        {linkError && <ModalError>{linkError}</ModalError>}
        <ModalActions>
          <Button $variant="ghost" onClick={closeLinkModal}>취소</Button>
          <Button $variant="primary" onClick={handleLinkGameAccount} disabled={linkGameAccount.isPending}>
            {linkGameAccount.isPending ? '연동하고 전적 가져오는 중...' : '연동'}
          </Button>
        </ModalActions>
      </Modal>

      <Modal open={unlinkTarget !== null} onClose={() => setUnlinkTarget(null)}>
        <ModalTitle>{unlinkTarget?.gameNickname} 연동을 해제할까요?</ModalTitle>
        <ModalBody>동기화된 전적·숙련도·라인 기록이 모두 삭제되며 되돌릴 수 없어요.</ModalBody>
        <ModalActions>
          <Button $variant="ghost" onClick={() => setUnlinkTarget(null)}>취소</Button>
          <Button $variant="danger" onClick={handleUnlinkConfirmed} disabled={unlinkGameAccount.isPending}>
            {unlinkGameAccount.isPending ? '해제 중...' : '연동 해제'}
          </Button>
        </ModalActions>
      </Modal>

      <Modal open={unlinkDiscordOpen} onClose={() => setUnlinkDiscordOpen(false)}>
        <ModalTitle>디스코드 연결을 해제할까요?</ModalTitle>
        <ModalBody>
          해제하면 디스코드 봇이 이 계정을 알아보지 못해요. 디스코드에서 /내전모집을 누르면 연결 링크가 다시 와요. 지난
          내전 기록은 그대로 남아요.
        </ModalBody>
        {unlinkDiscord.isError && (
          <ModalError>{unlinkDiscord.error.message || '연결 해제에 실패했어요'}</ModalError>
        )}
        <ModalActions>
          <Button $variant="ghost" onClick={() => setUnlinkDiscordOpen(false)}>취소</Button>
          <Button
            $variant="danger"
            onClick={() => unlinkDiscord.mutate(undefined, { onSuccess: () => setUnlinkDiscordOpen(false) })}
            disabled={unlinkDiscord.isPending}
          >
            {unlinkDiscord.isPending ? '해제 중...' : '연결 해제'}
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
    <Button type="button" onClick={() => fullSync.mutate(undefined)} disabled={fullSync.isPending}>
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
      <PositionTrack>
        {POSITIONS.map((p) => (
          <PositionButton
            key={p}
            type="button"
            title={p}
            aria-label={`주라인 ${p}`}
            aria-pressed={mainPosition === p}
            $active={mainPosition === p}
            disabled={updatePosition.isPending}
            onClick={() => updatePosition.mutate({ mainPosition: mainPosition === p ? null : p })}
          >
            <LaneLabel lane={p} main={mainPosition === p} />
          </PositionButton>
        ))}
      </PositionTrack>
    </PositionRow>
  );
}
