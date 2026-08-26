import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Screen = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.space.xl}px ${({ theme }) => theme.space.lg}px;
`;

const Panel = styled.div`
  width: 100%;
  max-width: 720px;
`;

const BackLink = styled(Link)`
  font: ${({ theme }) => theme.font.small13};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Title = styled.h1`
  margin-top: ${({ theme }) => theme.space.md}px;
  font: ${({ theme }) => theme.font.title26};
  color: ${({ theme }) => theme.color.text.primary};
`;

const SectionTitle = styled.h2`
  margin-top: ${({ theme }) => theme.space.xl}px;
  font: ${({ theme }) => theme.font.sub17};
  color: ${({ theme }) => theme.color.text.primary};
`;

const Body = styled.p`
  margin-top: ${({ theme }) => theme.space.sm}px;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  line-height: 1.7;
`;

const List = styled.ul`
  margin-top: ${({ theme }) => theme.space.sm}px;
  padding-left: 20px;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
  line-height: 1.7;
`;

const SubHeading = styled.p`
  margin-top: ${({ theme }) => theme.space.md}px;
  font: ${({ theme }) => theme.font.label12m};
  color: ${({ theme }) => theme.color.text.primary};
`;

const EffectiveDate = styled.p`
  margin-top: ${({ theme }) => theme.space.xl}px;
  padding-top: ${({ theme }) => theme.space.md}px;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

export function PrivacyPage() {
  return (
    <Screen>
      <Panel>
        <BackLink to="/">← DS_LOL로 돌아가기</BackLink>
        <Title>개인정보처리방침</Title>
        <Body>
          DS_LOL(이하 "서비스")은 이용자의 개인정보를 아래와 같이 수집·이용·보관합니다.
        </Body>

        <SectionTitle>1. 수집하는 개인정보 항목</SectionTitle>
        <SubHeading>구글 로그인 시 (필수)</SubHeading>
        <List>
          <li>이메일 주소</li>
          <li>이름, 프로필 사진 (구글 계정 기본 정보)</li>
        </List>
        <SubHeading>서비스 이용 중 직접 입력 (선택)</SubHeading>
        <List>
          <li>닉네임, 자기소개</li>
          <li>업로드한 프로필 이미지</li>
        </List>
        <SubHeading>라이엇 게임 계정 연동 시 (선택)</SubHeading>
        <List>
          <li>라이엇 ID(소환사명#태그), puuid</li>
          <li>게임 티어, 소환사 레벨, 프로필 아이콘</li>
          <li>챔피언 숙련도, 매치 기록(챔피언, 포지션, KDA, 승패, 매치 시각 등)</li>
          <li>라인별 전적 및 내부 MMR</li>
        </List>
        <SubHeading>서비스 이용 과정에서 생성되는 정보</SubHeading>
        <List>
          <li>그룹 가입/탈퇴 이력, 내전 참여 기록 및 결과</li>
          <li>내전 종료 후 팀원 간 상호 평가(점수, 코멘트)</li>
        </List>
        <SubHeading>자동 수집 정보</SubHeading>
        <List>
          <li>로그인 상태 유지를 위한 인증 쿠키</li>
        </List>

        <SectionTitle>2. 개인정보 수집·이용 목적</SectionTitle>
        <List>
          <li>회원 식별 및 로그인</li>
          <li>그룹 내 팀 자동 구성 및 내부 티어 산정</li>
          <li>개인 전적·숙련도 통계 제공</li>
          <li>매너 점수 등 그룹 내 신뢰도 지표 산출</li>
        </List>

        <SectionTitle>3. 개인정보의 보유 및 이용 기간</SectionTitle>
        <Body>회원 탈퇴 시 또는 게임 계정 연동 해제 시 지체 없이 파기합니다.</Body>
        <Body>
          게임 계정 연동을 해제하면 해당 계정으로 동기화된 전적·숙련도·라인 기록도 함께
          삭제됩니다.
        </Body>

        <SectionTitle>4. 개인정보 제3자 제공</SectionTitle>
        <Body>
          서비스는 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 닉네임, 프로필 사진,
          게임 티어, 전적, 매너 점수 등 일부 정보는 같은 그룹에 속한 다른 이용자에게 노출될
          수 있습니다.
        </Body>

        <SectionTitle>5. 외부 서비스 연동</SectionTitle>
        <List>
          <li>Google: 로그인 인증 목적</li>
          <li>Riot Games API: 이용자가 직접 연동한 게임 계정의 전적·티어 조회 목적</li>
        </List>

        <SectionTitle>6. 이용자의 권리</SectionTitle>
        <Body>이용자는 언제든지 다음을 직접 수행할 수 있습니다.</Body>
        <List>
          <li>프로필(닉네임, 자기소개, 프로필 사진) 수정</li>
          <li>연동한 게임 계정 해제</li>
          <li>회원 탈퇴</li>
        </List>

        <SectionTitle>7. 문의처</SectionTitle>
        <Body>개인정보 관련 문의: qlalfql123@gmail.com</Body>

        <EffectiveDate>시행일: 2026년 8월 26일</EffectiveDate>
      </Panel>
    </Screen>
  );
}
