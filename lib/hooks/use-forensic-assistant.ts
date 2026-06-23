import { useMutation } from '@tanstack/react-query';
import { DEEPFACE_API_BASE_URL, DEEPFACE_ENDPOINTS } from '@/constants/deepface-api';
import { getApiErrorMessage } from '@/lib/api-client';
import type { ForensicAssistantRequest, ForensicAssistantResponse } from '@/types/api';

export function useForensicAssistantMutation() {
  return useMutation<ForensicAssistantResponse, Error, ForensicAssistantRequest>({
    mutationFn: async (payload) => {
      const response = await fetch(`${DEEPFACE_API_BASE_URL}${DEEPFACE_ENDPOINTS.forensicAssistant}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: 'auto',
          max_pubmed_results: 5,
          max_tavily_results: 5,
          ...payload,
        }),
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(getApiErrorMessage(response.status, text));
      }

      return (text ? JSON.parse(text) : {}) as ForensicAssistantResponse;
    },
  });
}
