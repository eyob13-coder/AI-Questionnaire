import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  company?: string | null;
}

interface Session {
  id: string;
  expiresAt: Date;
  token: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuth: boolean;
  isLoading: boolean;
  setAuth: (user: User | null, session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuth: false,
  isLoading: true,
  setAuth: (user, session) =>
    set({
      user,
      session,
      isAuth: !!user && !!session,
      isLoading: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
}));
