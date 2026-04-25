"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { VaultixIcon } from "@/components/ui/vaultix-icon";
import { forgetPassword } from "@/lib/auth-client";
import { validateEmail } from "@/lib/email-validation";
import { formatAuthError } from "@/lib/auth-errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.reason || "Please enter a valid email address.");
      toast.error("Invalid email", { description: emailCheck.reason });
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await forgetPassword({
        email: email.trim().toLowerCase(),
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(formatAuthError(resetError, "Couldn't send reset email."));
        toast.error("Couldn't send reset email", {
          description: formatAuthError(resetError, ""),
        });
      } else {
        setSent(true);
        toast.success("Reset link sent", {
          description: "Check your inbox for a password reset link.",
        });
      }
    } catch (err) {
      setError(formatAuthError(err, "Something went wrong. Try again."));
    } finally {
      setLoading(false);
    }
  };

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

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-2/60 border border-white/[0.06] rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h1 className="font-heading text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-light-2 text-sm mb-6 leading-relaxed">
              If an account exists for <span className="text-light font-medium">{email}</span>,
              we&apos;ve sent a password reset link. The link expires in 1 hour.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-brand hover:text-brand-light text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </motion.div>
        ) : (
          <div className="bg-dark-2/60 border border-white/[0.06] rounded-2xl p-8">
            <h1 className="font-heading text-2xl font-bold mb-2">Forgot password?</h1>
            <p className="text-light-2 text-sm mb-6">
              Enter your email and we&apos;ll send you a link to reset it.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-2 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-3" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-3/50 border border-white/[0.08] text-sm text-light placeholder-light-3 outline-none focus:border-brand/40 focus:bg-dark-3/80 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full transition-all hover:shadow-[0_0_24px_rgba(249,115,22,0.35)]"
              >
                {loading ? "Sending..." : (
                  <>
                    Send reset link
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
        )}
      </motion.div>
    </div>
  );
}
