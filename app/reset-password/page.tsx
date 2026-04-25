"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { VaultixIcon } from "@/components/ui/vaultix-icon";
import { resetPassword } from "@/lib/auth-client";
import { formatAuthError } from "@/lib/auth-errors";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="bg-dark-2/60 border border-white/[0.06] rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-danger" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2">Invalid reset link</h1>
        <p className="text-light-2 text-sm mb-6">
          This link is missing or expired. Request a new one to continue.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-brand hover:text-brand-light text-sm font-medium transition-colors"
        >
          Request new link
          <ArrowRight className="w-4 h-4" />
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
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await resetPassword({
        newPassword: password,
        token,
      });

      if (resetError) {
        const msg = formatAuthError(resetError, "Couldn't reset password.");
        setError(msg);
        toast.error("Reset failed", { description: msg });
      } else {
        setDone(true);
        toast.success("Password reset", {
          description: "You can now sign in with your new password.",
        });
        setTimeout(() => router.replace("/login"), 1800);
      }
    } catch (err) {
      setError(formatAuthError(err, "Something went wrong. Try again."));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-2/60 border border-white/[0.06] rounded-2xl p-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2">Password updated</h1>
        <p className="text-light-2 text-sm mb-2">Redirecting you to sign in…</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-dark-2/60 border border-white/[0.06] rounded-2xl p-8">
      <h1 className="font-heading text-2xl font-bold mb-2">Choose a new password</h1>
      <p className="text-light-2 text-sm mb-6">
        Pick something strong — at least 8 characters.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-light-2 mb-1.5">New password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-3" />
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-dark-3/50 border border-white/[0.08] text-sm text-light placeholder-light-3 outline-none focus:border-brand/40 focus:bg-dark-3/80 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-light-3 hover:text-light-2 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-light-2 mb-1.5">Confirm password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-3" />
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-3/50 border border-white/[0.08] text-sm text-light placeholder-light-3 outline-none focus:border-brand/40 focus:bg-dark-3/80 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full transition-all hover:shadow-[0_0_24px_rgba(249,115,22,0.35)]"
        >
          {loading ? "Updating…" : (
            <>
              Update password
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <Link
        href="/login"
        className="mt-6 flex items-center justify-center gap-2 text-light-3 hover:text-light-2 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand/[0.04] blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <Link href="/" className="flex items-center gap-2.5 w-fit mx-auto mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center shadow-lg shadow-brand/20">
            <VaultixIcon className="w-5 h-5" />
          </div>
          <span className="font-heading text-xl font-bold">
            Vault<span className="text-brand">ix</span>
          </span>
        </Link>

        <Suspense fallback={<div className="text-center text-light-3">Loading…</div>}>
          <ResetPasswordContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
