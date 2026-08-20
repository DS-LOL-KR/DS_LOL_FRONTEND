import { useState } from 'react';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/Button/Button';

interface MmrChange {
  label: string;
  reason: string;
  delta: number;
}

// TODO: this page renders per-group MMR (그룹 내부 티어), but the route is currently
// global (/stats) while useMmr/useRecalculateMmr need a groupId — likely belongs at
// /groups/:id/stats once group-scoped navigation exists. Mocked until then.
const TREND = [40, 59, 45, 64, 82, 69, 91, 78, 101, 123];
const CHANGES: MmrChange[] = [
  { label: '08.08 내전', reason: '승리 +10 · 상대 티어 +2 · 팀원 평가 +2', delta: 14 },
  { label: '08.07 내전', reason: '패배 -12 · 개인 지표 +3', delta: -9 },
  { label: '08.05 발로란트', reason: '승리 +10 · 팀원 평가 +1', delta: 11 },
  { label: '08.03 내전', reason: '승리 +10 · 상대 티어 +2', delta: 12 },
  { label: '08.01 내전', reason: '패배 -12 · 팀원 평가 +4', delta: -8 },
  { label: '07.29 내전', reason: '패배 -12 · 개인 지표 +1', delta: -11 },
];

const Header = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.space.lg}px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const Title = styled.p`
  font: ${({ theme }) => theme.font.title26};
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.color.text.primary};
`;

const Subtitle = styled.p`
  margin-top: 6px;
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Metrics = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.space.md}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const Metric = styled.div`
  flex: 1;
  padding-left: 28px;
  border-left: 1px solid ${({ theme }) => theme.color.border.base};

  &:first-child {
    padding-left: 0;
    border-left: none;
  }
`;

const MetricLabel = styled.p`
  font: ${({ theme }) => theme.font.label12m};
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const MetricValue = styled.p<{ $tone?: 'success' | 'tier2' | 'tier1' }>`
  margin-top: 5px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.6px;
  color: ${({ theme, $tone }) => {
    if ($tone === 'success') return theme.color.state.success;
    if ($tone === 'tier2') return theme.color.tier[2];
    if ($tone === 'tier1') return theme.color.tier[1];
    return theme.color.text.primary;
  }};
`;

const MetricUnit = styled.span`
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Columns = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
`;

const TrendColumn = styled.div`
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.space.lg}px 40px ${({ theme }) => theme.space.lg}px 0;
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.space.md}px;
`;

const ColumnTitle = styled.p`
  font: ${({ theme }) => theme.font.sub15};
  color: ${({ theme }) => theme.color.text.primary};
`;

const ColumnHint = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const BarChart = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
  height: 123px;
`;

const BarGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  justify-content: flex-end;
`;

const Bar = styled.div<{ $height: number; $current: boolean }>`
  width: 100%;
  height: ${({ $height }) => $height}px;
  border-radius: 2px;
  background: ${({ theme, $current }) => ($current ? theme.color.text.primary : theme.color.border.base)};
`;

const BarIndex = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ChangesColumn = styled.div`
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.space.lg}px 0 ${({ theme }) => theme.space.lg}px 40px;
  border-left: 1px solid ${({ theme }) => theme.color.border.base};
`;

const ChangesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.space.sm}px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
`;

const ChangesTitle = styled.p`
  font: ${({ theme }) => theme.font.sub15};
  color: ${({ theme }) => theme.color.text.primary};
`;

const ChangesHint = styled.span`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ChangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm}px;
  padding: 11px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};

  &:last-child {
    border-bottom: none;
  }
`;

const ChangeInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChangeLabel = styled.p`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const ChangeReason = styled.p`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ChangeDelta = styled.span<{ $positive: boolean }>`
  width: 56px;
  text-align: right;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme, $positive }) => ($positive ? theme.color.state.success : theme.color.state.danger)};
`;

export function StatsPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내 전적</Title>
          <Subtitle>전적은 하루 1회 자동 갱신 · 12분 전 갱신</Subtitle>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? '갱신 중...' : '지금 갱신'}
        </Button>
      </Header>
      <Metrics>
        <Metric>
          <MetricLabel>현재 MMR</MetricLabel>
          <MetricValue>1832</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>30일 변동</MetricLabel>
          <MetricValue $tone="success">+52</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>그룹 내부 티어</MetricLabel>
          <MetricValue $tone="tier2">
            2<MetricUnit> 티어</MetricUnit>
          </MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>게임 공식 티어</MetricLabel>
          <MetricValue $tone="tier1">다이아 IV</MetricValue>
        </Metric>
      </Metrics>
      <Columns>
        <TrendColumn>
          <ColumnHeader>
            <ColumnTitle>MMR 추이</ColumnTitle>
            <ColumnHint>최근 10경기</ColumnHint>
          </ColumnHeader>
          <BarChart>
            {TREND.map((height, i) => (
              <BarGroup key={i}>
                <Bar $height={height} $current={i === TREND.length - 1} />
                <BarIndex>{i + 1}</BarIndex>
              </BarGroup>
            ))}
          </BarChart>
        </TrendColumn>
        <ChangesColumn>
          <ChangesHeader>
            <ChangesTitle>변동 내역</ChangesTitle>
            <ChangesHint>항목별 내역</ChangesHint>
          </ChangesHeader>
          {CHANGES.map((c) => (
            <ChangeRow key={c.label}>
              <ChangeInfo>
                <ChangeLabel>{c.label}</ChangeLabel>
                <ChangeReason>{c.reason}</ChangeReason>
              </ChangeInfo>
              <ChangeDelta $positive={c.delta >= 0}>{c.delta > 0 ? `+${c.delta}` : c.delta}</ChangeDelta>
            </ChangeRow>
          ))}
        </ChangesColumn>
      </Columns>
    </PageLayout>
  );
}
