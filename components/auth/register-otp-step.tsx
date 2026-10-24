"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon, byPrefixAndName } from "@/lib/fontawesome";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { maskEmail } from "@/lib/email-validation";

interface RegisterOtpStepProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function RegisterOtpStep({ email, onSuccess, onBack }: RegisterOtpStepProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);

  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const sendOtp = useAuthStore((s) => s.sendOtp);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setError("");
    setLoading(true);
    try {
      const res = await verifyOtp(email, otp);
      if (!res.success) {
        setError(res.error || "Invalid verification code. Please check and try again.");
      } else {
        toast.success("Email verified!", { description: "Your workspace is ready." });
        onSuccess();
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    try {
      const res = await sendOtp(email);
      if (res.success) {
        toast.success("New code sent", { description: `Check ${maskEmail(email)}` });
        setResendCooldown(60);
      } else {
        setError(res.error || "Could not resend code.");
      }
    } catch {
      setError("Could not resend code. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-4 text-brand">
          <FontAwesomeIcon icon={byPrefixAndName.fans["envelope"]} className="w-5 h-5" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-light">Check your inbox</h2>
        <p className="text-light-3 text-xs sm:text-sm mt-1.5">
          We sent a 6-digit verification code to <span className="text-brand font-medium">{maskEmail(email)}</span>.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-center gap-2">
          <FontAwesomeIcon icon={byPrefixAndName.fans["circle-exclamation"]} className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          placeholder="······"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3.5 rounded-xl bg-dark-3/70 border border-white/[0.08] text-light placeholder-light-4 focus:border-brand/50 focus:outline-none transition-all"
        />

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full py-3 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-brand/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <FontAwesomeIcon icon={byPrefixAndName.fans["spinner"]} className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Verify & Continue</span>
              <FontAwesomeIcon icon={byPrefixAndName.fans["arrow-right"]} className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center justify-between text-xs text-light-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-light-4 hover:text-light transition cursor-pointer"
        >
          ← Use different email
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="text-brand hover:text-brand-light disabled:text-light-4 transition cursor-pointer"
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}
