"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "sonner";
import { FontAwesomeIcon, byPrefixAndName } from "@/lib/fontawesome";
import { signIn } from "@/lib/auth-client";
import { formatAuthError, getOfflineMessage } from "@/lib/auth-errors";
import { validateEmail } from "@/lib/email-validation";
import { useAuthStore } from "@/lib/store";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextTarget = searchParams.get("next");
  const callbackURL =
    nextTarget && nextTarget.startsWith("/dashboard") ? nextTarget : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isOffline) {
      setError(getOfflineMessage());
      return;
    }

    const check = validateEmail(email);
    if (!check.valid) {
      setError(check.reason || "Please enter a valid work email.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password, callbackURL);
      if (!res.success) {
        setError(res.error || "Invalid email or password.");
      } else {
        toast.success("Welcome back!", { description: "Signed in successfully" });
        router.replace(callbackURL);
      }
    } catch (err) {
      setError(formatAuthError(err, "Unable to sign in right now."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    if (isOffline) {
      setError(getOfflineMessage());
      return;
    }
    try {
      const { error } = await signIn.social({
        provider: "google",
        callbackURL,
      });
      if (error) setError(error.message || "Google sign-in unavailable.");
    } catch (err) {
      setError(formatAuthError(err, "Google sign-in unavailable."));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 sm:space-y-5"
    >
      {/* Title */}
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-light tracking-tight">
          Welcome back
        </h1>
        <p className="text-light-3 text-xs sm:text-sm mt-1">
          Sign in to your Vaultix workspace to manage questionnaires.
        </p>
      </div>

      {/* Google Single Sign-On */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading || isOffline}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14] text-light text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.99]"
      >
        <FontAwesomeIcon icon={byPrefixAndName.fab["google"]} className="w-3.5 h-3.5 text-brand" />
        Continue with Google SSO
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.08]" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-light-4">
          or email
        </span>
        <div className="flex-1 h-px bg-white/[0.08]" />
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-2.5 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-center gap-2">
          <FontAwesomeIcon icon={byPrefixAndName.fans["circle-exclamation"]} className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-light-2 mb-1">
            Work Email
          </label>
          <div className="relative">
            <FontAwesomeIcon
              icon={byPrefixAndName.fans["envelope"]}
              className="w-3.5 h-3.5 text-light-4 absolute left-3.5 top-1/2 -translate-y-1/2"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-3/60 border border-white/[0.08] text-xs sm:text-sm text-light placeholder:text-light-4 focus:outline-none focus:border-brand/40 focus:bg-dark-3 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-light-2">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-brand hover:text-brand-light transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <FontAwesomeIcon
              icon={byPrefixAndName.fans["lock"]}
              className="w-3.5 h-3.5 text-light-4 absolute left-3.5 top-1/2 -translate-y-1/2"
            />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-dark-3/60 border border-white/[0.08] text-xs sm:text-sm text-light placeholder:text-light-4 focus:outline-none focus:border-brand/40 focus:bg-dark-3 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-light-4 hover:text-light transition-colors cursor-pointer"
            >
              <FontAwesomeIcon
                icon={byPrefixAndName.fans[showPassword ? "eye-slash" : "eye"]}
                className="w-3.5 h-3.5"
              />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md shadow-brand/20 hover:shadow-brand/35 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
        >
          {loading ? (
            <FontAwesomeIcon icon={byPrefixAndName.fans["spinner"]} className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Sign In to Vaultix</span>
              <FontAwesomeIcon icon={byPrefixAndName.fans["arrow-right"]} className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <p className="text-center text-xs text-light-3 pt-1">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-brand font-semibold hover:text-brand-light transition">
          Start 14-day free trial
        </Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-light-4 text-xs py-10">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
