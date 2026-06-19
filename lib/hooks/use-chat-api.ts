import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '@/lib/api-client';
import { RAILWAY_ENDPOINTS, RAILWAY_ROUTES } from '@/constants/railway-api';
import type { ChatConversation, ChatMessage } from '@/types/api';

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
  // The conversation the message belongs to (used for cache invalidation).
  conversationId?: number | string | null;
}

// The send endpoint's response shape is not fully known. The reply text may be
// keyed as response/reply/message/answer/data, and a new conversation id may be
// returned. Surface the raw payload plus the best-effort extracted reply.
export interface SendMessageResult {
  reply: string;
  conversationId?: number | string;
  raw: unknown;
}

// Defensively pull a human-readable reply string out of an unknown payload.
// verify on first 200 (which key holds the assistant reply text).
function extractReply(resp: unknown): string {
  if (typeof resp === 'string') {
    return resp;
  }
  if (resp && typeof resp === 'object') {
    const obj = resp as Record<string, unknown>;
    const candidateKeys = ['response', 'reply', 'message', 'answer', 'text', 'content'];
    for (const key of candidateKeys) {
      const value = obj[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }
    // The reply may be nested under `data`.
    const data = obj.data;
    if (typeof data === 'string' && data.trim().length > 0) {
      return data;
    }
    if (data && typeof data === 'object') {
      const nested = extractReply(data);
      if (nested.trim().length > 0) {
        return nested;
      }
    }
  }
  return '';
}

// Defensively pull a new/current conversation id out of an unknown payload.
// verify on first 200 (which key holds the conversation id).
function extractConversationId(resp: unknown): number | string | undefined {
  if (resp && typeof resp === 'object') {
    const obj = resp as Record<string, unknown>;
    const candidateKeys = ['conversation_id', 'conversationId', 'conversation', 'id'];
    for (const key of candidateKeys) {
      const value = obj[key];
      if (typeof value === 'number' || typeof value === 'string') {
        return value;
      }
      // `conversation` may itself be an object carrying the id.
      if (value && typeof value === 'object') {
        const innerId = (value as { id?: unknown }).id;
        if (typeof innerId === 'number' || typeof innerId === 'string') {
          return innerId;
        }
      }
    }
    const data = obj.data;
    if (data && typeof data === 'object') {
      return extractConversationId(data);
    }
  }
  return undefined;
}

// POST /api/chat/send { query } -> the assistant reply.
export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ query }: SendMessagePayload): Promise<SendMessageResult> => {
      const resp = await authFetch<unknown>(RAILWAY_ENDPOINTS.chatSend, {
        method: 'POST',
        json: { query },
      });
      return {
        reply: extractReply(resp),
        conversationId: extractConversationId(resp),
        raw: resp,
      };
    },
    onSuccess: (_result, variables) => {
      // A new conversation may have been created, so refresh the list.
      queryClient.invalidateQueries({ queryKey: CHAT_CONVERSATIONS_KEY });
      if (
        variables.conversationId !== undefined &&
        variables.conversationId !== null &&
        variables.conversationId !== ''
      ) {
        queryClient.invalidateQueries({
          queryKey: ['chat', 'messages', variables.conversationId],
        });
      }
    },
  });
}
