import { useMutation, useQuery } from '@tanstack/react-query';
import { createGroup, getGroups } from './api';

export function useGroups() {
  return useQuery({ queryKey: ['groups'], queryFn: getGroups });
}

export function useCreateGroup() {
  return useMutation({ mutationFn: createGroup });
}
