// 개발 전용 목(가짜) API — 백엔드/로그인 없이 화면을 확인할 때 쓴다.
// .env.development.local 에 VITE_MOCK=1 을 넣으면 api/client.ts가 이 어댑터로 바꿔 끼운다.
// 프로덕션 빌드에서는 import.meta.env.DEV가 false라 이 파일은 번들에 들어가지 않는다.
// 데이터는 메모리에만 있어서 새로고침하면 처음 상태로 돌아간다.
import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { User } from '../features/auth/types';
import type { GameAccount, ChampionStat, ChampionMastery, MatchHistoryEntry, RiotPosition } from '../features/game-accounts/types';
import type { Group, GroupDetail } from '../features/groups/types';
import type { Match, MmrChange, Team, TeamAnalysis, TeamParticipant } from '../features/matches/types';
import type { Position, TierEntry } from '../features/tiers/types';

const ME = 1;
const LANES: Position[] = ['TOP', 'JUG', 'MID', 'ADC', 'SUP'];
const now = Date.now();
const daysAgo = (d: number, h = 0) => new Date(now - d * 86_400_000 - h * 3_600_000).toISOString();

interface Person {
  id: number;
  nickname: string;
  lane: Position;
  sub: Position;
  mmr: number;
  rank: string | null;
}

// 예시 그룹원 (실제 사람 아님)
const PEOPLE: Person[] = [
  { id: 1, nickname: '강철수비', lane: 'TOP', sub: 'JUG', mmr: 1720, rank: 'PLATINUM II' },
  { id: 2, nickname: '새벽탑신', lane: 'TOP', sub: 'MID', mmr: 1540, rank: 'GOLD I' },
  { id: 3, nickname: '정글의왕자', lane: 'JUG', sub: 'TOP', mmr: 1810, rank: 'DIAMOND IV' },
  { id: 4, nickname: '갱킹장인', lane: 'JUG', sub: 'SUP', mmr: 1490, rank: 'GOLD II' },
  { id: 5, nickname: '미드차이', lane: 'MID', sub: 'ADC', mmr: 1650, rank: 'PLATINUM III' },
  { id: 6, nickname: '오리장인', lane: 'MID', sub: 'SUP', mmr: 1580, rank: 'GOLD I' },
  { id: 7, nickname: '원딜은못참아', lane: 'ADC', sub: 'MID', mmr: 1430, rank: 'SILVER I' },
  { id: 8, nickname: '카이사원챔', lane: 'ADC', sub: 'TOP', mmr: 1690, rank: 'PLATINUM II' },
  { id: 9, nickname: '쓰레쉬그랩', lane: 'SUP', sub: 'ADC', mmr: 1520, rank: 'GOLD III' },
  { id: 10, nickname: '와드지기', lane: 'SUP', sub: 'JUG', mmr: 1310, rank: 'BRONZE I' },
  { id: 11, nickname: '솔랭중독', lane: 'MID', sub: 'TOP', mmr: 1760, rank: 'EMERALD I' },
  { id: 12, nickname: '주말전사', lane: 'TOP', sub: 'ADC', mmr: 1280, rank: null },
];
const person = (id: number) => PEOPLE.find((p) => p.id === id)!;

const users: Record<number, User> = Object.fromEntries(
  PEOPLE.map((p) => [
    p.id,
    {
      id: p.id,
      email: `user${p.id}@example.com`,
      nickname: p.nickname,
      profileImageUrl: null,
      bio: p.id === ME ? '**탑 장인**입니다. 금요일 저녁 내전 고정 멤버.' : null,
      discordUserId: p.id === ME ? '000000000000000001' : null,
      createdAt: daysAgo(120),
    },
  ]),
);

const groups: GroupDetail[] = [
  {
    id: 1,
    name: '금요일 내전방',
    ownerId: ME,
    gameId: 1,
    inviteCode: 'FRI-24LOL',
    discordWebhookUrl: null,
    discordGuildId: '000000000000000777',
    createdAt: daysAgo(90),
    members: PEOPLE.map((p, i) => ({
      id: 100 + p.id,
      groupId: 1,
      userId: p.id,
      role: p.id === ME ? 'OWNER' : 'MEMBER',
      joinedAt: daysAgo(90 - i * 3),
      user: { id: p.id, nickname: p.nickname, profileImageUrl: null },
    })),
  },
  {
    id: 2,
    name: '주말 칼바람',
    ownerId: 3,
    gameId: 1,
    inviteCode: 'ARAM-WKND',
    discordWebhookUrl: null,
    discordGuildId: null,
    createdAt: daysAgo(40),
    members: [1, 3, 5, 8, 9, 11].map((id, i) => ({
      id: 200 + id,
      groupId: 2,
      userId: id,
      role: id === 3 ? 'OWNER' : 'MEMBER',
      joinedAt: daysAgo(40 - i),
      user: { id, nickname: person(id).nickname, profileImageUrl: null },
    })),
  },
];
const bareGroup = ({ members: _members, ...g }: GroupDetail): Group => g;

/* ───────── Matches ───────── */
const expected = (a: number, b: number) => 1 / (1 + 10 ** ((b - a) / 400));

function analyze(ps: TeamParticipant[]): TeamAnalysis | null {
  const a = ps.filter((p) => p.assignedTeam === 'TEAM_A');
  const b = ps.filter((p) => p.assignedTeam === 'TEAM_B');
  if (!a.length || !b.length) return null;
  const sum = (xs: TeamParticipant[]) => xs.reduce((s, p) => s + p.mmr, 0);
  const avgA = sum(a) / a.length;
  const avgB = sum(b) / b.length;
  const pA = expected(avgA, avgB);
  const onMain = ps.filter((p) => p.assignedPosition && p.assignedPosition === p.preferredPosition).length;
  return {
    teamA: { totalMmr: sum(a), averageMmr: Math.round(avgA), expectedWinRate: pA },
    teamB: { totalMmr: sum(b), averageMmr: Math.round(avgB), expectedWinRate: 1 - pA },
    balancePercent: Math.round(100 - Math.abs(pA - 0.5) * 200),
    reasoning: [
      `양 팀 평균 MMR 차이는 ${Math.abs(Math.round(avgA - avgB))}점입니다.`,
      `${ps.length}명 중 ${onMain}명을 주 라인에 배정했습니다.`,
      '최상위 MMR 두 명을 서로 다른 팀에 나눴습니다.',
    ],
  };
}

function participant(matchId: number, userId: number, team: Team, pos: Position | null, change = 0): TeamParticipant {
  const p = person(userId);
  return {
    id: matchId * 100 + userId,
    matchId,
    userId,
    nickname: p.nickname,
    profileImageUrl: null,
    assignedTeam: team,
    assignedPosition: pos,
    mmrChange: change,
    tier: p.rank,
    mmr: p.mmr,
    hasLinkedAccount: p.rank !== null,
    preferredPosition: p.lane,
  };
}

// 라인마다 두 명씩이면 같은 라인끼리 나눠 MMR 차이가 가장 작은 조합, 아니면 MMR 순 지그재그.
function balance(userIds: number[]): { userId: number; team: Team; pos: Position | null }[] {
  const pool = userIds.map(person);
  const byLane = Object.fromEntries(LANES.map((l) => [l, pool.filter((p) => p.lane === l)]));
  if (pool.length === 10 && LANES.every((l) => byLane[l].length === 2)) {
    let best: { userId: number; team: Team; pos: Position | null }[] = [];
    let bestDiff = Infinity;
    for (let mask = 0; mask < 32; mask++) {
      const out = LANES.flatMap((l, i) => {
        const [x, y] = byLane[l];
        const xa = Boolean(mask & (1 << i));
        return [
          { userId: x.id, team: (xa ? 'TEAM_A' : 'TEAM_B') as Team, pos: l },
          { userId: y.id, team: (xa ? 'TEAM_B' : 'TEAM_A') as Team, pos: l },
        ];
      });
      const avg = (t: Team) => out.filter((o) => o.team === t).reduce((s, o) => s + person(o.userId).mmr, 0) / 5;
      const diff = Math.abs(avg('TEAM_A') - avg('TEAM_B')) + Math.random() * 6;
      if (diff < bestDiff) {
        bestDiff = diff;
        best = out;
      }
    }
    return best;
  }
  return pool
    .slice()
    .sort((x, y) => y.mmr - x.mmr)
    .map((p, i) => ({ userId: p.id, team: (i % 4 === 0 || i % 4 === 3 ? 'TEAM_A' : 'TEAM_B') as Team, pos: p.lane }));
}

let nextMatchId = 25;
const matches: Match[] = [];

function addMatch(id: number, groupId: number, status: Match['status'], ids: number[], winner: Team | null, ago: number) {
  const plan = status === 'WAITING' ? [] : balance(ids);
  const ps = plan.map((o) => {
    const won = winner ? o.team === winner : null;
    const change = won === null ? 0 : won ? 14 + ((o.userId * 7) % 9) : -(12 + ((o.userId * 5) % 9));
    return participant(id, o.userId, o.team, o.pos, change);
  });
  matches.push({
    id,
    groupId,
    gameId: 1,
    createdBy: ME,
    status,
    winningTeam: winner,
    createdAt: daysAgo(ago, 2),
    participants: status === 'WAITING' ? ids.map((u) => participant(id, u, 'TEAM_A', null)) : ps,
    teamAnalysis: status === 'WAITING' ? null : analyze(ps),
  });
}

const TEN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
addMatch(24, 1, 'MATCHED', TEN, null, 0);
addMatch(23, 1, 'FINISHED', TEN, 'TEAM_A', 7);
addMatch(22, 1, 'FINISHED', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'TEAM_B', 14);
addMatch(21, 1, 'FINISHED', TEN, 'TEAM_A', 21);
addMatch(20, 1, 'FINISHED', TEN, 'TEAM_B', 28);
addMatch(12, 2, 'FINISHED', [1, 3, 5, 8, 9, 11], 'TEAM_A', 10);

const evaluated: Record<number, number[]> = { 23: [2, 3] };

/* ───────── Tiers ───────── */
function tierRows(groupId: number): TierEntry[] {
  const g = groups.find((x) => x.id === groupId)!;
  const ranked = g.members.map((m) => person(m.userId)).sort((a, b) => b.mmr - a.mmr);
  const finished = matches.filter((m) => m.groupId === groupId && m.status === 'FINISHED');
  return ranked.flatMap((p, idx) => {
    const tier = (Math.min(5, Math.floor((idx / ranked.length) * 5) + 1)) as TierEntry['tier'];
    const mine = finished.flatMap((m) => m.participants ?? []).filter((x) => x.userId === p.id);
    const cw = finished.filter((m) => m.participants?.some((x) => x.userId === p.id && x.assignedTeam === m.winningTeam)).length;
    return LANES.map((lane) => {
      const bonus = lane === p.lane ? 60 : lane === p.sub ? 0 : -90 - ((p.id * 13) % 40);
      const games = lane === p.lane ? 40 + p.id * 3 : lane === p.sub ? 15 + p.id : 3 + (p.id % 4);
      const wins = Math.round(games * (0.45 + ((p.id * 7 + lane.length) % 12) / 100));
      return {
        userId: p.id,
        nickname: p.nickname,
        profileImageUrl: null,
        position: lane,
        officialTier: p.rank,
        internalMmr: p.mmr,
        positionMmr: p.mmr + bonus,
        tier,
        wins,
        losses: games - wins,
        customMatchWins: cw,
        customMatchLosses: mine.length - cw,
        mainPosition: p.lane,
      };
    });
  });
}

/* ───────── Game account / stats ───────── */
const account: GameAccount = {
  id: 501,
  userId: ME,
  gameId: 1,
  gameNickname: '강철수비#KR1',
  puuid: 'mock-puuid',
  createdAt: daysAgo(118),
  game: { id: 1, name: '리그 오브 레전드', code: 'LOL' },
  stats: {
    id: 601,
    gameAccountId: 501,
    officialTier: 'PLATINUM II',
    internalMmr: 1720,
    mainPosition: 'TOP',
    subPosition: 'JUG',
    mannerScore: 4.6,
    summonerLevel: 312,
    profileIconId: 4568,
    updatedAt: daysAgo(0, 3),
  },
};

const CHAMPS: [number, string, RiotPosition][] = [
  [122, '다리우스', 'TOP'],
  [86, '가렌', 'TOP'],
  [24, '잭스', 'TOP'],
  [64, '리 신', 'JUNGLE'],
  [61, '오리아나', 'MIDDLE'],
  [266, '아트록스', 'TOP'],
  [516, '오른', 'TOP'],
];
const championStats: ChampionStat[] = CHAMPS.map(([id, name], i) => {
  const games = 28 - i * 3;
  const wins = Math.round(games * (0.62 - i * 0.03));
  return { championId: id, championName: name, gamesPlayed: games, wins, losses: games - wins, winRate: wins / games };
});
const masteries: ChampionMastery[] = CHAMPS.map(([id, name], i) => ({
  championId: id,
  championName: name,
  masteryLevel: Math.max(4, 10 - i),
  masteryPoints: 412_000 - i * 51_000,
  lastPlayTime: daysAgo(i),
}));
const matchHistory: MatchHistoryEntry[] = Array.from({ length: 20 }, (_, i) => {
  const [championId, championName, position] = CHAMPS[(i * 3) % CHAMPS.length];
  return {
    matchId: `KR_70000${i}`,
    queueType: i % 3 === 0 ? 'RANKED_FLEX_SR' : 'RANKED_SOLO_5x5',
    playedAt: daysAgo(Math.floor(i / 2), i * 3),
    durationSeconds: 1500 + ((i * 97) % 600),
    championId,
    championName,
    position,
    kills: 3 + ((i * 7) % 9),
    deaths: 1 + ((i * 5) % 7),
    assists: 2 + ((i * 3) % 11),
    cs: 150 + ((i * 37) % 90),
    goldEarned: 9000 + ((i * 731) % 5000),
    damageDealt: 14000 + ((i * 2311) % 18000),
    visionScore: 12 + ((i * 7) % 20),
    win: (i * 7) % 10 < 6,
  };
});

/* ───────── Router ───────── */
type Handler = (m: RegExpMatchArray, body: Record<string, unknown>, params: Record<string, unknown>) => unknown;

class MockHttpError {
  constructor(readonly status: number, readonly message: string) {}
}
const notFound = (what: string) => new MockHttpError(404, `${what}을(를) 찾을 수 없습니다.`);

function findMatch(id: string) {
  const m = matches.find((x) => x.id === Number(id));
  if (!m) throw notFound('내전');
  return m;
}
function findGroup(id: string) {
  const g = groups.find((x) => x.id === Number(id));
  if (!g) throw notFound('그룹');
  return g;
}
function refreshAnalysis(m: Match) {
  m.teamAnalysis = analyze(m.participants ?? []);
}

const routes: [string, RegExp, Handler][] = [
  ['get', /^\/users\/me$/, () => ({ user: users[ME] })],
  ['patch', /^\/users\/me$/, (_m, b) => ({ user: Object.assign(users[ME], b) })],
  ['post', /^\/users\/me\/profile-image$/, () => ({ user: users[ME] })],
  ['post', /^\/users\/me\/discord$/, () => ((users[ME].discordUserId = '000000000000000001'), {})],
  ['delete', /^\/users\/me\/discord$/, () => ((users[ME].discordUserId = null), {})],
  ['post', /^\/auth\/logout$/, () => ({})],
  [
    'get',
    /^\/users\/(\d+)$/,
    (m) => {
      const u = users[Number(m[1])];
      if (!u) throw notFound('사용자');
      const { email: _email, ...rest } = u;
      return { user: { ...rest, gameAccounts: [{ id: 500 + u.id, gameId: 1 }] } };
    },
  ],
  [
    'get',
    /^\/users\/me\/mmr-history$/,
    (_m, _b, q) => ({
      history: matches
        .filter((m) => m.status === 'FINISHED' && (!q.groupId || m.groupId === Number(q.groupId)))
        .flatMap((m) =>
          (m.participants ?? [])
            .filter((p) => p.userId === ME)
            .map((p) => ({ matchId: m.id, groupId: m.groupId, mmrChange: p.mmrChange, playedAt: m.createdAt })),
        ),
    }),
  ],
  [
    'get',
    /^\/games$/,
    () => ({
      games: [
        { id: 1, name: '리그 오브 레전드', code: 'LOL' },
        { id: 2, name: '발로란트', code: 'VALORANT' },
      ],
    }),
  ],
  ['get', /^\/users\/me\/game-accounts$/, () => ({ accounts: [account] })],
  ['post', /^\/users\/me\/game-accounts$/, () => ({ account })],
  ['delete', /^\/users\/me\/game-accounts\/\d+$/, () => ({})],
  ['post', /^\/game-accounts\/\d+\/refresh$/, () => ({ stats: { ...account.stats!, updatedAt: new Date().toISOString() } })],
  [
    'get',
    /^\/game-accounts\/(\d+)\/stats$/,
    (m) => {
      const p = person(Number(m[1]) - 500) ?? person(ME);
      return {
        stats: {
          stats: { ...account.stats!, gameAccountId: Number(m[1]), officialTier: p.rank, internalMmr: p.mmr, mainPosition: p.lane, subPosition: p.sub },
          positionStats: LANES.map((l, i) => ({
            id: 700 + i,
            gameAccountId: Number(m[1]),
            position: l,
            positionMmr: p.mmr + (l === p.lane ? 60 : l === p.sub ? 0 : -110),
            gamesPlayed: l === p.lane ? 64 : l === p.sub ? 22 : 4 + i,
            winRate: l === p.lane ? 0.56 : l === p.sub ? 0.5 : 0.38,
          })),
        },
      };
    },
  ],
  ['patch', /^\/game-accounts\/\d+\/preferred-position$/, (_m, b) => ({ stats: Object.assign(account.stats!, b) })],
  ['get', /^\/game-accounts\/\d+\/champion-stats$/, () => ({ championStats })],
  ['get', /^\/game-accounts\/\d+\/champion-masteries$/, () => ({ masteries })],
  [
    'get',
    /^\/game-accounts\/\d+\/match-history$/,
    (_m, _b, q) => ({
      matches: matchHistory.filter((x) => !q.position || x.position === q.position).slice(0, Number(q.limit ?? 20)),
    }),
  ],
  [
    'post',
    /^\/game-accounts\/\d+\/match-history\/sync$/,
    () => ({ syncedCount: 0, skippedCount: 20, positionStats: [] }),
  ],

  // Groups
  ['get', /^\/groups$/, () => ({ groups: groups.filter((g) => g.members.some((m) => m.userId === ME)).map(bareGroup) })],
  [
    'post',
    /^\/groups$/,
    (_m, b) => {
      const g: GroupDetail = {
        id: groups.length + 1,
        name: String(b.name ?? '새 그룹'),
        ownerId: ME,
        gameId: Number(b.gameId ?? 1),
        inviteCode: 'NEW-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
        discordWebhookUrl: null,
        discordGuildId: null,
        createdAt: new Date().toISOString(),
        members: [{ id: 999, groupId: groups.length + 1, userId: ME, role: 'OWNER', joinedAt: new Date().toISOString(), user: { id: ME, nickname: users[ME].nickname, profileImageUrl: null } }],
      };
      groups.push(g);
      return { group: bareGroup(g) };
    },
  ],
  ['post', /^\/groups\/join$/, () => { throw new MockHttpError(404, '초대 키가 올바르지 않습니다.'); }],
  ['get', /^\/groups\/(\d+)$/, (m) => ({ group: findGroup(m[1]) })],
  ['delete', /^\/groups\/(\d+)$/, (m) => (groups.splice(groups.indexOf(findGroup(m[1])), 1), {})],
  ['delete', /^\/groups\/(\d+)\/members\/me$/, (m) => {
    const g = findGroup(m[1]);
    g.members = g.members.filter((x) => x.userId !== ME);
    return {};
  }],
  ['delete', /^\/groups\/(\d+)\/members\/(\d+)$/, (m) => {
    const g = findGroup(m[1]);
    g.members = g.members.filter((x) => x.userId !== Number(m[2]));
    return {};
  }],
  ['post', /^\/groups\/(\d+)\/invite-code\/refresh$/, (m) => {
    const g = findGroup(m[1]);
    g.inviteCode = 'FRI-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    return { group: bareGroup(g) };
  }],
  ['patch', /^\/groups\/(\d+)\/discord-webhook$/, (m, b) => ({ group: bareGroup(Object.assign(findGroup(m[1]), { discordWebhookUrl: (b.webhookUrl as string | null) ?? null })) })],
  ['patch', /^\/groups\/(\d+)\/discord-guild$/, (m) => ({ group: bareGroup(Object.assign(findGroup(m[1]), { discordGuildId: null })) })],
  ['patch', /^\/groups\/(\d+)\/owner$/, (m, b) => {
    const g = findGroup(m[1]);
    const to = Number(b.newOwnerId);
    g.ownerId = to;
    g.members.forEach((x) => (x.role = x.userId === to ? 'OWNER' : 'MEMBER'));
    return { group: bareGroup(g) };
  }],
  ['get', /^\/groups\/\d+\/discord-guild\/invite-url$/, () => ({ url: 'https://discord.com/oauth2/authorize?client_id=0' })],
  [
    'get',
    /^\/groups\/(\d+)\/tiers$/,
    (m, _b, q) => {
      findGroup(m[1]);
      const rows = tierRows(Number(m[1]));
      return { tiers: q.position ? rows.filter((r) => r.position === q.position) : rows, lastUpdatedAt: daysAgo(0, 3) };
    },
  ],
  [
    'post',
    /^\/groups\/(\d+)\/tiers\/refresh$/,
    (m) => {
      const g = findGroup(m[1]);
      return {
        tiers: tierRows(g.id),
        lastUpdatedAt: new Date().toISOString(),
        refresh: { total: g.members.length, succeeded: g.members.length - 1, skipped: 0, failed: 1, errors: [{ gameAccountId: 512, message: '라이엇 계정을 찾을 수 없습니다.' }] },
      };
    },
  ],

  // Matches
  ['get', /^\/groups\/(\d+)\/matches$/, (m) => ({ matches: matches.filter((x) => x.groupId === Number(m[1])).sort((a, b) => b.id - a.id) })],
  [
    'post',
    /^\/groups\/(\d+)\/matches$/,
    (m) => {
      const match: Match = { id: nextMatchId++, groupId: Number(m[1]), gameId: 1, createdBy: ME, status: 'WAITING', winningTeam: null, createdAt: new Date().toISOString(), participants: [], teamAnalysis: null };
      matches.push(match);
      return { match };
    },
  ],
  ['get', /^\/matches\/(\d+)$/, (m) => ({ match: findMatch(m[1]) })],
  ['delete', /^\/matches\/(\d+)$/, (m) => (matches.splice(matches.indexOf(findMatch(m[1])), 1), {})],
  [
    'post',
    /^\/matches\/(\d+)\/teams\/generate$/,
    (m, b) => {
      const match = findMatch(m[1]);
      const ids = (b.participantUserIds as number[] | undefined) ?? match.participants?.map((p) => p.userId) ?? [];
      match.participants = balance(ids).map((o) => participant(match.id, o.userId, o.team, o.pos));
      match.status = 'MATCHED';
      refreshAnalysis(match);
      return { match };
    },
  ],
  [
    'patch',
    /^\/matches\/(\d+)\/teams$/,
    (m, b) => {
      const match = findMatch(m[1]);
      const list = (b.assignments as { userId: number; assignedTeam: Team; assignedPosition?: Position }[]) ?? [];
      match.participants = list.map((a) => participant(match.id, a.userId, a.assignedTeam, a.assignedPosition ?? null));
      refreshAnalysis(match);
      return { match };
    },
  ],
  [
    'post',
    /^\/matches\/(\d+)\/duplicate-teams$/,
    (m) => {
      const src = findMatch(m[1]);
      const id = nextMatchId++;
      const ps = (src.participants ?? []).map((p) => participant(id, p.userId, p.assignedTeam, p.assignedPosition));
      const match: Match = { ...src, id, status: 'MATCHED', winningTeam: null, createdAt: new Date().toISOString(), participants: ps, teamAnalysis: analyze(ps) };
      matches.push(match);
      return { match };
    },
  ],
  [
    'post',
    /^\/matches\/(\d+)\/finish$/,
    (m, b) => {
      const match = findMatch(m[1]);
      const winner = b.winningTeam as Team;
      match.status = 'FINISHED';
      match.winningTeam = winner;
      match.participants = (match.participants ?? []).map((p) => {
        const change = p.assignedTeam === winner ? 14 + ((p.userId * 7) % 9) : -(12 + ((p.userId * 5) % 9));
        person(p.userId).mmr += change;
        return { ...p, mmrChange: change };
      });
      return { match };
    },
  ],
  [
    'get',
    /^\/matches\/(\d+)\/mmr-changes$/,
    (m) => ({
      changes: (findMatch(m[1]).participants ?? [])
        .filter(() => findMatch(m[1]).status === 'FINISHED')
        .map((p): MmrChange => ({ userId: p.userId, assignedTeam: p.assignedTeam, mmrChange: p.mmrChange })),
    }),
  ],
  ['get', /^\/matches\/(\d+)\/evaluations\/me$/, (m) => ({ targetIds: evaluated[Number(m[1])] ?? [] })],
  [
    'post',
    /^\/matches\/(\d+)\/evaluations$/,
    (m, b) => {
      const id = Number(m[1]);
      (evaluated[id] ??= []).push(Number(b.targetId));
      return { evaluation: { id: Date.now(), matchId: id, evaluatorId: ME, targetId: Number(b.targetId), score: Number(b.score), comment: (b.comment as string) ?? null, createdAt: new Date().toISOString() } };
    },
  ],
];

function parseBody(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'string') return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  await new Promise((r) => setTimeout(r, 180 + Math.random() * 220));
  const method = (config.method ?? 'get').toLowerCase();
  const path = (config.url ?? '').replace(/^https?:\/\/[^/]+/, '').replace(/^\/api/, '').split('?')[0];
  const reply = (status: number, data: unknown): AxiosResponse => ({ data, status, statusText: String(status), headers: {}, config });

  for (const [verb, re, handler] of routes) {
    const m = verb === method ? path.match(re) : null;
    if (!m) continue;
    try {
      return reply(200, handler(m, parseBody(config.data), (config.params ?? {}) as Record<string, unknown>));
    } catch (e) {
      if (!(e instanceof MockHttpError)) throw e;
      const res = reply(e.status, { error: { message: e.message } });
      throw new AxiosError(e.message, String(e.status), config, null, res);
    }
  }
  const res = reply(404, { error: { message: `목 데이터에 없는 요청입니다: ${method.toUpperCase()} ${path}` } });
  throw new AxiosError('mock 404', '404', config, null, res);
};
