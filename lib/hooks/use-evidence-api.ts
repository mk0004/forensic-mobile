import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '@/lib/api-client';
import { RAILWAY_ENDPOINTS, RAILWAY_ROUTES } from '@/constants/railway-api';
import type { Evidence, SaveAsEvidenceRequest } from '@/types/api';

// The delete-evidence mutation already lives in use-cases-api.ts (it invalidates
// both the case-detail and the cases list). Re-export it so evidence screens have
// a single import surface and we never duplicate the hook.
export { useDeleteEvidenceMutation } from '@/lib/hooks/use-cases-api';
export type { DeleteEvidencePayload } from '@/lib/hooks/use-cases-api';

export const EVIDENCE_QUERY_KEY = ['evidence'] as const;

function unwrapList<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) {
    return resp as T[];
  }
  if (resp && typeof resp === 'object' && Array.isArray((resp as { data?: unknown }).data)) {
    return (resp as { data: T[] }).data;
  }
  if (resp && typeof resp === 'object') {
    const responseData = (resp as { data?: unknown }).data;
    if (responseData && typeof responseData === 'object') {
      const evidenceList = (responseData as { evidences_list?: unknown }).evidences_list;
      if (Array.isArray(evidenceList)) {
        return evidenceList as T[];
      }
    }
  }
  return [];
}

export function useEvidenceListQuery() {
  return useQuery({
    queryKey: ['evidence', 'list'],
    queryFn: async () => {
      const resp = await authFetch<unknown>(RAILWAY_ENDPOINTS.evidenceList);
      return unwrapList<Evidence>(resp);
    },
  });
}

export function useSaveAsEvidenceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveAsEvidenceRequest) =>
      authFetch<Evidence>(RAILWAY_ENDPOINTS.saveAsEvidence, { method: 'POST', json: payload }),
    onSuccess: () => {
      // refetchType:'all' forces even unmounted case-detail queries to refresh,
      // so returning to a case after adding evidence shows it immediately.
      queryClient.invalidateQueries({ queryKey: EVIDENCE_QUERY_KEY, refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['cases'], refetchType: 'all' });
    },
  });
}

export interface UpdateEvidencePayload {
  evidenceId: number | string;
  caseId: number | string;
  name: string;
}

export function useUpdateEvidenceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ evidenceId, caseId, name }: UpdateEvidencePayload) =>
      authFetch<Evidence>(RAILWAY_ROUTES.updateEvidence(evidenceId, caseId), {
        method: 'PUT',
        json: { name },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVIDENCE_QUERY_KEY });
    },
  });
}
