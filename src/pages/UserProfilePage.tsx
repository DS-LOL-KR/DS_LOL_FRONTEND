import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Avatar } from '../components/Avatar/Avatar';
import { useUserProfile } from '../features/profile/hooks';
import { resolveAssetUrl } from '../utils/assetUrl';

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md}px;
  padding-bottom: ${({ theme }) => theme.space.lg}px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const Name = styled.p`
  font: ${({ theme }) => theme.font.title26};
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.color.text.primary};
`;

const JoinedAt = styled.p`
  margin-top: 4px;
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Bio = styled.p`
  margin-top: ${({ theme }) => theme.space.lg}px;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  white-space: pre-wrap;
`;

const EmptyBio = styled.p`
  margin-top: ${({ theme }) => theme.space.lg}px;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  opacity: 0.6;
`;

export function UserProfilePage() {
  const { id } = useParams();
  const userId = Number(id);
  const { data: user, isLoading, isError } = useUserProfile(userId);

  return (
    <PageLayout>
      <Header>
        <Avatar name={user?.nickname ?? '?'} imageUrl={resolveAssetUrl(user?.profileImageUrl)} size={56} />
        <div>
          <Name>{user?.nickname ?? (isLoading ? '불러오는 중...' : '알 수 없는 사용자')}</Name>
          {user && <JoinedAt>{user.createdAt.slice(0, 10)} 가입</JoinedAt>}
        </div>
      </Header>
      {isError ? (
        <EmptyBio>프로필을 불러올 수 없어요.</EmptyBio>
      ) : user?.bio ? (
        <Bio>{user.bio}</Bio>
      ) : (
        <EmptyBio>작성된 자기소개가 없어요.</EmptyBio>
      )}
    </PageLayout>
  );
}
