// Riot's Data Dragon CDN (public, CORS-open) — not our backend, so this uses
// plain fetch instead of apiClient (no session cookie, different origin).
const DDRAGON = 'https://ddragon.leagueoflegends.com';

interface ChampionJson {
  data: Record<string, { key: string; name: string }>;
}

// championId(숫자) → 한글 챔피언 이름. 최신 패치 버전의 ko_KR 데이터를 씀.
// Map이 아니라 보통 객체로 돌려줌 — 쿼리 캐시가 sessionStorage에 JSON으로 저장되는데(queryClient.ts)
// Map은 JSON으로 바꾸면 {}가 돼서, 새로고침 후 복원된 값에 .get이 없어 전적 화면이 깨졌음.
export async function getChampionNames(): Promise<Record<number, string>> {
  const versions: string[] = await fetch(`${DDRAGON}/api/versions.json`).then((r) => r.json());
  const json: ChampionJson = await fetch(`${DDRAGON}/cdn/${versions[0]}/data/ko_KR/champion.json`).then((r) =>
    r.json(),
  );
  return Object.fromEntries(Object.values(json.data).map((c) => [Number(c.key), c.name]));
}
