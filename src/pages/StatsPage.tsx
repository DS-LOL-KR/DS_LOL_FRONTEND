import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import {
  PageHeader as Header,
  PageTitle as Title,
  PageSubtitle as Subtitle,
  HeaderActions,
} from '../components/layout/PageHeader';
import { Grid, Col, Stack } from '../components/layout/Grid';
import { Card, SectionHeader } from '../components/Card/Card';
import { Kpi, Delta } from '../components/Kpi/Kpi';
import { Table, type Column } from '../components/Table/Table';
import { WinRateBar } from '../components/WinRateBar/WinRateBar';
import { LaneIcon, LaneLabel, type Lane } from '../components/LaneIcon/LaneIcon';
import { Icon } from '../components/Icon/Icon';
import { MmrSummary } from '../components/MmrSummary/MmrSummary';
import { Button } from '../components/Button/Button';
import { useMyMmrHistory } from '../features/matches/hooks';
import {
  useChampionMasteries,
  useChampionStats,
  useGameAccountFullStats,
  useMatchHistory,
  useMyGameAccounts,
  useFullSyncGameAccount,
} from '../features/game-accounts/hooks';
import type {
  ChampionMastery,
  ChampionStat,
  MatchHistoryEntry,
  PositionStat,
} from '../features/game-accounts/types';
import type { TierEntry } from '../features/tiers/types';
import { useGroup } from '../features/groups/hooks';
import { useTierTable } from '../features/tiers/hooks';
import { useMe } from '../features/auth/hooks';
import { useActiveGroupId } from '../utils/activeGroup';
import { useChampionName } from '../features/champions/hooks';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { formatDate, formatDateTime } from '../utils/formatDateTime';

// ---------------------------------------------------------------------------
// Record building blocks — 내 전적(StatsPage)과 다른 사람 프로필(UserProfilePage)이
// 같은 구성을 쓰므로 여기서 export해서 둘 다 씀. (공용 컴포넌트로 옮길 후보)
// ---------------------------------------------------------------------------

const LANES: Lane[] = ['TOP', 'JUG', 'MID', 'ADC', 'SUP'];

// 라이엇 매치 기록은 TOP/JUNGLE/MIDDLE/BOTTOM/UTILITY 원본 값이라 표시 전에
// 내전 배정용 약어로 바꿈. 라인 통계(positionStats)는 이미 약어지만 같은 함수로 받음.
const RIOT_TO_LANE: Record<string, Lane> = {
  TOP: 'TOP',
  JUNGLE: 'JUG',
  JUG: 'JUG',
  MIDDLE: 'MID',
  MID: 'MID',
  BOTTOM: 'ADC',
  ADC: 'ADC',
  UTILITY: 'SUP',
  SUP: 'SUP',
};

function toLane(position: string | null | undefined): Lane | null {
  return position ? (RIOT_TO_LANE[position] ?? null) : null;
}

const pct = (wins: number, total: number) => Math.round((wins / total) * 100);

const Muted = styled.span`
  color: ${({ theme }) => theme.color.text.muted};
`;

const EmptyHint = styled.p`
  padding: var(--space-3) 0;
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const InsetEmpty = styled(EmptyHint)`
  padding: 0 var(--card-padding) var(--card-padding);
`;

// §3.7 Recent Form — "승"/"패" 텍스트 칩. 내전 결과 표의 결과 칸도 같은 칩을 씀.
const ResultChip = styled.span<{ $win: boolean }>`
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.radius.badge}px;
  font: ${({ theme }) => theme.type.badge};
  background: ${({ theme, $win }) => ($win ? theme.color.state.successSoft : theme.color.surface.subtle)};
  color: ${({ theme, $win }) => ($win ? theme.color.state.success : theme.color.text.muted)};
`;

const FormList = styled.ol`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
`;

// 최신 경기가 왼쪽. match-history는 최신순으로 내려옴. 10판 미만이면 있는 만큼만.
export function RecentForm({ matches }: { matches: MatchHistoryEntry[] }) {
  const recent = matches.slice(0, 10);
  if (recent.length === 0) return null;
  const label = recent.map((m) => (m.win ? '승' : '패')).join(' ');
  return (
    <FormList aria-label={`최근 ${recent.length}판: ${label}`}>
      {recent.map((m) => (
        <li key={m.matchId}>
          <ResultChip $win={m.win}>{m.win ? '승' : '패'}</ResultChip>
        </li>
      ))}
    </FormList>
  );
}

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2) var(--space-4);
  margin: 0 var(--card-padding) var(--space-4);
  padding: var(--space-3);
  background: ${({ theme }) => theme.color.surface.subtle};
  border-radius: ${({ theme }) => theme.radius.control}px;
`;

const FormLabel = styled.span`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};

  b {
    font: ${({ theme }) => theme.type.labelStrong};
    font-variant-numeric: tabular-nums;
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

const LaneValue = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
`;

export interface RecordKpisProps {
  /** 이 그룹 내전 승/패. null = 그룹 기록 없음. */
  customRecord: { wins: number; losses: number } | null;
  customEmptyHint: string;
  matches: MatchHistoryEntry[];
  positionStats: PositionStat[];
  mainPosition: string | null;
  hasAccount: boolean;
}

// KPI 4장: 내전 승률 · 라이엇 승률(판수) · 주 라인 · 평균 KDA. 전부 실제 데이터만,
// 없으면 '—' + 안내 caption.
export function RecordKpis({
  customRecord,
  customEmptyHint,
  matches,
  positionStats,
  mainPosition,
  hasAccount,
}: RecordKpisProps) {
  const theme = useTheme();
  const noAccountHint = '라이엇 계정을 연동하면 표시돼요';
  const customTotal = customRecord ? customRecord.wins + customRecord.losses : 0;

  const riotWins = matches.filter((m) => m.win).length;
  const riotLosses = matches.length - riotWins;
  const kills = matches.reduce((s, m) => s + m.kills, 0);
  const deaths = matches.reduce((s, m) => s + m.deaths, 0);
  const assists = matches.reduce((s, m) => s + m.assists, 0);

  // 주 라인: 직접 지정(또는 서버 자동 추론) 값 → 없으면 라인 통계의 판수 1위.
  const playedLanes = positionStats.filter((p) => p.gamesPlayed > 0);
  const topPlayed = [...playedLanes].sort((a, b) => b.gamesPlayed - a.gamesPlayed)[0];
  const mainLane = toLane(mainPosition) ?? toLane(topPlayed?.position);
  const mainLaneStat = playedLanes.find((p) => toLane(p.position) === mainLane);

  const dash = '—';
  const mutedColor = theme.color.text.muted;

  return (
    <>
      <Col $span={3}>
        {customRecord && customTotal > 0 ? (
          <Kpi
            label="내전 승률"
            value={pct(customRecord.wins, customTotal)}
            unit="%"
            sub={`${customRecord.wins.toLocaleString()}승 ${customRecord.losses.toLocaleString()}패`}
          />
        ) : (
          <Kpi label="내전 승률" value={dash} color={mutedColor} sub={customEmptyHint} />
        )}
      </Col>
      <Col $span={3}>
        {matches.length > 0 ? (
          <Kpi
            label="라이엇 승률"
            value={pct(riotWins, matches.length)}
            unit="%"
            sub={`최근 ${matches.length}판 · ${riotWins}승 ${riotLosses}패`}
          />
        ) : (
          <Kpi
            label="라이엇 승률"
            value={dash}
            color={mutedColor}
            sub={hasAccount ? '동기화된 매치가 없어요' : noAccountHint}
          />
        )}
      </Col>
      <Col $span={3}>
        {mainLane ? (
          <Kpi
            label="주 라인"
            value={
              <LaneValue>
                <LaneIcon lane={mainLane} size={22} />
                {mainLane}
              </LaneValue>
            }
            sub={
              mainLaneStat
                ? `${mainLaneStat.gamesPlayed.toLocaleString()}판 · 승률 ${Math.round(mainLaneStat.winRate * 100)}%`
                : '라인 기록 없음'
            }
          />
        ) : (
          <Kpi
            label="주 라인"
            value={dash}
            color={mutedColor}
            sub={hasAccount ? '아직 집계된 라인 기록이 없어요' : noAccountHint}
          />
        )}
      </Col>
      <Col $span={3}>
        {matches.length > 0 ? (
          <Kpi
            label="평균 KDA"
            value={((kills + assists) / Math.max(deaths, 1)).toFixed(2)}
            sub={`최근 ${matches.length}판 · ${(kills / matches.length).toFixed(1)} / ${(deaths / matches.length).toFixed(1)} / ${(assists / matches.length).toFixed(1)}`}
          />
        ) : (
          <Kpi
            label="평균 KDA"
            value={dash}
            color={mutedColor}
            sub={hasAccount ? '동기화된 매치가 없어요' : noAccountHint}
          />
        )}
      </Col>
    </>
  );
}

const Kda = styled.span`
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const DateText = styled.span`
  font: ${({ theme }) => theme.type.label};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export interface RecentMatchesCardProps {
  matches: MatchHistoryEntry[];
  championName: (championId: number, fallback: string | null) => string;
  action?: ReactNode;
  emptyHint?: string;
}

export function RecentMatchesCard({
  matches,
  championName,
  action,
  emptyHint = '동기화된 매치가 없어요',
}: RecentMatchesCardProps) {
  const recent = matches.slice(0, 10);
  const recentWins = recent.filter((m) => m.win).length;

  const columns: Column<MatchHistoryEntry>[] = [
    {
      key: 'result',
      header: '결과',
      width: 64,
      render: (m) => <ResultChip $win={m.win}>{m.win ? '승' : '패'}</ResultChip>,
    },
    { key: 'champion', header: '챔피언', render: (m) => championName(m.championId, m.championName) },
    {
      key: 'position',
      header: '라인',
      width: 96,
      render: (m) => {
        const lane = toLane(m.position);
        return lane ? <LaneLabel lane={lane} /> : <Muted>—</Muted>;
      },
    },
    {
      key: 'kda',
      header: 'K / D / A',
      width: 128,
      align: 'right',
      render: (m) => (
        <Kda>
          {m.kills} / {m.deaths} / {m.assists}
        </Kda>
      ),
    },
    {
      key: 'playedAt',
      header: '날짜',
      width: 120,
      align: 'right',
      render: (m) => <DateText>{formatDate(m.playedAt)}</DateText>,
    },
  ];

  return (
    <Card flush>
      <SectionHeader
        inset
        icon={<Icon name="history" />}
        title="최근 매치"
        description="라이엇 전적 · 동기화된 경기 기준"
        action={action}
      />
      {recent.length > 0 && (
        <FormRow>
          <FormLabel>
            최근 {recent.length}판{' '}
            <b>
              {recentWins}승 {recent.length - recentWins}패
            </b>
          </FormLabel>
          <RecentForm matches={matches} />
        </FormRow>
      )}
      {matches.length === 0 ? (
        <InsetEmpty>{emptyHint}</InsetEmpty>
      ) : (
        <Table
          columns={columns}
          data={matches}
          minWidth={520}
          rowKey={(m) => m.matchId}
        />
      )}
    </Card>
  );
}

const Mastery = styled.span`
  font: ${({ theme }) => theme.type.label};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export interface ChampionStatsCardProps {
  stats: ChampionStat[];
  masteries: ChampionMastery[];
  championName: (championId: number, fallback: string | null) => string;
}

export function ChampionStatsCard({ stats, masteries, championName }: ChampionStatsCardProps) {
  const masteryByChampion = new Map(masteries.map((m) => [m.championId, m]));

  const columns: Column<ChampionStat>[] = [
    { key: 'champion', header: '챔피언', render: (c) => championName(c.championId, c.championName) },
    {
      key: 'mastery',
      header: '숙련도',
      width: 80,
      align: 'right',
      render: (c) => {
        const mastery = masteryByChampion.get(c.championId);
        return mastery ? <Mastery>{mastery.masteryLevel}</Mastery> : <Muted>—</Muted>;
      },
    },
    {
      key: 'record',
      header: '전적',
      width: 104,
      align: 'right',
      render: (c) => `${c.wins.toLocaleString()}승 ${c.losses.toLocaleString()}패`,
    },
    {
      key: 'winRate',
      header: '승률',
      width: 160,
      render: (c) => <WinRateBar wins={c.wins} losses={c.losses} compact={stats.length >= 5} />,
    },
  ];

  return (
    <Card flush>
      <SectionHeader
        inset
        icon={<Icon name="star" />}
        title="챔피언 전적"
        description="숙련도 순 · 동기화된 경기 기준"
      />
      {stats.length === 0 ? (
        <InsetEmpty>동기화된 챔피언 전적이 없어요</InsetEmpty>
      ) : (
        <Table columns={columns} data={stats} minWidth={480} rowKey={(c) => c.championId} />
      )}
    </Card>
  );
}

// §3.12 Radar — 5축 고정(TOP → JUG → MID → ADC → SUP, 12시부터 시계방향).
const RADAR_W = 280;
const RADAR_H = 250;
const RADAR_CX = RADAR_W / 2;
const RADAR_CY = 122;
const RADAR_R = 82;

const RadarFigure = styled.figure`
  margin: 0 0 var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
`;

const RadarSvg = styled.svg`
  width: 100%;
  max-width: ${RADAR_W}px;
  height: auto;

  .grid {
    fill: none;
    stroke: ${({ theme }) => theme.color.chart.grid};
    stroke-width: 1;
  }

  .mine {
    fill: var(--chart-mine);
    fill-opacity: 0.06;
    stroke: var(--chart-mine);
    stroke-width: 1.5;
    stroke-linejoin: round;
  }

  .avg {
    fill: none;
    stroke: var(--chart-avg);
    stroke-width: 1;
    stroke-dasharray: 3 3;
  }

  .dot {
    fill: var(--chart-mine);
  }

  .axis {
    font: ${({ theme }) => theme.type.caption};
    font-weight: 500;
    letter-spacing: 0.02em;
    fill: ${({ theme }) => theme.color.text.secondary};
  }

  .value {
    font: ${({ theme }) => theme.type.caption};
    font-variant-numeric: tabular-nums;
    fill: ${({ theme }) => theme.color.text.muted};
  }
`;

const Legend = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};

  i {
    display: inline-block;
    width: 14px;
    height: 0;
    border-top: 1.5px solid var(--chart-mine);
  }

  i.avg {
    margin-left: var(--space-2);
    border-top: 1px dashed var(--chart-avg);
  }
`;

const ScaleNote = styled.p`
  font: ${({ theme }) => theme.type.caption};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.muted};
  text-align: center;
`;

const LaneRows = styled.ul`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
`;

const LaneRow = styled.li`
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  min-height: 36px;
  padding: 0 var(--space-3);
  background: ${({ theme }) => theme.color.surface.subtle};
  border-radius: ${({ theme }) => theme.radius.control}px;
`;

const LaneMeta = styled.span`
  font: ${({ theme }) => theme.type.caption};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LaneMmr = styled.span`
  font: ${({ theme }) => theme.type.labelStrong};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.primary};
  text-align: right;
`;

function radarPoint(i: number, ratio: number): [number, number] {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / LANES.length;
  return [RADAR_CX + Math.cos(angle) * RADAR_R * ratio, RADAR_CY + Math.sin(angle) * RADAR_R * ratio];
}

const pointsAttr = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export interface LaneMmrCardProps {
  positionStats: PositionStat[];
  /** 활성 그룹 티어표 행(유저 × 라인). 그룹 평균선과 스케일 기준에만 씀. */
  groupRows?: TierEntry[];
  groupName?: string;
  mainPosition?: string | null;
  emptyHint: string;
}

export function LaneMmrCard({ positionStats, groupRows, groupName, mainPosition, emptyHint }: LaneMmrCardProps) {
  const statByLane = new Map<Lane, PositionStat>();
  for (const p of positionStats) {
    const lane = toLane(p.position);
    if (lane && p.gamesPlayed > 0) statByLane.set(lane, p);
  }
  const mine = LANES.map((lane) => statByLane.get(lane)?.positionMmr ?? null);

  const playedGroupRows = (groupRows ?? []).filter((r) => r.wins + r.losses > 0);
  const avg = LANES.map((lane) => {
    const rows = playedGroupRows.filter((r) => r.position === lane);
    return rows.length ? rows.reduce((s, r) => s + r.positionMmr, 0) / rows.length : null;
  });
  const hasAvg = avg.some((v) => v !== null);

  // 스케일: 그룹 내 최소~최대 MMR을 0~100%로 정규화(0부터 시작하면 전부 바깥에 몰림).
  const domainValues = [
    ...playedGroupRows.map((r) => r.positionMmr),
    ...mine.filter((v): v is number => v !== null),
  ];
  const hasMine = mine.some((v) => v !== null);
  let min = domainValues.length ? Math.min(...domainValues) : 0;
  let max = domainValues.length ? Math.max(...domainValues) : 0;
  if (max - min < 1) {
    min -= 50;
    max += 50;
  }
  const ratioOf = (v: number) => 0.1 + 0.9 * Math.min(1, Math.max(0, (v - min) / (max - min)));

  const minePts = mine
    .map((v, i) => (v === null ? null : radarPoint(i, ratioOf(v))))
    .filter((p): p is [number, number] => p !== null);
  const avgPts = avg
    .map((v, i) => (v === null ? null : radarPoint(i, ratioOf(v))))
    .filter((p): p is [number, number] => p !== null);

  const mainLane = toLane(mainPosition);
  const ariaLabel = `라인별 MMR: ${LANES.map((lane, i) => `${lane} ${mine[i]?.toLocaleString() ?? '기록 없음'}`).join(', ')}`;

  return (
    <Card>
      <SectionHeader
        icon={<Icon name="stats" />}
        title="라인별 MMR"
        description="라인별 판수 · 승률 · MMR"
        action={
          hasMine ? (
            <Legend aria-hidden="true">
              <i />나{hasAvg && (
                <>
                  <i className="avg" />그룹 평균
                </>
              )}
            </Legend>
          ) : undefined
        }
      />
      {!hasMine ? (
        <EmptyHint>{emptyHint}</EmptyHint>
      ) : (
        <>
          <RadarFigure>
            <RadarSvg viewBox={`0 0 ${RADAR_W} ${RADAR_H}`} role="img" aria-label={ariaLabel}>
              <g className="grid">
                {[0.25, 0.5, 0.75, 1].map((r) => (
                  <polygon key={r} points={pointsAttr(LANES.map((_, i) => radarPoint(i, r)))} />
                ))}
                {LANES.map((_, i) => {
                  const [x, y] = radarPoint(i, 1);
                  return <line key={i} x1={RADAR_CX} y1={RADAR_CY} x2={x} y2={y} />;
                })}
              </g>
              {avgPts.length >= 2 && <polygon className="avg" points={pointsAttr(avgPts)} />}
              {minePts.length >= 2 && <polygon className="mine" points={pointsAttr(minePts)} />}
              {minePts.map(([x, y], i) => (
                <circle key={i} className="dot" cx={x} cy={y} r={3} />
              ))}
              {LANES.map((lane, i) => {
                const [x, y] = radarPoint(i, 1.2);
                const anchor = Math.abs(x - RADAR_CX) < 4 ? 'middle' : x > RADAR_CX ? 'start' : 'end';
                const top = y < RADAR_CY - RADAR_R;
                return (
                  <text key={lane} x={x} y={top ? y - 12 : y} textAnchor={anchor}>
                    <tspan className="axis" x={x}>
                      {lane}
                    </tspan>
                    <tspan className="value" x={x} dy={15}>
                      {mine[i] !== null ? mine[i]!.toLocaleString() : '—'}
                    </tspan>
                  </text>
                );
              })}
            </RadarSvg>
            <ScaleNote>
              {playedGroupRows.length > 0
                ? `${groupName ? `${groupName} ` : '그룹 '}최소 ${Math.round(min).toLocaleString()} ~ 최대 ${Math.round(max).toLocaleString()} MMR 기준`
                : `이 계정 라인 기록 ${Math.round(min).toLocaleString()} ~ ${Math.round(max).toLocaleString()} MMR 기준`}
            </ScaleNote>
          </RadarFigure>
          <LaneRows>
            {LANES.map((lane) => {
              const stat = statByLane.get(lane);
              return (
                <LaneRow key={lane}>
                  <LaneLabel lane={lane} main={lane === mainLane} />
                  <LaneMeta>
                    {stat
                      ? `${stat.gamesPlayed.toLocaleString()}판 · ${Math.round(stat.winRate * 100)}%`
                      : '기록 없음'}
                  </LaneMeta>
                  {stat ? <LaneMmr>{stat.positionMmr.toLocaleString()}</LaneMmr> : <Muted>—</Muted>}
                </LaneRow>
              );
            })}
          </LaneRows>
        </>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// StatsPage-only pieces: MMR 추이 차트 + 변동 내역
// ---------------------------------------------------------------------------

const CHART_HEIGHT = 220;
const MIN_BAR_RATIO = 0.16;

const Chart = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-rows: ${CHART_HEIGHT}px auto;
  column-gap: var(--space-3);
  row-gap: var(--space-2);
`;

const YAxis = styled.div`
  position: relative;
  min-width: 40px;
`;

const YLabel = styled.span<{ $at: number }>`
  position: absolute;
  right: 0;
  bottom: ${({ $at }) => $at * 100}%;
  transform: translateY(50%);
  font: ${({ theme }) => theme.type.caption};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: ${({ theme }) => theme.color.text.muted};
`;

const Plot = styled.div`
  position: relative;
  min-width: 0;
`;

const GridLine = styled.span<{ $at: number }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: ${({ $at }) => $at * 100}%;
  border-top: 1px solid ${({ theme }) => theme.color.chart.grid};
`;

const Bars = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  gap: var(--space-1);
`;

const Bar = styled.button<{ $ratio: number; $current: boolean }>`
  flex: 1;
  min-width: 0;
  height: ${({ $ratio }) => $ratio * 100}%;
  border: none;
  border-radius: 4px 4px 0 0;
  padding: 0;
  cursor: pointer;
  background: ${({ theme, $current }) => ($current ? theme.color.chart.barActive : theme.color.chart.bar)};
  transition: background var(--duration-fast) var(--ease-out);

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.color.chart.barActive};
  }
`;

const XAxis = styled.div`
  grid-column: 2;
  display: flex;
  gap: var(--space-1);
`;

const XLabel = styled.span`
  flex: 1;
  min-width: 0;
  text-align: center;
  font: ${({ theme }) => theme.type.caption};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: ${({ theme }) => theme.color.text.muted};
`;

const ChangeList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  max-height: 272px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ChangeRow = styled.li`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: ${({ theme }) => theme.color.surface.subtle};
  border-radius: ${({ theme }) => theme.radius.control}px;
`;

const ChangeInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChangeLabel = styled.p`
  font: ${({ theme }) => theme.type.labelStrong};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.primary};
`;

const ChangeReason = styled.p`
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function StatsPage() {
  const navigate = useNavigate();
  const { data: gameAccounts } = useMyGameAccounts();
  const championName = useChampionName();
  const { data: me } = useMe();
  const activeGroupId = useActiveGroupId();
  const activeGroupIdNum = Number(activeGroupId);
  // "그룹 내부 티어"가 activeGroupId 기준으로 보이는데 MMR 추이는 필터 없이 유저의
  // 모든 그룹이 섞여서 나오던 버그 수정(2026-09-13 문의) — 같은 그룹 기준으로 맞춤.
  const { data: mmrHistory } = useMyMmrHistory(activeGroupIdNum > 0 ? activeGroupIdNum : undefined);
  const { data: activeGroup } = useGroup(activeGroupIdNum);
  const { data: activeGroupTiers } = useTierTable(activeGroupIdNum);

  const history = mmrHistory ?? [];
  const trendSeries = [...history].reverse();
  const myGameAccounts = gameAccounts ?? [];
  const primaryAccount = myGameAccounts[0];
  const currentMmr = primaryAccount?.stats?.internalMmr ?? null;

  // "그룹 내부 티어"는 그룹 하나에 종속된 개념이라 계정 전체 페이지에 하나로
  // 못 박음 — 여러 그룹에 속해있을 수 있어서, nav가 기억하는 "마지막으로 본
  // 그룹"(activeGroupId) 기준으로 보여줌. 그 그룹에 티어 기록이 없으면(계정
  // 미연동 등) '-'.
  const myGroupTier = activeGroupTiers?.tiers.find((t) => t.userId === me?.id) ?? null;

  const accountId = Number(primaryAccount?.id);
  const { data: matchHistory } = useMatchHistory(accountId);
  const { data: championStats } = useChampionStats(accountId);
  const { data: championMasteries } = useChampionMasteries(accountId);
  const { data: fullStats } = useGameAccountFullStats(accountId);
  const fullSyncGameAccount = useFullSyncGameAccount(accountId);

  const recentMatches = matchHistory ?? [];
  const champStats = championStats ?? [];
  const masteries = championMasteries ?? [];
  const positionStats = fullStats?.positionStats ?? [];

  // `custom_match_participants.mmr_change` (see ERD) is a per-match delta, not a
  // stored running total — walk backwards from the current MMR to reconstruct the
  // "MMR after each match" series the trend chart plots. Needs a known current
  // MMR to anchor to, so the chart stays empty without a linked game account.
  const mmrAfterSeries: number[] = currentMmr === null ? [] : new Array(trendSeries.length);
  if (currentMmr !== null && trendSeries.length > 0) {
    mmrAfterSeries[trendSeries.length - 1] = currentMmr;
    for (let i = trendSeries.length - 2; i >= 0; i--) {
      mmrAfterSeries[i] = mmrAfterSeries[i + 1] - trendSeries[i + 1].mmrChange;
    }
  }
  const minMmr = mmrAfterSeries.length ? Math.min(...mmrAfterSeries) : 0;
  const maxMmr = mmrAfterSeries.length ? Math.max(...mmrAfterSeries) : 0;
  const mmrRange = maxMmr - minMmr || 1;
  const toRatio = (v: number) => MIN_BAR_RATIO + ((v - minMmr) / mmrRange) * (1 - MIN_BAR_RATIO);
  const barRatios = mmrAfterSeries.map(toRatio);
  // y축 격자: 최소 · 중간 · 최대 MMR (값이 하나뿐이면 한 줄만).
  const yTicks =
    maxMmr === minMmr ? [minMmr] : [minMmr, Math.round((minMmr + maxMmr) / 2), maxMmr];

  const recentDelta = history.reduce((sum, h) => sum + h.mmrChange, 0);
  const officialTier = primaryAccount?.stats?.officialTier ?? null;

  // "지금 갱신"과 "전적 동기화" 버튼은 위치만 다를 뿐 이제 똑같이 리프레시+동기화를
  // 전부 실행함 — 어느 쪽을 눌러도 결과가 같아야 한다는 요청이라 핸들러도 하나로 합침.
  const handleFullSync = () => {
    if (!primaryAccount) return;
    fullSyncGameAccount.mutate(undefined);
  };

  // 막대를 누르면 260ms 동안 "쭉 자라는" 연출 뒤에 이동했는데, 정보 없이 이동만
  // 늦추는 장식이라 바로 이동하게 바꿈. 가장 최근 경기(현재 MMR) 막대만 진하게.
  const handleBarClick = (matchId: number) => navigate(`/matches/${matchId}`);

  const noAccountHint = '게임 계정을 연동하면 표시돼요';

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>내 전적</Title>
          <Subtitle>전적은 하루 1회 자동 갱신 · {formatRelativeTime(primaryAccount?.stats?.updatedAt ?? null)}</Subtitle>
        </div>
        <HeaderActions>
          <Button
            $variant="primary"
            onClick={handleFullSync}
            disabled={fullSyncGameAccount.isPending || !primaryAccount}
          >
            <Icon name="refresh" />
            {fullSyncGameAccount.isPending ? '갱신 중...' : '지금 갱신'}
          </Button>
        </HeaderActions>
      </Header>

      <Stack $gap="card">
        <MmrSummary
          mmr={currentMmr}
          delta={history.length === 0 ? null : { value: recentDelta, label: '30일 변동' }}
          groupTier={{
            tier: myGroupTier?.tier ?? null,
            groupName: activeGroup?.name,
            emptyLabel: activeGroup ? '기록 없음' : '그룹 없음',
          }}
          officialTier={officialTier ?? (primaryAccount ? '언랭크' : '연동 필요')}
        />

        <Grid>
          <RecordKpis
            customRecord={
              myGroupTier
                ? { wins: myGroupTier.customMatchWins, losses: myGroupTier.customMatchLosses }
                : null
            }
            customEmptyHint={activeGroup ? `${activeGroup.name} 내전 기록이 없어요` : '그룹에 참여하면 표시돼요'}
            matches={recentMatches}
            positionStats={positionStats}
            mainPosition={primaryAccount?.stats?.mainPosition ?? null}
            hasAccount={!!primaryAccount}
          />
        </Grid>

        <Grid>
          <Col $span={8}>
            <Card>
              <SectionHeader
                icon={<Icon name="stats" />}
                title="MMR 추이"
                description={`최근 ${trendSeries.length}경기 · 막대를 누르면 내전 상세로 이동해요`}
              />
              {barRatios.length === 0 ? (
                <EmptyHint>{primaryAccount ? '아직 집계된 내전 기록이 없어요' : noAccountHint}</EmptyHint>
              ) : (
                <Chart>
                  <YAxis aria-hidden="true">
                    {yTicks.map((v) => (
                      <YLabel key={v} $at={toRatio(v)}>
                        {v.toLocaleString()}
                      </YLabel>
                    ))}
                  </YAxis>
                  <Plot>
                    {yTicks.map((v) => (
                      <GridLine key={v} $at={toRatio(v)} aria-hidden="true" />
                    ))}
                    <Bars>
                      {barRatios.map((ratio, i) => (
                        <Bar
                          key={i}
                          $ratio={ratio}
                          $current={i === barRatios.length - 1}
                          title={`${formatDateTime(trendSeries[i].playedAt)} · ${mmrAfterSeries[i].toLocaleString()} MMR`}
                          aria-label={`${i + 1}번째 경기 상세 보기 · ${mmrAfterSeries[i].toLocaleString()} MMR`}
                          onClick={() => handleBarClick(trendSeries[i].matchId)}
                        />
                      ))}
                    </Bars>
                  </Plot>
                  <XAxis aria-hidden="true">
                    {barRatios.map((_, i) => (
                      <XLabel key={i}>
                        {i === 0 || i === barRatios.length - 1 || (i + 1) % 5 === 0 ? i + 1 : ''}
                      </XLabel>
                    ))}
                  </XAxis>
                </Chart>
              )}
            </Card>
          </Col>
          <Col $span={4}>
            <Card>
              <SectionHeader
                icon={<Icon name="swap" />}
                title="변동 내역"
                description={activeGroup ? `${activeGroup.name} 내전 기준` : '내전 기준'}
              />
              {history.length === 0 ? (
                <EmptyHint>아직 집계된 변동 내역이 없어요</EmptyHint>
              ) : (
                <ChangeList>
                  {history.map((c) => (
                    <ChangeRow key={c.matchId}>
                      <ChangeInfo>
                        <ChangeLabel>{formatDateTime(c.playedAt)}</ChangeLabel>
                        <ChangeReason>
                          {c.groupId === activeGroup?.id ? activeGroup.name : `그룹 #${c.groupId}`} 내전
                        </ChangeReason>
                      </ChangeInfo>
                      <Delta value={c.mmrChange} />
                    </ChangeRow>
                  ))}
                </ChangeList>
              )}
            </Card>
          </Col>
        </Grid>

        <Grid>
          <Col $span={12}>
            <RecentMatchesCard
              matches={recentMatches}
              championName={championName}
              emptyHint={primaryAccount ? '동기화된 매치가 없어요' : noAccountHint}
              action={
                <Button
                  $size="sm"
                  onClick={handleFullSync}
                  disabled={fullSyncGameAccount.isPending || !primaryAccount}
                >
                  {fullSyncGameAccount.isPending ? '동기화 중...' : '전적 동기화'}
                </Button>
              }
            />
          </Col>
        </Grid>

        <Grid>
          <Col $span={8}>
            <ChampionStatsCard stats={champStats} masteries={masteries} championName={championName} />
          </Col>
          <Col $span={4}>
            <LaneMmrCard
              positionStats={positionStats}
              groupRows={activeGroupTiers?.tiers}
              groupName={activeGroup?.name}
              mainPosition={primaryAccount?.stats?.mainPosition ?? null}
              emptyHint={primaryAccount ? '아직 집계된 라인 기록이 없어요' : noAccountHint}
            />
          </Col>
        </Grid>
      </Stack>
    </PageLayout>
  );
}
