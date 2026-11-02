import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, logout } from './api';
import { clearActiveGroupId } from '../../utils/activeGroup';
import { clearQueryCache, STALE_TIME } from '../../api/queryClient';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
    staleTime: STALE_TIME.account,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // 저장된 캐시까지 지운 뒤 ['me']만 null로 — 다음 사람이 이 브라우저로 로그인해도 앞사람
      // 그룹/전적이 안 보이게.
      clearQueryCache();
      queryClient.setQueryData(['me'], null);
      clearActiveGroupId();
    },
  });
}
