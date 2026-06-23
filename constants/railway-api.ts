// Local backend over LAN (phone must be on the same Wi-Fi as the dev machine).
// Swap back to the ngrok/production URL below when not on the same network.
export const RAILWAY_API_BASE_URL = 'http://192.168.1.38:8000';
// export const RAILWAY_API_BASE_URL = 'https://4d5a-156-207-227-98.ngrok-free.app';
// export const RAILWAY_API_BASE_URL = 'https://forensic-ai-system-api-production.up.railway.app';

// The backend returns asset URLs against its own host (e.g. http://127.0.0.1:8000),
// which a phone cannot reach. Re-point any backend asset path at the active API base.
export function resolveImageUrl(raw?: string | null): string | null {
  const value = raw?.trim();
  if (!value) {
    return null;
  }
  const storageIndex = value.indexOf('/storage/');
  if (storageIndex >= 0) {
    return RAILWAY_API_BASE_URL + value.slice(storageIndex);
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `${RAILWAY_API_BASE_URL}/${value.replace(/^\/+/, '')}`;
}

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
  uploadUserImage: '/api/upload/image-user',

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

  // Admin
  adminDashboard: '/api/admin/dashboard',
  adminDoctors: '/api/admin/doctors',
  adminCases: '/api/admin/cases',
  adminCommunity: '/api/admin/community',
  adminChatManagement: '/api/admin/chat-mangement',
  adminSystemLog: '/api/admin/system-log',
  adminGlobalReport: '/api/admin/get-global-report-data',
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
  deleteConversation: (id: number | string) => `/api/conversations/${id}`,
  renameConversation: (id: number | string) => `/api/conversations/${id}`,

  // Admin
  adminDoctorProfile: (id: number | string) => `/api/admin/doctors/${id}`,
  adminToggleUser: (id: number | string) => `/api/admin/toggle/active/${id}`,
  adminAssignAdmin: (id: number | string) => `/api/admin/doctors/assign/admin/${id}`,
  adminDeletePost: (id: number | string) => `/api/admin/post/${id}`,
  adminDeleteComment: (id: number | string) => `/api/admin/comment/${id}`,
  adminDeleteConversation: (id: number | string) => `/api/admin/conversation/${id}`,
} as const;
