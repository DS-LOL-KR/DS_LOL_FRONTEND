import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// 데이터마다 "다시 물어보지 않고 캐시를 그대로 쓰는 시간". API 왕복이 0.3~1초라(Cloudflare
// Worker → madp 경유, 2026-11-02 측정) 같은 화면을 오갈 때마다 기다리지 않게 늘려둠.
// 내가 바꾸는 건 각 mutation의 invalidateQueries가 바로 반영하고, 디스코드 버튼이나 다른
// 사람이 바꾼 건 이 시간이 지나면 다시 받아옴 — 그래서 남이 자주 바꾸는 데이터일수록 짧게.
export const STALE_TIME = {
  // 기본값 — 내전 목록/상세처럼 디스코드 [참가]·[승리팀] 버튼으로도 수시로 바뀌는 것
  live: 30_000,
  // 티어표·그룹·남의 프로필 — 그룹 전체 갱신이나 내전 결과로 바뀜(남이 누를 수도 있음)
  group: 2 * 60_000,
  // 계정 전적·통계 — 갱신/동기화 버튼을 눌러야만 바뀌고, 누르면 invalidate됨
  account: 5 * 60_000,
  // 게임 종목 목록처럼 사실상 안 바뀌는 것
  static: 24 * 60 * 60_000,
} as const;

// 새로고침해도 마지막으로 본 데이터를 바로 보여주고 뒤에서 새로 받아오도록(persistQueryClient)
// 캐시를 저장해두는 최대 기간. 이보다 오래된 캐시는 버리고 처음부터 받음.
export const PERSIST_MAX_AGE = 24 * 60 * 60_000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: STALE_TIME.live,
      refetchOnWindowFocus: false,
      // 메모리에서 지워지면 저장도 못 하므로 저장 기간과 맞춤
      gcTime: PERSIST_MAX_AGE,
    },
  },
});

// localStorage가 아니라 sessionStorage — 학교 공용 PC에서 로그아웃 안 하고 창을 닫으면 다음
// 사람이 사이트를 열자마자 앞사람 그룹/전적이 잠깐 보일 수 있어서, 탭을 닫으면 지워지게 함.
// 새로고침(F5)에는 그대로 남아서 체감 효과는 유지됨. 접근 자체가 막힌 환경(일부 사생활
// 보호 모드)에서는 저장 없이 평소처럼 동작함.
function getSessionStorage(): Storage | undefined {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

export const queryPersister = createSyncStoragePersister({
  storage: getSessionStorage(),
  key: 'ds-lol-query-cache',
});

// 응답 모양이 바뀌는 배포를 하면 이 값을 올려서 예전 모양의 저장된 캐시를 버리게 함.
// v2: 챔피언 이름 캐시가 Map → 보통 객체로 바뀜(2026-11-09). v1에 저장된 깨진 {}를 버리려고 올림.
// 캐시에 넣는 값은 JSON으로 저장되므로 Map·Set·Date 같은 건 queryFn에서 돌려주지 말 것.
export const PERSIST_BUSTER = 'v2';

// 로그아웃 시 메모리와 저장된 캐시를 둘 다 지움 — 같은 브라우저로 다른 사람이 로그인했을 때
// 앞사람 데이터가 보이지 않게.
export function clearQueryCache(): void {
  queryClient.clear();
  void queryPersister.removeClient();
}
