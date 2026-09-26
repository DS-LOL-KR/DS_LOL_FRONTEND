// Riot's Data Dragon CDN (public, CORS-open) — not our backend, so this uses
// plain fetch instead of apiClient (no session cookie, different origin).
const DDRAGON = 'https://ddragon.leagueoflegends.com';

interface ChampionJson {
  data: Record<string, { key: string; name: string }>;
}

// championId(숫자) → 한글 챔피언 이름. 최신 패치 버전의 ko_KR 데이터를 씀.
export async function getChampionNames(): Promise<Map<number, string>> {
  const versions: string[] = await fetch(`${DDRAGON}/api/versions.json`).then((r) => r.json());
  const json: ChampionJson = await fetch(`${DDRAGON}/cdn/${versions[0]}/data/ko_KR/champion.json`).then((r) =>
    r.json(),
  );
  return new Map(Object.values(json.data).map((c) => [Number(c.key), c.name]));
}
