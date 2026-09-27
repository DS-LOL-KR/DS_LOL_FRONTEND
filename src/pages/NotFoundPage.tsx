import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { CardBox, IconBox } from '../components/Card/Card';
import { Button } from '../components/Button/Button';
import { Icon } from '../components/Icon/Icon';

// Standalone (no sidebar shell) — the route may not exist for a signed-out visitor either.
// docs/design-system.md → Empty state: 32px icon box + heading + label + one button.
const Screen = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-8) var(--space-4);
  background: ${({ theme }) => theme.color.canvas};
`;

const Panel = styled(CardBox)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  padding: var(--space-8) var(--space-6);
  text-align: center;
`;

const Code = styled.p`
  margin-top: var(--space-4);
  font: ${({ theme }) => theme.type.captionStrong};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.muted};
`;

const Title = styled.h1`
  margin-top: var(--space-1);
  font: ${({ theme }) => theme.type.heading};
  color: ${({ theme }) => theme.color.text.primary};
`;

const Body = styled.p`
  margin-top: var(--space-1);
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const HomeButton = styled(Button)`
  margin-top: var(--space-6);
`;

export function NotFoundPage() {
  return (
    <Screen>
      <Panel>
        <IconBox aria-hidden="true">
          <Icon name="close" />
        </IconBox>
        <Code>404</Code>
        <Title>페이지를 찾을 수 없어요</Title>
        <Body>주소가 잘못되었거나 삭제된 페이지예요.</Body>
        <HomeButton as={Link} to="/" $variant="primary">
          DS_LOL 홈으로 돌아가기
        </HomeButton>
      </Panel>
    </Screen>
  );
}
