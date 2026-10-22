"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FontAwesomeIcon, byPrefixAndName } from "@/lib/fontawesome";
import { formatAuthError } from "@/lib/auth-errors";
import { useAuthStore } from "@/lib/store";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const resetPassword = useAuthStore((s) => s.resetPassword);

  if (!token) {
    return (
      <div className="p-6 rounded-2xl bg-dark-3/60 border border-white/[0.08] text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto text-danger">
          <FontAwesomeIcon icon={byPrefixAndName.fans["circle-exclamation"]} className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-light">Invalid or expired link</h2>
          <p className="text-light-3 text-xs sm:text-sm mt-1">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition"
        >
          <span>Request New Reset Link</span>
          <FontAwesomeIcon icon={byPrefixAndName.fans["arrow-right"]} className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      if (!res.success) {
        setError(res.error || "Failed to reset password. Link may have expired.");
      } else {
        setDone(true);
        toast.success("Password updated", {
          description: "Your password has been changed successfully.",
        });
      }
    } catch (err) {
      setError(formatAuthError(err, "Failed to update password."));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="p-6 rounded-2xl bg-dark-3/60 border border-white/[0.08] text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto text-success">
          <FontAwesomeIcon icon={byPrefixAndName.fans["circle-check"]} className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-light">Password updated</h2>
          <p className="text-light-3 text-xs sm:text-sm mt-1">
            You can now sign in to your Vaultix workspace with your new password.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full py-3 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold transition shadow-md shadow-brand/20 cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-light tracking-tight">
          Create new password
        </h1>
        <p className="text-light-3 text-sm mt-1.5">
          Must be at least 8 characters long.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-center gap-2">
          <FontAwesomeIcon icon={byPrefixAndName.fans["circle-exclamation"]} className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-light-2 mb-1.5">New Password</label>
          <div className="relative">
            <FontAwesomeIcon icon={byPrefixAndName.fans["lock"]} className="w-3.5 h-3.5 text-light-4 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-dark-3/60 border border-white/[0.08] text-xs sm:text-sm text-light placeholder:text-light-4 focus:outline-none focus:border-brand/40 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-light-4 hover:text-light transition cursor-pointer"
            >
              <FontAwesomeIcon icon={byPrefixAndName.fans[showPassword ? "eye-slash" : "eye"]} className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-light-2 mb-1.5">Confirm Password</label>
          <div className="relative">
            <FontAwesomeIcon icon={byPrefixAndName.fans["lock"]} className="w-3.5 h-3.5 text-light-4 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-dark-3/60 border border-white/[0.08] text-xs sm:text-sm text-light placeholder:text-light-4 focus:outline-none focus:border-brand/40 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold transition shadow-md shadow-brand/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <FontAwesomeIcon icon={byPrefixAndName.fans["spinner"]} className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Save & Sign In</span>
              <FontAwesomeIcon icon={byPrefixAndName.fans["arrow-right"]} className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-light-4 text-xs py-10">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
