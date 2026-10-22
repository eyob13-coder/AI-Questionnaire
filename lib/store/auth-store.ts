import { create } from "zustand";
import axios from "axios";
import {
  signIn,
  signUp,
  signOut,
  emailOtp,
  forgetPassword as clientForgetPassword,
  resetPassword as clientResetPassword,
  authClient,
} from "@/lib/auth-client";
import { formatAuthError } from "@/lib/auth-errors";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  company?: string | null;
}

export interface Session {
  id: string;
  expiresAt: Date | string;
  token: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuth: boolean;
  isLoading: boolean;
  error: string | null;

  // State setters
  setAuth: (user: User | null, session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearError: () => void;

  // API Actions via Axios
  login: (email: string, password: string, callbackURL?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; company?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<{ isAuth: boolean; user: User | null }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { name?: string; company?: string; image?: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuth: false,
  isLoading: true,
  error: null,

  setAuth: (user, session) =>
    set({
      user,
      session,
      isAuth: !!user,
      isLoading: false,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),
  clearError: () => set({ error: null }),

  login: async (email, password, callbackURL = "/dashboard") => {
    set({ isLoading: true, error: null });
    try {
      // 1. Call dedicated Next.js API route via axios
      const res = await axios.post(
        "/api/login",
        { email, password, callbackURL },
        { validateStatus: () => true }
      );

      if (res.status >= 200 && res.status < 300) {
        const user = res.data?.user || null;
        const session = res.data?.session || null;
        set({ user, session, isAuth: !!user, isLoading: false, error: null });
        return { success: true };
      }

      if (res.data?.error && !res.data.error.includes("Internal")) {
        set({ error: res.data.error, isLoading: false });
        return { success: false, error: res.data.error };
      }

      // 2. Client fallback
      const clientRes = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
        callbackURL,
      });

      if (clientRes.error) {
        const msg = formatAuthError(clientRes.error, "Invalid email or password.");
        set({ error: msg, isLoading: false });
        return { success: false, error: msg };
      }

      const sessionRes = await authClient.getSession();
      const user = (sessionRes?.data?.user as unknown as User) || null;
      const session = (sessionRes?.data?.session as unknown as Session) || null;

      set({ user, session, isAuth: !!user, isLoading: false, error: null });
      return { success: true };
    } catch (err) {
      const msg = formatAuthError(err, "Unable to sign in right now.");
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  register: async ({ name, email, password, company }) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Call dedicated Next.js API route via axios
      const res = await axios.post(
        "/api/register",
        { name, email, password, company },
        { validateStatus: () => true }
      );

      if (res.status >= 200 && res.status < 300) {
        set({ isLoading: false, error: null });
        return { success: true };
      }

      if (res.data?.error && !res.data.error.includes("Internal")) {
        set({ error: res.data.error, isLoading: false });
        return { success: false, error: res.data.error };
      }

      // 2. Client fallback
      const clientRes = await signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        callbackURL: "/dashboard",
      });

      if (clientRes.error) {
        const msg = formatAuthError(clientRes.error, "Could not create account.");
        set({ error: msg, isLoading: false });
        return { success: false, error: msg };
      }

      set({ isLoading: false, error: null });
      return { success: true };
    } catch (err) {
      const msg = formatAuthError(err, "Account creation failed.");
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axios.post("/api/logout", {}, { validateStatus: () => true }).catch(() => null);
      await signOut().catch(() => null);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("vaultix.activeWorkspaceId");
      }
      set({ user: null, session: null, isAuth: false, isLoading: false, error: null });
    }
  },

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get("/api/me", { validateStatus: () => true }).catch(() => null);
      if (res && res.status >= 200 && res.status < 300) {
        if (res.data.isAuth && res.data.user) {
          set({ user: res.data.user, session: res.data.session, isAuth: true, isLoading: false });
          return { isAuth: true, user: res.data.user };
        }
      }

      const clientSession = await authClient.getSession().catch(() => null);
      if (clientSession?.data?.user) {
        const user = clientSession.data.user as unknown as User;
        const session = clientSession.data.session as unknown as Session;
        set({ user, session, isAuth: true, isLoading: false });
        return { isAuth: true, user };
      }

      set({ user: null, session: null, isAuth: false, isLoading: false });
      return { isAuth: false, user: null };
    } catch {
      set({ user: null, session: null, isAuth: false, isLoading: false });
      return { isAuth: false, user: null };
    }
  },

  verifyOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Call dedicated Next.js API route via axios
      const res = await axios
        .post("/api/verify-otp", { email, otp }, { validateStatus: () => true })
        .catch(() => null);

      if (res && res.status >= 200 && res.status < 300) {
        await get().checkSession();
        set({ isLoading: false, error: null });
        return { success: true };
      }

      // 2. Client fallback
      const { error } = await emailOtp.verifyEmail({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      if (error) {
        const msg = formatAuthError(error, "That verification code did not work.");
        set({ error: msg, isLoading: false });
        return { success: false, error: msg };
      }

      await get().checkSession();
      set({ isLoading: false, error: null });
      return { success: true };
    } catch (err) {
      const msg = formatAuthError(err, "Verification failed.");
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  sendOtp: async (email) => {
    try {
      // 1. Call dedicated Next.js API route via axios
      const res = await axios
        .post(
          "/api/send-otp",
          { email, type: "email-verification" },
          { validateStatus: () => true }
        )
        .catch(() => null);

      if (res && res.status >= 200 && res.status < 300) {
        return { success: true };
      }

      // 2. Client fallback
      const { error } = await emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: "email-verification",
      });

      if (error) {
        const msg = formatAuthError(error, "Could not send verification code.");
        return { success: false, error: msg };
      }
      return { success: true };
    } catch (err) {
      const msg = formatAuthError(err, "Failed to send verification email.");
      return { success: false, error: msg };
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Call dedicated Next.js API route via axios
      const res = await axios
        .post(
          "/api/forgot-password",
          {
            email: email.trim().toLowerCase(),
            redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : "/reset-password",
          },
          { validateStatus: () => true }
        )
        .catch(() => null);

      if (res && res.status >= 200 && res.status < 300) {
        set({ isLoading: false });
        return { success: true };
      }

      // 2. Client fallback
      const { error } = await clientForgetPassword({
        email: email.trim().toLowerCase(),
        redirectTo: "/reset-password",
      });

      if (error) {
        const msg = formatAuthError(error, "Failed to send reset link.");
        set({ error: msg, isLoading: false });
        return { success: false, error: msg };
      }

      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = formatAuthError(err, "Password reset request failed.");
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Call dedicated Next.js API route via axios
      const res = await axios
        .post(
          "/api/reset-password",
          { token, newPassword },
          { validateStatus: () => true }
        )
        .catch(() => null);

      if (res && res.status >= 200 && res.status < 300) {
        set({ isLoading: false });
        return { success: true };
      }

      // 2. Client fallback
      const { error } = await clientResetPassword({
        newPassword,
        token,
      });

      if (error) {
        const msg = formatAuthError(error, "Failed to reset password.");
        set({ error: msg, isLoading: false });
        return { success: false, error: msg };
      }

      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = formatAuthError(err, "Password reset failed.");
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.patch("/api/profile", data, {
        validateStatus: () => true,
      });

      if (res.status >= 200 && res.status < 300) {
        const updatedUser = res.data.user;
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : updatedUser,
          isLoading: false,
        }));
        return { success: true, user: updatedUser };
      }

      const msg = res.data?.error || "Failed to update profile";
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    } catch (err) {
      const msg = formatAuthError(err, "Profile update failed.");
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },
}));

export default useAuthStore;
