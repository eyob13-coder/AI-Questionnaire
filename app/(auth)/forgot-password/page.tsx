"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { FontAwesomeIcon, byPrefixAndName } from "@/lib/fontawesome";
import { validateEmail } from "@/lib/email-validation";
import { formatAuthError } from "@/lib/auth-errors";
import { useAuthStore } from "@/lib/store";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const requestForgotPassword = useAuthStore((s) => s.forgotPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const check = validateEmail(email);
    if (!check.valid) {
      setError(check.reason || "Please enter a valid work email.");
      return;
    }

    setLoading(true);
    try {
      const res = await requestForgotPassword(email);
      if (!res.success) {
        setError(res.error || "Couldn't send reset email.");
      } else {
        setSent(true);
        toast.success("Reset link sent", {
          description: "Check your inbox for password reset instructions.",
        });
      }
    } catch (err) {
      setError(formatAuthError(err, "Something went wrong. Try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-light tracking-tight">
          Reset password
        </h1>
        <p className="text-light-3 text-sm mt-1.5">
          Enter your work email and we&apos;ll send you a secure link to reset your password.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-center gap-2">
          <FontAwesomeIcon icon={byPrefixAndName.fans["circle-exclamation"]} className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {sent ? (
        <div className="p-5 rounded-2xl bg-dark-3/60 border border-white/[0.08] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto text-success">
            <FontAwesomeIcon icon={byPrefixAndName.fans["circle-check"]} className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-light">Check your inbox</h3>
            <p className="text-xs text-light-3 mt-1 leading-relaxed">
              We&apos;ve sent a password reset link to <span className="text-light font-medium">{email}</span>.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-brand hover:text-brand-light transition font-medium cursor-pointer"
            >
              Send again
            </button>
            <span className="text-light-4">·</span>
            <Link href="/login" className="text-light-3 hover:text-light transition">
              Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-light-2 mb-1.5">Work Email</label>
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
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-3/60 border border-white/[0.08] text-xs sm:text-sm text-light placeholder:text-light-4 focus:outline-none focus:border-brand/40 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold transition shadow-md shadow-brand/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <FontAwesomeIcon icon={byPrefixAndName.fans["spinner"]} className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send Reset Link</span>
                <FontAwesomeIcon icon={byPrefixAndName.fans["arrow-right"]} className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-light-3 pt-2">
            Remember your password?{" "}
            <Link href="/login" className="text-brand font-semibold hover:text-brand-light transition">
              Sign In
            </Link>
          </p>
        </form>
      )}
    </motion.div>
  );
}
