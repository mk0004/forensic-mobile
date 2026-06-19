import * as SecureStore from 'expo-secure-store';
import { User } from '@/types/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(t: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, t);
  } catch {
    // SecureStore may be unavailable (e.g. web); fail silently.
  }
}

export async function removeToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // SecureStore may be unavailable (e.g. web); fail silently.
  }
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

export async function setStoredUser(u: User): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(u));
  } catch {
    // SecureStore may be unavailable (e.g. web); fail silently.
  }
}

export async function clearStoredUser(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch {
    // SecureStore may be unavailable (e.g. web); fail silently.
  }
}
