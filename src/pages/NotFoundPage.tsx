import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  text-align: center;
`;

const Code = styled.p`
  font: ${({ theme }) => theme.font.title22};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Title = styled.h1`
  margin-top: ${({ theme }) => theme.space.xs}px;
  font: ${({ theme }) => theme.font.title26};
  color: ${({ theme }) => theme.color.text.primary};
`;

const Body = styled.p`
  margin-top: ${({ theme }) => theme.space.sm}px;
  font: ${({ theme }) => theme.font.body14};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const HomeLink = styled(Link)`
  margin-top: ${({ theme }) => theme.space.xl}px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 22px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background: ${({ theme }) => theme.color.text.primary};
  color: #121315;
  font: ${({ theme }) => theme.font.body14b};
`;

export function NotFoundPage() {
  return (
    <Screen>
      <Code>404</Code>
      <Title>페이지를 찾을 수 없어요</Title>
      <Body>주소가 잘못되었거나 삭제된 페이지예요.</Body>
      <HomeLink to="/">DS_LOL 홈으로 돌아가기</HomeLink>
    </Screen>
  );
}
