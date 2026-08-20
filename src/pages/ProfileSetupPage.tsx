import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Input, Textarea } from '../components/Input/Input';
import { Button } from '../components/Button/Button';
import { useProfile, useUpdateProfile } from '../features/profile/hooks';

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

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      { riotId: profile?.riotId },
      { onSuccess: () => navigate('/groups') },
    );
  };

  return (
    <Screen>
      <TopBar>
        <Brand>DS_LOL</Brand>
        <PageName>프로필 설정</PageName>
      </TopBar>
      <Body>
        <Form onSubmit={handleSave}>
          <Heading>프로필 설정</Heading>
          <HeadingSub>그룹원들에게 보여질 정보예요</HeadingSub>
          <Spacer $size={24} />
          <Divider />
          <Row>
            <Avatar />
            <AvatarInfo>
              <AvatarName>프로필 이미지</AvatarName>
              <AvatarHint>JPG, PNG · 5MB 이하</AvatarHint>
            </AvatarInfo>
            <Button as="label" $variant="ghost" $size="sm">
              파일 선택
              <FileInput type="file" accept="image/png,image/jpeg" />
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
              <AccountCard>
                <AccountInfo>
                  <AccountNameRow>
                    <AccountName $linked>Hide on bush #KR1</AccountName>
                    <LinkedTag>연동됨</LinkedTag>
                  </AccountNameRow>
                  <AccountHint>티어는 라이엇 API에서 자동으로 가져와요 · 12분 전 동기화</AccountHint>
                </AccountInfo>
                <TierBlock>
                  <TierLabel>게임 티어</TierLabel>
                  <TierValue>다이아몬드 IV</TierValue>
                </TierBlock>
                <Button $variant="ghost" $size="sm">동기화</Button>
              </AccountCard>
              <AccountCard>
                <AccountInfo>
                  <AccountName>발로란트</AccountName>
                  <AccountHint>연동하면 티어와 전적을 자동으로 불러와요</AccountHint>
                </AccountInfo>
                <Button $variant="ghost" $size="sm">계정 연동</Button>
              </AccountCard>
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
    </Screen>
  );
}
