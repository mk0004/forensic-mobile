import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { RAILWAY_ENDPOINTS } from '@/constants/railway-api';
import { authFetch } from '@/lib/api-client';
import type {
  DashboardChartPoint,
  DashboardData,
  DashboardOverview,
  DashboardStat,
} from '@/types/api';

const EMPTY_STAT: DashboardStat = { total: 0 };

const EMPTY_OVERVIEW: DashboardOverview = {
  active_cases: EMPTY_STAT,
  evidences: EMPTY_STAT,
  completed_cases: EMPTY_STAT,
};

function toStat(raw: unknown): DashboardStat {
  if (!raw || typeof raw !== 'object') {
    return EMPTY_STAT;
  }
  const obj = raw as Partial<DashboardStat>;
  return {
    total: typeof obj.total === 'number' ? obj.total : 0,
    new_this_week: obj.new_this_week,
    pending_review: obj.pending_review,
    completed_this_month: obj.completed_this_month,
  };
}

function toOverview(raw: unknown): DashboardOverview {
  if (!raw || typeof raw !== 'object') {
    return EMPTY_OVERVIEW;
  }
  const obj = raw as Partial<DashboardOverview>;
  return {
    active_cases: toStat(obj.active_cases),
    evidences: toStat(obj.evidences),
    completed_cases: toStat(obj.completed_cases),
  };
}

function toChartData(raw: unknown): DashboardChartPoint[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((point) => {
    const obj = (point ?? {}) as Partial<DashboardChartPoint>;
    return {
      day: obj.day ?? '',
      cases: typeof obj.cases === 'number' ? obj.cases : 0,
      evidence: typeof obj.evidence === 'number' ? obj.evidence : 0,
    };
  });
}

async function fetchDashboard(): Promise<DashboardData> {
  const payload = await authFetch<{ data?: unknown }>(RAILWAY_ENDPOINTS.dashboard);
  const inner = payload && typeof payload === 'object' ? payload.data : undefined;
  const root = (inner ?? payload) as { overview?: unknown; chart_data?: unknown };
  return {
    overview: toOverview(root?.overview),
    chart_data: toChartData(root?.chart_data),
  };
}

export function useDashboardQuery(): UseQueryResult<DashboardData, Error> {
  return useQuery<DashboardData, Error>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });
}
