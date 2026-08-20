import { useMutation, useQuery } from '@tanstack/react-query';
import { getMe, login } from './api';

export function useMe() {
  return useQuery({ queryKey: ['auth', 'me'], queryFn: getMe });
}

export function useLogin() {
  return useMutation({ mutationFn: login });
}
