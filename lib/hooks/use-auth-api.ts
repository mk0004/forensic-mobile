import { useMutation, useQuery } from '@tanstack/react-query';
import { authFetch } from '@/lib/api-client';
import { RAILWAY_ENDPOINTS } from '@/constants/railway-api';
import { LoginResponse, SettingResponse, User } from '@/types/api';

// The setting endpoint may return the user directly or wrapped under `user`.
export type SettingResult = User | SettingResponse;

// Request payload shapes for the auth endpoints.
interface LoginVariables {
  email: string;
  password: string;
}

interface RegisterVariables {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  national_id: string;
  date_of_birth: string;
}

interface ForgotPasswordVariables {
  email: string;
}

interface VerifyCodeVariables {
  email: string;
  otp: string;
}

interface ResetPasswordVariables {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

interface SaveChangeVariables {
  name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  national_id: string;
}

interface ChangePasswordVariables {
  password: string;
  new_password: string;
  new_password_confirmation: string;
}

export function useLoginMutation() {
  return useMutation<LoginResponse, Error, LoginVariables>({
    mutationFn: (variables) =>
      authFetch<LoginResponse>(RAILWAY_ENDPOINTS.login, {
        method: 'POST',
        json: variables,
        auth: false,
      }),
  });
}

export function useRegisterMutation() {
  return useMutation<unknown, Error, RegisterVariables>({
    mutationFn: (variables) =>
      authFetch<unknown>(RAILWAY_ENDPOINTS.register, {
        method: 'POST',
        json: variables,
        auth: false,
      }),
  });
}

export function useForgotPasswordMutation() {
  return useMutation<unknown, Error, ForgotPasswordVariables>({
    mutationFn: (variables) =>
      authFetch<unknown>(RAILWAY_ENDPOINTS.forgotPassword, {
        method: 'POST',
        json: variables,
        auth: false,
      }),
  });
}

export function useVerifyCodeMutation() {
  return useMutation<unknown, Error, VerifyCodeVariables>({
    mutationFn: (variables) =>
      authFetch<unknown>(RAILWAY_ENDPOINTS.verifyCode, {
        method: 'POST',
        json: variables,
        auth: false,
      }),
  });
}

export function useResetPasswordMutation() {
  return useMutation<unknown, Error, ResetPasswordVariables>({
    mutationFn: (variables) =>
      authFetch<unknown>(RAILWAY_ENDPOINTS.resetPassword, {
        method: 'POST',
        json: variables,
        auth: false,
      }),
  });
}

export function useSettingQuery() {
  return useQuery<SettingResult, Error>({
    queryKey: ['setting'],
    queryFn: () =>
      authFetch<SettingResult>(RAILWAY_ENDPOINTS.setting, {
        method: 'GET',
        auth: true,
      }),
  });
}

export function useSaveChangeMutation() {
  return useMutation<unknown, Error, SaveChangeVariables>({
    mutationFn: (variables) =>
      authFetch<unknown>(RAILWAY_ENDPOINTS.saveChange, {
        method: 'POST',
        json: variables,
        auth: true,
      }),
  });
}

export function useChangePasswordMutation() {
  return useMutation<unknown, Error, ChangePasswordVariables>({
    mutationFn: (variables) =>
      authFetch<unknown>(RAILWAY_ENDPOINTS.changePassword, {
        method: 'POST',
        json: variables,
        auth: true,
      }),
  });
}
