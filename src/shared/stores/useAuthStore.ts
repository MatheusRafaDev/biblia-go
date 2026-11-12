import { create } from 'zustand';
import { api } from '../api/client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  lastSyncedAt: string | null;
  setUser: (user: UserProfile | null, token: string | null) => void;
  logout: () => void;
  setLastSyncedAt: (timestamp: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  lastSyncedAt: null,
  setUser: (user, token) => {
    api.setAuthToken(token);
    set({ user, token, isAuthenticated: Boolean(user && token) });
  },
  logout: () => {
    api.setAuthToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
}));
