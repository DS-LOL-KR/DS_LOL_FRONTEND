import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, logout } from './api';
import { clearActiveGroupId } from '../../utils/activeGroup';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      clearActiveGroupId();
    },
  });
}
