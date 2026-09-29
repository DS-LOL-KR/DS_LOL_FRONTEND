import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader as Header, PageTitle as Title, PageSubtitle as Subtitle, HeaderActions } from '../components/layout/PageHeader';
import { Grid, Col, Stack } from '../components/layout/Grid';
import { Card, SectionHeader, IconBox, CardTitle } from '../components/Card/Card';
import { Kpi } from '../components/Kpi/Kpi';
import { Table } from '../components/Table/Table';
import type { Column } from '../components/Table/Table';
import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Icon } from '../components/Icon/Icon';
import { Avatar } from '../components/Avatar/Avatar';
import { LaneIcon, LaneLabel } from '../components/LaneIcon/LaneIcon';
import { WinRateBar } from '../components/WinRateBar/WinRateBar';
import { useRefreshGroupTiers, useTierTable } from '../features/tiers/hooks';
import type { Position, TierEntry } from '../features/tiers/types';
import { setActiveGroupId } from '../utils/activeGroup';
import { resolveAssetUrl } from '../utils/assetUrl';
import { formatRelativeTime } from '../utils/formatRelativeTime';

type Tier = 1 | 2 | 3 | 4 | 5;
type LaneFilter = Position | 'ALL';
const POSITIONS: Position[] = ['TOP', 'JUG', 'MID', 'ADC', 'SUP'];
const FILTERS: LaneFilter[] = ['ALL', ...POSITIONS];
const TIERS: Tier[] = [1, 2, 3, 4, 5];

// ── Segmented control (docs/design-system.md → 3.11) ─────────────────────────
// Raised track, selected option = hover step + primary text. Never a white fill.
const SegTrack = styled.div`
  display: inline-flex;
  gap: 2px;
  max-width: 100%;
  height: var(--control-height);
  padding: 2px;
  overflow-x: auto;
  scrollbar-width: none;
  background: ${({ theme }) => theme.color.surface.subtle};
  border: 1px solid ${({ theme }) => theme.color.border.base};
  border-radius: ${({ theme }) => theme.radius.control}px;

  &::-webkit-scrollbar {
    display: none;
  }

  ${({ theme }) => theme.media.mobile} {
    display: flex;
    width: 100%;
  }
`;

const SegOption = styled.button`
  flex: 1 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 var(--space-3);
  border: 0;
  border-radius: 6px;
  background: transparent;
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
  white-space: nowrap;
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);

  &:hover {
    color: ${({ theme }) => theme.color.text.primary};
  }

  &[aria-checked='true'] {
    background: ${({ theme }) => theme.color.surface.hover};
    color: ${({ theme }) => theme.color.text.primary};
    font: ${({ theme }) => theme.type.labelStrong};
  }

  ${({ theme }) => theme.media.narrow} {
    padding: 0 var(--space-2);
  }
`;

// ── Tier cards ──────────────────────────────────────────────────────────────
const TierHeading = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
`;

const TierCount = styled.span`
  font: ${({ theme }) => theme.type.label};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const NameButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  max-width: 100%;
  min-width: 0;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  color: inherit;
`;

const MemberName = styled.span`
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font: ${({ theme }) => theme.type.bodyStrong};
  color: ${({ theme }) => theme.color.text.primary};

  ${NameButton}:hover & {
    text-decoration: underline;
  }
`;

const OfficialTier = styled.span`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Muted = styled.span`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.muted};
`;

const Mmr = styled.span`
  font: ${({ theme }) => theme.type.bodyStrong};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.primary};
`;

const EmptyRow = styled.p`
  padding: 0 var(--card-padding) var(--card-padding);
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.muted};
`;

// ── Empty / error state (3.14) ──────────────────────────────────────────────
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8) 0;
  text-align: center;
`;

const EmptyText = styled.p`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const InlineError = styled.p`
  margin-top: var(--space-1);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.state.danger};
`;

const InlineNote = styled.p`
  margin-top: var(--space-1);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

const KpiSubRow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
`;

function LaneSegmented({ value, onChange }: { value: LaneFilter; onChange: (v: LaneFilter) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const idx = FILTERS.indexOf(value);
    const next = (idx + (e.key === 'ArrowRight' ? 1 : -1) + FILTERS.length) % FILTERS.length;
    onChange(FILTERS[next]);
    refs.current[next]?.focus();
  };
  return (
    <SegTrack role="radiogroup" aria-label="라인" onKeyDown={handleKeyDown}>
      {FILTERS.map((f, i) => (
        <SegOption
          key={f}
          ref={(el) => (refs.current[i] = el)}
          type="button"
          role="radio"
          aria-checked={value === f}
          tabIndex={value === f ? 0 : -1}
          onClick={() => onChange(f)}
        >
          {f === 'ALL' ? (
            '전체'
          ) : (
            <>
              <LaneIcon lane={f} size={14} />
              {f}
            </>
          )}
        </SegOption>
      ))}
    </SegTrack>
  );
}

export function TierTablePage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const groupIdNum = Number(groupId);
  const [position, setPosition] = useState<LaneFilter>('ALL');
  const { data: tierTable, isError: tierTableError } = useTierTable(groupIdNum, position === 'ALL' ? undefined : position);
  const refreshTiers = useRefreshGroupTiers(groupIdNum);
  const refreshSummary = refreshTiers.data?.refresh;

  useEffect(() => {
    if (groupId) setActiveGroupId(groupId);
  }, [groupId]);

  const allMembers = tierTable?.tiers ?? [];
  // '전체' 탭에서는 한 사람이 여러 라인으로 중복 등장하면 지저분하니, 라인별
  // position_mmr가 가장 높은 한 줄만 남김.
  const filtered = useMemo(() => {
    if (position !== 'ALL') return allMembers.filter((m) => m.position === position);
    const bestByUser = new Map<number, TierEntry>();
    for (const m of allMembers) {
      const current = bestByUser.get(m.userId);
      if (!current || m.positionMmr > current.positionMmr) bestByUser.set(m.userId, m);
    }
    return Array.from(bestByUser.values());
  }, [allMembers, position]);

  // 전체 탭에서는 등급(1~5) 기준인 계정 전체 internal_mmr을 보여줌 —
  // 라인별 position_mmr을 보여주면 숫자 순서랑 등급 순서가 안 맞아
  // 보였음(등급은 라인 탭을 바꿔도 안 흔들리게 internal_mmr 기준으로
  // 고정돼 있어서). 특정 라인 탭에서는 그 라인 MMR 그대로 보여줌.
  const shownMmr = (m: TierEntry) => (position === 'ALL' ? m.internalMmr : m.positionMmr);

  // "전체" 탭은 라이엇 라인별 전적이 아니라 이 그룹 내전(custom_matches)
  // 결과 기준 승/패를 보여줌 — 라인 탭에서는 그대로 라이엇 전적을 씀.
  const record = (m: TierEntry) =>
    position === 'ALL' ? { wins: m.customMatchWins, losses: m.customMatchLosses } : { wins: m.wins, losses: m.losses };

  const byTier = useMemo(() => {
    const groups = new Map<Tier, TierEntry[]>();
    for (const t of TIERS) groups.set(t, []);
    for (const m of filtered) groups.get(m.tier)?.push(m);
    for (const list of groups.values()) {
      list.sort((a, b) => (position === 'ALL' ? b.internalMmr - a.internalMmr : b.positionMmr - a.positionMmr));
    }
    return groups;
  }, [filtered, position]);

  const kpis = useMemo(() => {
    const mmrs = filtered.map((m) => (position === 'ALL' ? m.internalMmr : m.positionMmr));
    const avg = mmrs.length ? Math.round(mmrs.reduce((s, v) => s + v, 0) / mmrs.length) : null;
    const top = filtered.reduce<TierEntry | null>(
      (best, m) =>
        !best || (position === 'ALL' ? m.internalMmr > best.internalMmr : m.positionMmr > best.positionMmr) ? m : best,
      null,
    );
    // 등급은 internal_mmr 순위로 나뉘니 컷도 internal_mmr 기준.
    const tier1 = filtered.filter((m) => m.tier === 1);
    const tier1Cut = tier1.length ? Math.min(...tier1.map((m) => m.internalMmr)) : null;
    return { count: filtered.length, avg, top, tier1Count: tier1.length, tier1Cut };
  }, [filtered, position]);

  // 티어표는 라이엇 계정을 연동한 사람만 집계해요 — 그룹원 수(사이드바)와 다를 수 있어서 기준을 밝혀둠.
  const laneLabel = position === 'ALL' ? '계정 연동한 그룹원' : `${position} 기록 보유`;

  const columns: Column<TierEntry>[] = [
    {
      key: 'nickname',
      header: '플레이어',
      render: (m) => (
        <NameButton
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/users/${m.userId}`);
          }}
        >
          <Avatar name={m.nickname} imageUrl={resolveAssetUrl(m.profileImageUrl)} size={24} />
          <MemberName>{m.nickname}</MemberName>
        </NameButton>
      ),
    },
    // 전체 탭 행은 position_mmr가 가장 높은 라인 행이라 그 라인을 보여줌 —
    // 라인 탭에서는 모든 행이 같은 라인이라 컬럼을 뺌.
    ...(position === 'ALL'
      ? [
          {
            key: 'position',
            header: '최고 라인',
            width: 96,
            render: (m: TierEntry) => <LaneLabel lane={m.position} main={m.mainPosition === m.position} />,
          },
        ]
      : []),
    {
      key: 'officialTier',
      header: '솔로 랭크',
      width: 150,
      render: (m) => (m.officialTier ? <OfficialTier>{m.officialTier}</OfficialTier> : <Muted>—</Muted>),
    },
    {
      key: 'record',
      header: position === 'ALL' ? '내전 승률' : '라인 승률',
      width: 170,
      render: (m) => {
        const { wins, losses } = record(m);
        return <WinRateBar wins={wins} losses={losses} compact />;
      },
    },
    {
      key: 'games',
      header: '전적',
      width: 96,
      align: 'right',
      render: (m) => {
        const { wins, losses } = record(m);
        return wins + losses > 0 ? (
          <OfficialTier>
            {wins.toLocaleString()}승 {losses.toLocaleString()}패
          </OfficialTier>
        ) : (
          <Muted>—</Muted>
        );
      },
    },
    {
      key: 'mmr',
      header: position === 'ALL' ? 'MMR' : `${position} MMR`,
      width: 96,
      align: 'right',
      render: (m) => <Mmr>{shownMmr(m).toLocaleString()}</Mmr>,
    },
  ];

  return (
    <PageLayout>
      <Header>
        <div>
          <Title>티어표</Title>
          <Subtitle>전적 · 그룹 티어 · 사용자 평가를 합산해 계산 · {formatRelativeTime(tierTable?.lastUpdatedAt ?? null)}</Subtitle>
          {/* 그룹 전체 갱신: 한 명당 약 0.5초라 오래 걸릴 수 있어 진행·결과를 헤더에서 바로 알려줌 */}
          <div role="status" aria-live="polite">
            {refreshTiers.isPending ? (
              <InlineNote>그룹원 전체의 라이엇 티어를 불러오고 있어요 · 인원이 많으면 10초 넘게 걸릴 수 있어요</InlineNote>
            ) : refreshTiers.isError ? (
              <InlineError>{refreshTiers.error.message || '그룹 전체 갱신에 실패했어요. 잠시 후 다시 시도해 주세요'}</InlineError>
            ) : refreshSummary && refreshSummary.failed > 0 ? (
              <InlineError>
                일부 갱신 실패 ({refreshSummary.failed.toLocaleString()}명) · 잠시 후 다시 시도해 주세요
              </InlineError>
            ) : refreshSummary && refreshSummary.succeeded === 0 && refreshSummary.skipped > 0 ? (
              <InlineNote>모두 5분 안에 갱신돼서 건너뛰었어요</InlineNote>
            ) : refreshSummary ? (
              <InlineNote>
                {refreshSummary.succeeded.toLocaleString()}명 갱신 완료
                {refreshSummary.skipped > 0 && ` · ${refreshSummary.skipped.toLocaleString()}명은 5분 안에 갱신돼 건너뛰었어요`}
              </InlineNote>
            ) : null}
          </div>
        </div>
        <HeaderActions>
          <LaneSegmented value={position} onChange={setPosition} />
          <Button
            $variant="primary"
            onClick={() => refreshTiers.mutate()}
            disabled={refreshTiers.isPending}
            aria-busy={refreshTiers.isPending || undefined}
          >
            <Icon name="refresh" size={14} spin={refreshTiers.isPending} />
            {refreshTiers.isPending ? '갱신 중…' : '그룹 전체 갱신'}
          </Button>
        </HeaderActions>
      </Header>

      {tierTableError ? (
        <Card>
          <EmptyState>
            <IconBox aria-hidden="true">
              <Icon name="tiers" />
            </IconBox>
            <CardTitle as="h2">티어표를 볼 수 없어요</CardTitle>
            <EmptyText>이 그룹의 티어표를 볼 수 없어요 (멤버가 아니거나 그룹을 찾을 수 없어요)</EmptyText>
          </EmptyState>
        </Card>
      ) : (
        <Stack $gap="section">
          <Grid>
            <Col $span={3}>
              <Kpi label="인원" value={kpis.count.toLocaleString()} unit="명" sub={laneLabel} />
            </Col>
            <Col $span={3}>
              <Kpi
                label={position === 'ALL' ? '평균 MMR' : `평균 ${position} MMR`}
                value={kpis.avg !== null ? kpis.avg.toLocaleString() : '—'}
                sub={kpis.avg !== null ? '표시 중인 멤버 기준' : '티어표에 멤버가 없어요'}
              />
            </Col>
            <Col $span={3}>
              <Kpi
                label={position === 'ALL' ? '최고 MMR' : `최고 ${position} MMR`}
                value={kpis.top ? shownMmr(kpis.top).toLocaleString() : '—'}
                sub={kpis.top ? kpis.top.nickname : '티어표에 멤버가 없어요'}
              />
            </Col>
            <Col $span={3}>
              <Kpi
                label="1티어 컷"
                value={kpis.tier1Cut !== null ? kpis.tier1Cut.toLocaleString() : '—'}
                sub={
                  kpis.tier1Cut !== null ? (
                    <KpiSubRow>
                      <Badge tier={1} />
                      {kpis.tier1Count.toLocaleString()}명 · 계정 MMR 기준
                    </KpiSubRow>
                  ) : (
                    '1티어 멤버가 없어요'
                  )
                }
              />
            </Col>
          </Grid>

          <Stack $gap="card">
            {TIERS.map((tier) => {
              const members = byTier.get(tier) ?? [];
              const mmrs = members.map(shownMmr);
              const range =
                mmrs.length > 0
                  ? `MMR ${Math.min(...mmrs).toLocaleString()} – ${Math.max(...mmrs).toLocaleString()}`
                  : undefined;
              return (
                <Card key={tier} flush>
                  <SectionHeader
                    inset
                    title={
                      <TierHeading>
                        <Badge tier={tier} />
                        <TierCount>{members.length.toLocaleString()}명</TierCount>
                      </TierHeading>
                    }
                    description={range}
                  />
                  {members.length === 0 ? (
                    <EmptyRow>해당 티어 없음</EmptyRow>
                  ) : (
                    <Table columns={columns} data={members} minWidth={640} rowKey={(m) => m.userId} />
                  )}
                </Card>
              );
            })}
          </Stack>
        </Stack>
      )}
    </PageLayout>
  );
}
