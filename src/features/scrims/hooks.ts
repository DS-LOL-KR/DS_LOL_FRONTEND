import { useMutation, useQuery } from '@tanstack/react-query';
import { createScrim, getScrim } from './api';

export function useScrim(scrimId: string) {
  return useQuery({
    queryKey: ['scrims', scrimId],
    queryFn: () => getScrim(scrimId),
    enabled: Boolean(scrimId),
  });
}

export function useCreateScrim() {
  return useMutation({ mutationFn: createScrim });
}
