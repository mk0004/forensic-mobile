import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '@/lib/api-client';
import { RAILWAY_ENDPOINTS, RAILWAY_ROUTES } from '@/constants/railway-api';
import type { Article, Comment, Feed } from '@/types/api';

export const FEED_QUERY_KEY = ['feed'] as const;

// A feed item may be a Feed (post) or an Article (publication). The two share
// nearly identical shapes; we widen to a single union plus the discriminator
// fields the UI needs and a defensively-typed nested author/comments.
// verify on first 200 — server may name the kind/author/comments differently.
export interface FeedAuthor {
  id?: number;
  name?: string;
  image?: string; // verify
  specialty?: string; // verify on first 200
  role?: string; // verify on first 200
}

export interface FeedComment extends Comment {
  user?: FeedAuthor; // verify on first 200
  author?: FeedAuthor; // verify on first 200
}

export type FeedItemKind = 'feed' | 'article';

export interface FeedItem {
  id: number;
  title?: string;
  content?: string;
  image?: string;
  user_id?: number;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  created_at?: string;
  // Discriminator — the server may flag publications via `type`/`is_article`
  // or by the endpoint that produced them. verify on first 200.
  type?: string; // verify on first 200
  is_article?: boolean; // verify on first 200
  liked?: boolean; // verify on first 200
  is_liked?: boolean; // verify
  user?: FeedAuthor; // verify on first 200
  author?: FeedAuthor; // verify on first 200
  comments?: FeedComment[]; // verify on first 200
}

// The live feed list is double-nested at `data.public_feed.data`; fall back to
// `data.data`, `data`, or a bare array for other shapes.
function unwrapList<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) {
    return resp as T[];
  }
  if (!resp || typeof resp !== 'object') {
    return [];
  }
  const data = (resp as { data?: unknown }).data;
  if (data && typeof data === 'object') {
    const publicFeed = (data as { public_feed?: unknown }).public_feed;
    if (publicFeed && typeof publicFeed === 'object' && Array.isArray((publicFeed as { data?: unknown }).data)) {
      return (publicFeed as { data: T[] }).data;
    }
    if (Array.isArray((data as { data?: unknown }).data)) {
      return (data as { data: T[] }).data;
    }
    if (Array.isArray(data)) {
      return data as T[];
    }
  }
  return [];
}

// Heuristic: a publication (article) carries a title; a plain post does not.
// The server may also expose an explicit flag. verify on first 200.
export function isArticleItem(item: FeedItem): boolean {
  if (typeof item.is_article === 'boolean') {
    return item.is_article;
  }
  if (typeof item.type === 'string') {
    return item.type.toLowerCase().includes('article') || item.type.toLowerCase().includes('publication');
  }
  return typeof item.title === 'string' && item.title.trim().length > 0;
}

export interface FeedBuckets {
  posts: FeedItem[];
  publications: FeedItem[];
  myPosts: FeedItem[];
}

// The live feed groups items server-side into public_feed / publication /
// my_publications. Read each bucket directly instead of flattening.
function nestedList(data: unknown, key: string): FeedItem[] {
  if (!data || typeof data !== 'object') return [];
  const bucket = (data as Record<string, unknown>)[key];
  if (bucket && typeof bucket === 'object' && Array.isArray((bucket as { data?: unknown }).data)) {
    return (bucket as { data: FeedItem[] }).data;
  }
  return [];
}

export function useFeedQuery() {
  return useQuery<FeedBuckets>({
    queryKey: FEED_QUERY_KEY,
    queryFn: async () => {
      const resp = await authFetch<unknown>(RAILWAY_ENDPOINTS.feed);
      const data = (resp as { data?: unknown })?.data;
      const posts = nestedList(data, 'public_feed');
      const publications = nestedList(data, 'publication');
      const myPosts = nestedList(data, 'my_publications');
      // Fallback: if the server returned a flat list, treat it all as posts.
      if (posts.length === 0 && publications.length === 0 && myPosts.length === 0) {
        const flat = unwrapList<FeedItem>(resp);
        return { posts: flat, publications: [], myPosts: [] };
      }
      return { posts, publications, myPosts };
    },
  });
}

export function useToggleLikeFeedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      authFetch<unknown>(RAILWAY_ROUTES.toggleLikeFeed(id), { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export function useToggleLikeArticleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      authFetch<unknown>(RAILWAY_ROUTES.toggleLikeArticle(id), { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export interface AddCommentPayload {
  id: number | string;
  comment: string;
}

export function useAddCommentFeedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: AddCommentPayload) =>
      authFetch<unknown>(RAILWAY_ROUTES.addCommentFeed(id), { method: 'POST', json: { comment } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export function useAddCommentArticleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: AddCommentPayload) =>
      authFetch<unknown>(RAILWAY_ROUTES.addCommentArticle(id), { method: 'POST', json: { comment } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export interface PickedImage {
  uri: string;
  type: string;
  name: string;
}

export interface AddArticlePayload {
  title: string;
  content: string;
  image?: PickedImage;
}

export function useAddArticleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, content, image }: AddArticlePayload) => {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) {
        // RN FormData file-part cast — established pattern (model-upload.tsx L186-190).
        formData.append('image', { uri: image.uri, type: image.type, name: image.name } as any);
      }
      return authFetch<Article>(RAILWAY_ENDPOINTS.addArticle, { method: 'POST', formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export interface AddFeedPayload {
  title: string;
  content: string;
}

export function useAddFeedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, content }: AddFeedPayload) => {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      return authFetch<Feed>(RAILWAY_ENDPOINTS.addFeed, { method: 'POST', formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

// Map a raw FeedItem into the display fields the community cards render.
export function feedAuthorName(item: FeedItem): string {
  return item.user?.name ?? item.author?.name ?? 'Unknown';
}

export function feedAuthorSpecialty(item: FeedItem): string {
  return item.user?.specialty ?? item.author?.specialty ?? item.user?.role ?? item.author?.role ?? '';
}

export function feedCommentText(comment: FeedComment): string {
  return comment.content ?? comment.body ?? '';
}

export function feedCommentAuthor(comment: FeedComment): string {
  return comment.user?.name ?? comment.author?.name ?? 'Unknown';
}

// Compact relative time. Falls back to the raw string when unparseable.
export function timeAgo(createdAt?: string): string {
  if (!createdAt) {
    return '';
  }
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) {
    return createdAt;
  }
  const seconds = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
