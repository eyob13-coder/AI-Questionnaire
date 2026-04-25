import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

function resolveAuthBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseUrl(),
  plugins: [emailOTPClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  emailOtp,
  forgetPassword,
  resetPassword,
  sendVerificationEmail,
} = authClient;
