// API domain types for the Railway (Laravel/Sanctum) backend.
// Fields not certain from the Postman collection are optional and marked
// `// verify on first 200`. Prefer `unknown` / `Record<string, unknown>` over `any`.

export interface User {
  id: number;
  name: string;
  email: string;
  image?: string | null;
  phone_number?: string;
  date_of_birth?: string;
  national_id?: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  national_id: string;
  date_of_birth: string;
  password_confirmation?: string; // verify on first 200
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code?: string; // verify on first 200
  password: string;
  password_confirmation?: string; // verify on first 200
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation?: string; // verify on first 200
}

export interface SaveChangeRequest {
  name?: string;
  email?: string;
  phone_number?: string;
  date_of_birth?: string;
  national_id?: string;
}

export interface Case {
  id: number;
  name: string;
  description: string;
  status: string;
  user_id?: number;
  created_at?: string;
}

export interface Evidence {
  id: number;
  name: string;
  model_used: string;
  case_id: number;
  data?: Record<string, unknown>;
}

export interface SaveAsEvidenceRequest {
  name: string;
  model_used: string;
  case_id: number | string;
  data?: Record<string, unknown>;
}

export interface Article {
  id: number;
  title?: string; // verify on first 200
  content?: string; // verify on first 200
  image?: string; // verify on first 200
  user_id?: number;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  created_at?: string;
}

export interface Feed {
  id: number;
  title?: string; // verify on first 200
  content?: string; // verify on first 200
  image?: string; // verify on first 200
  user_id?: number;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  created_at?: string;
}

export interface Comment {
  id: number;
  content?: string; // verify on first 200
  body?: string; // verify on first 200
  user_id?: number;
  created_at?: string;
}

export interface ChatConversation {
  id: number;
  title?: string; // verify on first 200
  last_message?: string; // verify on first 200
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessageMetadata {
  language?: string;
  used_pubmed?: boolean;
  used_tavily?: boolean;
  pubmed_query?: string | null;
  pubmed_sources?: PubMedSource[];
  tavily_sources?: TavilySource[];
  warnings?: string[];
  case_context_label?: string;
}

export interface ChatMessage {
  id: number;
  conversation_id?: number;
  sender?: string; // 'user' | 'assistant'
  role?: string; // legacy fallback
  content?: string;
  metadata?: ChatMessageMetadata | null;
  created_at?: string;
}

export interface ForensicAssistantRequest {
  query: string;
  case_context?: string | null;
  language?: 'auto' | 'en' | 'ar';
  include_tavily?: boolean | null;
  max_pubmed_results?: number;
  max_tavily_results?: number;
}

export interface PubMedSource {
  pmid?: string;
  title?: string;
  authors?: string[];
  doi?: string;
  journal?: string;
  publication_date?: string;
  url?: string;
  abstract_excerpt?: string;
}

export interface TavilySource {
  title?: string;
  url?: string;
  content_excerpt?: string;
  published_date?: string | null;
  score?: number;
}

export interface ForensicAssistantResponse {
  language?: string;
  answer?: string;
  used_pubmed?: boolean;
  used_tavily?: boolean;
  pubmed_sources?: PubMedSource[];
  tavily_sources?: TavilySource[];
  warnings?: string[];
}

export interface DashboardStat {
  total: number;
  new_this_week?: number;
  pending_review?: number;
  completed_this_month?: number;
}

export interface DashboardOverview {
  active_cases: DashboardStat;
  evidences: DashboardStat;
  completed_cases: DashboardStat;
}

export interface DashboardChartPoint {
  day: string;
  cases: number;
  evidence: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  chart_data: DashboardChartPoint[];
}

export interface SettingResponse {
  status?: boolean;
  message?: string;
  user?: User; // some deployments return the user at top level
  data?: User; // the live API wraps the user under `data`
}

export interface Paginator<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export interface AdminStatistics {
  total_doctors: number;
  active_cases: number;
  total_feeds_posts: number;
}

export interface AdminTopDoctor {
  id: number;
  name: string;
  image?: string | null;
  cases_count?: number;
}

export interface AdminChartPoint {
  models: string;
  total_used: number;
}

export interface AdminDashboardData {
  statistics: AdminStatistics;
  top_doctors: AdminTopDoctor[];
  chart_data: AdminChartPoint[];
}

export interface AdminDoctor {
  id: number;
  name: string;
  national_id?: string;
  created_at?: string;
  status?: string;
}

export interface AdminDoctorInfo {
  id: number;
  name: string;
  image?: string | null;
  email?: string;
  national_id?: string;
  total_cases: number;
  total_articles: number;
}

export interface AdminDoctorCase {
  id: number;
  user_id: number;
  status: string;
  created_at?: string;
  evidences_count: number;
}

export interface AdminDoctorArticle {
  id: number;
  user_id: number;
  title?: string;
  created_at?: string;
  views_count?: number;
}

export interface AdminDoctorProfileData {
  doctor_info: AdminDoctorInfo;
  modals_data: {
    cases_modal: Paginator<AdminDoctorCase>;
    articles_modal: Paginator<AdminDoctorArticle>;
  };
}

export interface AdminCaseAudit {
  id: number;
  user_id: number;
  evidences_count: number;
  user?: { id: number; name: string };
}

export interface AdminCommunityArticle {
  id: number;
  title?: string;
  user_id: number;
  user?: { id: number; name: string };
}

export interface AdminCommunityFeed {
  id: number;
  content?: string;
  user_id: number;
  user?: { id: number; name: string };
}

export interface AdminCommunityComment {
  id: number;
  comment?: string;
  user_id: number;
  user?: { id: number; name: string };
}

export interface AdminCommunityData {
  articles: Paginator<AdminCommunityArticle>;
  feeds: Paginator<AdminCommunityFeed>;
  comments: Paginator<AdminCommunityComment>;
}

export interface AdminChatConversation {
  id: number;
  title?: string;
  created_at?: string;
  messages_count: number;
}

export interface AdminSystemLog {
  id: number;
  name?: string;
  massage?: string;
  created_at?: string;
}

export interface AdminGlobalReport {
  metadata: { period: string; generated_at: string };
  data: {
    user_activity: { name: string; role: string; updated_at: string }[];
    case_statistics: { total: number; active: number; completed: number };
    ai_performance: { models: string; usage_count: number }[];
    community_engagement: { articles: number; feeds: number; comments: number };
  };
}
