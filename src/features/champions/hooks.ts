import { useQuery } from '@tanstack/react-query';
import { getChampionNames } from './api';

// 백엔드가 championName을 null로 내려주는 경우(Data Dragon 조회 실패, 신규
// 챔피언 등)가 있어 "챔피언 #103"처럼 보이던 문제 수정 — 프론트에서 직접
// Data Dragon ko_KR로 championId를 이름으로 풀어줌. 백엔드 이름은 영문이라
// 한글 이름을 우선 쓰고, 둘 다 없을 때만 #id로 표시.
export function useChampionName() {
  const { data: names } = useQuery({
    queryKey: ['champion-names'],
    queryFn: getChampionNames,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
  return (championId: number, fallback: string | null) =>
    names?.get(championId) ?? fallback ?? `챔피언 #${championId}`;
}
