export const RAILWAY_API_BASE_URL = 'https://forensic-ai-system-api-production.up.railway.app';

export const RAILWAY_ENDPOINTS = {
  // Auth
  register: '/api/register',
  login: '/api/login',
  forgotPassword: '/api/password/forgot',
  verifyCode: '/api/password/verify-code',
  resetPassword: '/api/password/reset',
  logout: '/api/logout',
  changePassword: '/api/change-password',
  saveChange: '/api/save-change',
  setting: '/api/setting',

  // Dashboard
  dashboard: '/api/doctor/dashboard-flutter',
  activeCases: '/api/doctor/dashboard-flutter/active-case',
  evidenceList: '/api/doctor/dashboard-flutter/evidence-list',
  // Server exposes no completed-cases route ('/complete-case' returns 404);
  // completed cases are derived from `allCases` filtered by status.

  // Cases
  allCases: '/api/all-cases',
  createCase: '/api/add/use-case',

  // Content
  feed: '/api/feed',
  addArticle: '/api/add/new-article',
  addFeed: '/api/add/new-feed',

  // Evidence
  saveAsEvidence: '/api/save-as-evidence',

  // Chat
  chat: '/api/chat',
  chatSend: '/api/chat/send',
} as const;

// Parameterized route helpers. Ids are typed as `number | string`.
export const RAILWAY_ROUTES = {
  // Cases
  showCase: (id: number | string) => `/api/show/use-case/${id}`,
  updateCase: (id: number | string) => `/api/update/use-case/${id}`,
  deleteCase: (id: number | string) => `/api/delete/use-case/${id}`,
  toggleActiveCase: (id: number | string) => `/api/toggle-active/use-case/${id}`,

  // Evidence
  updateEvidence: (id: number | string, caseId: number | string) =>
    `/api/update-evidence/${id}/use-case/${caseId}`,
  deleteEvidence: (id: number | string, caseId: number | string) =>
    `/api/delete-evidence/${id}/use-case/${caseId}`,

  // Articles
  updateArticle: (id: number | string) => `/api/update/article/${id}`,
  deleteArticle: (id: number | string) => `/api/delete/article/${id}`,
  shareArticle: (id: number | string) => `/api/share/article/${id}`,
  viewArticle: (id: number | string) => `/api/view/article/${id}`,
  addCommentArticle: (id: number | string) => `/api/add-comment/article/${id}`,
  toggleLikeArticle: (id: number | string) => `/api/toggle-like/article/${id}`,

  // Feeds
  updateFeed: (id: number | string) => `/api/update/feed/${id}`,
  deleteFeed: (id: number | string) => `/api/delete/feed/${id}`,
  shareFeed: (id: number | string) => `/api/share/feed/${id}`,
  viewFeed: (id: number | string) => `/api/view/feed/${id}`,
  toggleLikeFeed: (id: number | string) => `/api/toggle-like/feed/${id}`,
  addCommentFeed: (id: number | string) => `/api/add-comment/feed/${id}`,

  // Comments
  updateComment: (id: number | string) => `/api/update/comment/${id}`,
  deleteComment: (id: number | string) => `/api/delete/comment/${id}`,

  // Chat
  conversationMessages: (id: number | string) => `/api/conversations/${id}/messages`,
} as const;
