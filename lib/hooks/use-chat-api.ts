import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '@/lib/api-client';
import { RAILWAY_ENDPOINTS, RAILWAY_ROUTES } from '@/constants/railway-api';
import type { ChatConversation, ChatMessage, PubMedSource, TavilySource } from '@/types/api';

// The Railway backend may wrap list payloads as `{ data: T[] }` or return the
// array directly. `unwrapList` normalizes both shapes defensively.
function unwrapList<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) {
    return resp as T[];
  }
  if (resp && typeof resp === 'object' && Array.isArray((resp as { data?: unknown }).data)) {
    return (resp as { data: T[] }).data;
  }
  return [];
}

export const CHAT_CONVERSATIONS_KEY = ['chat', 'conversations'] as const;

// GET /api/chat -> the list of chat conversations shown in the drawer.
export function useConversationsQuery() {
  return useQuery({
    queryKey: CHAT_CONVERSATIONS_KEY,
    queryFn: async () => {
      const resp = await authFetch<unknown>(RAILWAY_ENDPOINTS.chat);
      return unwrapList<ChatConversation>(resp);
    },
  });
}

// GET /api/conversations/{id}/messages -> messages for the selected thread.
// Disabled until a conversation id is actually selected.
export function useMessagesQuery(conversationId: number | string | null | undefined) {
  return useQuery({
    queryKey: ['chat', 'messages', conversationId],
    enabled: conversationId !== undefined && conversationId !== null && conversationId !== '',
    queryFn: async () => {
      const resp = await authFetch<unknown>(
        RAILWAY_ROUTES.conversationMessages(conversationId as number | string),
      );
      return unwrapList<ChatMessage>(resp);
    },
  });
}

export interface SendMessagePayload {
  query: string;
  conversationId?: number | string | null;
  caseContext?: string;
  caseContextLabel?: string;
}

export interface SendMessageResult {
  reply: string;
  conversationId?: number | string;
  pubmedSources: PubMedSource[];
  tavilySources: TavilySource[];
  warnings: string[];
}

interface ChatSendResponse {
  conversation_id?: number | string;
  assistant_message?: ChatMessage;
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ query, conversationId, caseContext, caseContextLabel }: SendMessagePayload): Promise<SendMessageResult> => {
      const body: Record<string, unknown> = { query };
      if (conversationId !== undefined && conversationId !== null && conversationId !== '') {
        body.conversation_id = conversationId;
      }
      if (caseContext) {
        body.case_context = caseContext;
      }
      if (caseContextLabel) {
        body.case_context_label = caseContextLabel;
      }
      const resp = await authFetch<ChatSendResponse>(RAILWAY_ENDPOINTS.chatSend, {
        method: 'POST',
        json: body,
      });
      const meta = resp.assistant_message?.metadata ?? undefined;
      return {
        reply: resp.assistant_message?.content ?? '',
        conversationId: resp.conversation_id,
        pubmedSources: meta?.pubmed_sources ?? [],
        tavilySources: meta?.tavily_sources ?? [],
        warnings: meta?.warnings ?? [],
      };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: CHAT_CONVERSATIONS_KEY });
      const id = result.conversationId ?? variables.conversationId;
      if (id !== undefined && id !== null && id !== '') {
        queryClient.invalidateQueries({ queryKey: ['chat', 'messages', id] });
      }
    },
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      authFetch<unknown>(RAILWAY_ROUTES.deleteConversation(id), { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_CONVERSATIONS_KEY });
    },
  });
}

export function useRenameConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: number | string; title: string }) =>
      authFetch<unknown>(RAILWAY_ROUTES.renameConversation(id), { method: 'PUT', json: { title } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_CONVERSATIONS_KEY });
    },
  });
}
