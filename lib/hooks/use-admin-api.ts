import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '@/lib/api-client';
import { RAILWAY_ENDPOINTS, RAILWAY_ROUTES } from '@/constants/railway-api';
import type {
  AdminDashboardData,
  AdminDoctor,
  AdminDoctorProfileData,
  AdminCaseAudit,
  AdminCommunityArticle,
  AdminCommunityFeed,
  AdminCommunityComment,
  AdminChatConversation,
  AdminSystemLog,
  AdminGlobalReport,
  Paginator,
} from '@/types/api';

export const ADMIN_KEYS = {
  dashboard: ['admin', 'dashboard'] as const,
  doctors: ['admin', 'doctors'] as const,
  doctorProfile: (id: number | string) => ['admin', 'doctor', id] as const,
  cases: ['admin', 'cases'] as const,
  communityArticles: ['admin', 'community', 'articles'] as const,
  communityFeeds: ['admin', 'community', 'feeds'] as const,
  communityComments: ['admin', 'community', 'comments'] as const,
  chat: ['admin', 'chat'] as const,
  systemLog: ['admin', 'system-log'] as const,
  globalReport: ['admin', 'global-report'] as const,
};

function unwrapData<T>(resp: unknown): T {
  return (resp as { data: T }).data;
}

interface InfinitePage<T> {
  items: T[];
  nextPage: number | null;
}

function buildUrl(endpoint: string, pageParamName: string, page: number): string {
  const sep = endpoint.includes('?') ? '&' : '?';
  return endpoint + sep + pageParamName + '=' + page;
}

function toInfinitePage<T>(paginator: Paginator<T> | undefined, page: number): InfinitePage<T> {
  if (!paginator) {
    return { items: [], nextPage: null };
  }
  const nextPage = paginator.next_page_url ? page + 1 : null;
  return { items: paginator.data ?? [], nextPage };
}

function flatten<T>(pages: InfinitePage<T>[] | undefined): T[] {
  return (pages ?? []).flatMap((p) => p.items);
}

function useAdminInfinite<T>(key: readonly unknown[], endpoint: string, pageParamName: string, subKey?: string) {
  const query = useInfiniteQuery({
    queryKey: key,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const resp = await authFetch<unknown>(buildUrl(endpoint, pageParamName, pageParam as number));
      const root = (resp as { data?: unknown }).data;
      const paginator = (subKey
        ? (root as Record<string, Paginator<T>> | undefined)?.[subKey]
        : (root as Paginator<T> | undefined));
      return toInfinitePage<T>(paginator, pageParam as number);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
  return { query, items: flatten<T>(query.data?.pages) };
}

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: ADMIN_KEYS.dashboard,
    queryFn: async () => unwrapData<AdminDashboardData>(await authFetch<unknown>(RAILWAY_ENDPOINTS.adminDashboard)),
  });
}

export function useAdminDoctorsInfinite() {
  return useAdminInfinite<AdminDoctor>(ADMIN_KEYS.doctors, RAILWAY_ENDPOINTS.adminDoctors, 'page');
}

export function useAdminDoctorProfileQuery(id: number | string | undefined) {
  return useQuery({
    queryKey: ADMIN_KEYS.doctorProfile(id ?? ''),
    enabled: id !== undefined && id !== null && id !== '',
    queryFn: async () =>
      unwrapData<AdminDoctorProfileData>(await authFetch<unknown>(RAILWAY_ROUTES.adminDoctorProfile(id as number | string))),
  });
}

export function useAdminCasesInfinite() {
  return useAdminInfinite<AdminCaseAudit>(ADMIN_KEYS.cases, RAILWAY_ENDPOINTS.adminCases, 'page');
}

export function useAdminCommunityArticlesInfinite() {
  return useAdminInfinite<AdminCommunityArticle>(ADMIN_KEYS.communityArticles, RAILWAY_ENDPOINTS.adminCommunity, 'articles_page', 'articles');
}

export function useAdminCommunityFeedsInfinite() {
  return useAdminInfinite<AdminCommunityFeed>(ADMIN_KEYS.communityFeeds, RAILWAY_ENDPOINTS.adminCommunity, 'feeds_page', 'feeds');
}

export function useAdminCommunityCommentsInfinite() {
  return useAdminInfinite<AdminCommunityComment>(ADMIN_KEYS.communityComments, RAILWAY_ENDPOINTS.adminCommunity, 'comments_page', 'comments');
}

export function useAdminChatInfinite() {
  const query = useInfiniteQuery({
    queryKey: ADMIN_KEYS.chat,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const resp = await authFetch<unknown>(buildUrl(RAILWAY_ENDPOINTS.adminChatManagement, 'chat_page', pageParam as number));
      const paginator = (resp as { data?: { Conversation?: Paginator<AdminChatConversation> } }).data?.Conversation;
      return toInfinitePage<AdminChatConversation>(paginator, pageParam as number);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
  return { query, items: flatten<AdminChatConversation>(query.data?.pages) };
}

export function useAdminSystemLogInfinite() {
  return useAdminInfinite<AdminSystemLog>(ADMIN_KEYS.systemLog, RAILWAY_ENDPOINTS.adminSystemLog, 'page');
}

export function useAdminGlobalReportQuery() {
  return useQuery({
    queryKey: ADMIN_KEYS.globalReport,
    queryFn: async () => authFetch<AdminGlobalReport>(RAILWAY_ENDPOINTS.adminGlobalReport),
  });
}

export function useToggleUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => authFetch<unknown>(RAILWAY_ROUTES.adminToggleUser(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.doctors });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard });
    },
  });
}

export function useAssignAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => authFetch<unknown>(RAILWAY_ROUTES.adminAssignAdmin(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.doctors });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard });
    },
  });
}

export function useAdminDeletePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => authFetch<unknown>(RAILWAY_ROUTES.adminDeletePost(id), { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.communityArticles });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.communityFeeds });
    },
  });
}

export function useAdminDeleteCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => authFetch<unknown>(RAILWAY_ROUTES.adminDeleteComment(id), { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.communityComments });
    },
  });
}

export function useAdminDeleteConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => authFetch<unknown>(RAILWAY_ROUTES.adminDeleteConversation(id), { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.chat });
    },
  });
}