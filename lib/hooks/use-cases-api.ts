import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '@/lib/api-client';
import { RAILWAY_ENDPOINTS, RAILWAY_ROUTES } from '@/constants/railway-api';
import type { Case, Evidence } from '@/types/api';

// Case list payloads arrive in several shapes across the Railway endpoints:
// a bare array, `{ cases: [] }`, `{ data: [] }`, or a nested
// `{ data: { completed_cases_list | active_cases_list: [] } }`. The server's
// nested keys are mislabeled (active-case returns `completed_cases_list`,
// evidence-list returns `active_cases_list`), so probe all of them.
function unwrapList<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) {
    return resp as T[];
  }
  if (!resp || typeof resp !== 'object') {
    return [];
  }
  const root = resp as { cases?: unknown; data?: unknown };
  if (Array.isArray(root.cases)) {
    return root.cases as T[];
  }
  if (Array.isArray(root.data)) {
    return root.data as T[];
  }
  if (root.data && typeof root.data === 'object') {
    const inner = root.data as {
      completed_cases_list?: unknown;
      active_cases_list?: unknown;
      cases?: unknown;
    };
    if (Array.isArray(inner.completed_cases_list)) {
      return inner.completed_cases_list as T[];
    }
    if (Array.isArray(inner.active_cases_list)) {
      return inner.active_cases_list as T[];
    }
    if (Array.isArray(inner.cases)) {
      return inner.cases as T[];
    }
  }
  return [];
}

function toCase(raw: unknown): Case {
  const obj = (raw ?? {}) as Partial<Case> & { title?: string };
  return {
    id: obj.id ?? 0,
    name: obj.name ?? obj.title ?? '',
    description: obj.description ?? '',
    status: obj.status ?? '',
    user_id: obj.user_id,
    created_at: obj.created_at,
  };
}

export function isCompletedStatus(status: string): boolean {
  const normalized = status.trim().toLowerCase();
  return normalized === 'completed' || normalized === 'complete';
}

// A single case may come back wrapped as `{ data: Case }` or directly.
function unwrapObject<T>(resp: unknown): T | null {
  if (resp && typeof resp === 'object') {
    const data = (resp as { data?: unknown }).data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data as T;
    }
    return resp as T;
  }
  return null;
}

// Case detail screens render the case plus its attached evidence. The server
// may nest evidence under the case or alongside it; surface both defensively.
export interface CaseDetail extends Case {
  evidence?: Evidence[];
}

export const CASES_QUERY_KEY = ['cases'] as const;

export function formatCaseDate(createdAt?: string): string {
  if (!createdAt) {
    return 'N/A';
  }
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) {
    return createdAt;
  }
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function caseDisplayId(id: number | string): string {
  return `CASE-${id}`;
}

export function buildCaseContext(caseObj: CaseDetail): string {
  const lines: string[] = [];
  lines.push(`Case ${caseDisplayId(caseObj.id)}: ${caseObj.name || 'Untitled'}`);
  if (caseObj.status) {
    lines.push(`Status: ${caseObj.status}`);
  }
  if (caseObj.description) {
    lines.push(`Description: ${caseObj.description}`);
  }

  const evidence = caseObj.evidence ?? [];
  if (evidence.length > 0) {
    lines.push(`Evidence (${evidence.length}):`);
    evidence.forEach((ev, i) => {
      const parts = [`${i + 1}. ${ev.name || 'Unnamed evidence'}`];
      if (ev.model_used) {
        parts.push(`[${ev.model_used}]`);
      }
      if (ev.data && typeof ev.data === 'object') {
        const dataStr = Object.entries(ev.data)
          .filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object')
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        if (dataStr) {
          parts.push(`(${dataStr})`);
        }
      }
      lines.push(parts.join(' '));
    });
  } else {
    lines.push('Evidence: none attached.');
  }

  return lines.join('\n');
}

export function useActiveCasesQuery() {
  return useQuery({
    queryKey: ['cases', 'active'],
    queryFn: async () => {
      const resp = await authFetch<unknown>(RAILWAY_ENDPOINTS.activeCases);
      return unwrapList<unknown>(resp).map(toCase);
    },
  });
}

export function useCompletedCasesQuery() {
  return useQuery({
    queryKey: ['cases', 'completed'],
    queryFn: async () => {
      const resp = await authFetch<unknown>(RAILWAY_ENDPOINTS.allCases);
      return unwrapList<unknown>(resp)
        .map(toCase)
        .filter((c) => isCompletedStatus(c.status));
    },
  });
}

export function useAllCasesQuery() {
  return useQuery({
    queryKey: ['cases', 'all'],
    queryFn: async () => {
      const resp = await authFetch<unknown>(RAILWAY_ENDPOINTS.allCases);
      return unwrapList<unknown>(resp).map(toCase);
    },
  });
}

export function useCaseDetailQuery(id: number | string | undefined) {
  return useQuery({
    queryKey: ['cases', 'detail', id],
    enabled: id !== undefined && id !== null && id !== '',
    queryFn: async () => {
      const resp = await authFetch<unknown>(RAILWAY_ROUTES.showCase(id as number | string));
      const caseObj = unwrapObject<CaseDetail>(resp);
      if (!caseObj) {
        throw new Error('Case not found');
      }
      // Evidence may live on the case object, under a sibling key, or under data.
      if (!Array.isArray(caseObj.evidence)) {
        const root = resp as { evidence?: unknown; data?: { evidence?: unknown } } | null;
        const fromRoot = root?.evidence;
        const fromData = root?.data?.evidence;
        if (Array.isArray(fromRoot)) {
          caseObj.evidence = fromRoot as Evidence[];
        } else if (Array.isArray(fromData)) {
          caseObj.evidence = fromData as Evidence[];
        } else {
          caseObj.evidence = [];
        }
      }
      return caseObj;
    },
  });
}

export interface CreateCasePayload {
  name: string;
  description: string;
  status: string;
  user_id: number;
}

export function useCreateCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCasePayload) => {
      const resp = await authFetch<unknown>(RAILWAY_ENDPOINTS.createCase, { method: 'POST', json: payload });
      const created = unwrapObject<Case>(resp);
      if (!created || created.id === undefined) {
        throw new Error('Case was created but the server did not return its id.');
      }
      return toCase(created);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEY });
    },
  });
}

export interface UpdateCasePayload {
  id: number | string;
  name: string;
  description: string;
}

export function useUpdateCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, description }: UpdateCasePayload) =>
      authFetch<Case>(RAILWAY_ROUTES.updateCase(id), {
        method: 'PUT',
        json: { name, description },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEY });
    },
  });
}

export function useDeleteCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      authFetch<unknown>(RAILWAY_ROUTES.deleteCase(id), { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEY });
    },
  });
}

export function useToggleActiveCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      authFetch<unknown>(RAILWAY_ROUTES.toggleActiveCase(id)),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['cases', 'detail', id] });
    },
  });
}

export interface DeleteEvidencePayload {
  evidenceId: number | string;
  caseId: number | string;
}

export function useDeleteEvidenceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ evidenceId, caseId }: DeleteEvidencePayload) =>
      authFetch<unknown>(RAILWAY_ROUTES.deleteEvidence(evidenceId, caseId), { method: 'DELETE' }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases', 'detail', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEY });
    },
  });
}
