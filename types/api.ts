// API domain types for the Railway (Laravel/Sanctum) backend.
// Fields not certain from the Postman collection are optional and marked
// `// verify on first 200`. Prefer `unknown` / `Record<string, unknown>` over `any`.

export interface User {
  id: number;
  name: string;
  email: string;
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

export interface ChatMessage {
  id: number;
  conversation_id?: number;
  role?: string; // verify on first 200
  content?: string; // verify on first 200
  created_at?: string;
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
  user?: User; // verify on first 200
  data?: Record<string, unknown>; // verify on first 200
}
