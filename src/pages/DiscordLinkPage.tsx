import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { getErrorStatus } from '../api/client';
import { Avatar } from '../components/Avatar/Avatar';
import { Button } from '../components/Button/Button';
import { CardBox, IconBox } from '../components/Card/Card';
import { Icon, type IconName } from '../components/Icon/Icon';
import { Wordmark } from '../components/Wordmark/Wordmark';
import { useMe } from '../features/auth/hooks';
import { useLinkDiscord } from '../features/profile/hooks';
import { resolveAssetUrl } from '../utils/assetUrl';

// /discord/link?token=… — 디스코드 봇이 DS_LOL 계정이 연결 안 된 유저에게 보내는 링크
// (2026-09-29). 로그인은 RequireAuth + utils/returnTo가 처리해서, 로그아웃 상태로 눌러도
// 로그인 후 이 페이지로 돌아와요. 링크를 열자마자 연결하지 않고 어느 계정에 붙는지
// 보여준 뒤 확인을 받아요 — 여러 Google 계정을 쓰는 사람이 엉뚱한 계정에 붙이지 않게.
// Standalone (no sidebar shell), same centered-card pattern as NotFoundPage.
const Screen = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  min-height: 100vh;
  padding: var(--space-8) var(--space-4);
  background: ${({ theme }) => theme.color.canvas};
`;

const Panel = styled(CardBox)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 420px;
  padding: var(--space-8) var(--space-6);
  text-align: center;

  ${({ theme }) => theme.media.mobile} {
    padding: var(--space-6) var(--space-5);
  }
`;

const Title = styled.h1`
  margin-top: var(--space-4);
  font: ${({ theme }) => theme.type.heading};
  color: ${({ theme }) => theme.color.text.primary};
  text-wrap: balance;
`;

const Body = styled.p`
  margin-top: var(--space-1);
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
  text-wrap: pretty;
`;

// 연결될 DS_LOL 계정 — raised row inside the card.
const AccountRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  margin-top: var(--space-5);
  padding: var(--space-3);
  background: ${({ theme }) => theme.color.surface.subtle};
  border-radius: ${({ theme }) => theme.radius.control}px;
  text-align: left;
`;

const AccountText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const AccountLabel = styled.span`
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

const AccountName = styled.span`
  font: ${({ theme }) => theme.type.bodyStrong};
  color: ${({ theme }) => theme.color.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AccountEmail = styled.span`
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  margin-top: var(--space-6);

  & > * {
    flex: 1;
  }
`;

const ErrorText = styled.p`
  margin-top: var(--space-3);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.state.danger};
`;

function Result({ icon, title, body, action }: { icon: IconName; title: string; body: ReactNode; action?: ReactNode }) {
  return (
    <>
      <IconBox aria-hidden="true">
        <Icon name={icon} />
      </IconBox>
      <Title>{title}</Title>
      <Body>{body}</Body>
      <Actions>
        {action ?? (
          <Button as={Link} to="/groups">
            DS_LOL로 가기
          </Button>
        )}
      </Actions>
    </>
  );
}

export function DiscordLinkPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const { data: me } = useMe();
  const linkDiscord = useLinkDiscord();
  const status = linkDiscord.isError ? getErrorStatus(linkDiscord.error) : undefined;

  let content: ReactNode;
  if (!token) {
    content = (
      <Result icon="link" title="연결 링크가 올바르지 않아요" body="디스코드에서 연결 링크를 다시 눌러 주세요." />
    );
  } else if (linkDiscord.isSuccess) {
    content = (
      <Result icon="check" title="연결됐어요!" body="디스코드로 돌아가서 다시 눌러 주세요." />
    );
  } else if (status === 400) {
    content = (
      <Result
        icon="history"
        title="링크가 만료됐어요"
        body="연결 링크는 10분 동안만 쓸 수 있어요. 디스코드에서 다시 눌러 주세요."
      />
    );
  } else if (status === 409) {
    content = (
      <Result
        icon="user"
        title="이미 다른 계정에 연결된 디스코드 계정이에요"
        body="그 DS_LOL 계정의 프로필에서 디스코드 연결을 해제한 뒤 다시 시도해 주세요."
      />
    );
  } else {
    content = (
      <>
        <IconBox aria-hidden="true">
          <Icon name="chat" />
        </IconBox>
        <Title>이 디스코드 계정을 DS_LOL 계정에 연결할까요?</Title>
        <Body>연결하면 디스코드 봇이 이 계정을 알아볼 수 있어요.</Body>
        {me && (
          <AccountRow>
            <Avatar name={me.nickname} imageUrl={resolveAssetUrl(me.profileImageUrl)} size={36} />
            <AccountText>
              <AccountLabel>연결할 DS_LOL 계정</AccountLabel>
              <AccountName>{me.nickname}</AccountName>
              <AccountEmail>{me.email}</AccountEmail>
            </AccountText>
          </AccountRow>
        )}
        {linkDiscord.isError && (
          <ErrorText role="alert">
            {linkDiscord.error.message || '연결하지 못했어요. 잠시 후 다시 시도해 주세요.'}
          </ErrorText>
        )}
        <Actions>
          <Button as={Link} to="/groups" $variant="ghost">
            취소
          </Button>
          <Button
            $variant="primary"
            onClick={() => linkDiscord.mutate(token)}
            disabled={linkDiscord.isPending}
            aria-busy={linkDiscord.isPending || undefined}
          >
            {linkDiscord.isPending ? '연결 중…' : linkDiscord.isError ? '다시 시도' : '연결하기'}
          </Button>
        </Actions>
      </>
    );
  }

  return (
    <Screen>
      <Link to="/groups" aria-label="DS_LOL 홈">
        <Wordmark size={20} />
      </Link>
      <Panel as="section" aria-live="polite">
        {content}
      </Panel>
    </Screen>
  );
}
