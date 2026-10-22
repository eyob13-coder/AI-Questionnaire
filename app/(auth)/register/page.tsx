"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FontAwesomeIcon, byPrefixAndName } from "@/lib/fontawesome";
import { signIn } from "@/lib/auth-client";
import { formatAuthError, getOfflineMessage } from "@/lib/auth-errors";
import { validateEmail } from "@/lib/email-validation";
import { useAuthStore } from "@/lib/store";
import { RegisterOtpStep } from "@/components/auth/register-otp-step";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
  });

  const registerUser = useAuthStore((s) => s.register);
  const sendOtp = useAuthStore((s) => s.sendOtp);

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

    const check = validateEmail(form.email);
    if (!check.valid) {
      setError(check.reason || "Please enter a valid work email.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        company: form.company.trim(),
      });

      if (!res.success) {
        setError(res.error || "Failed to create account.");
      } else {
        await sendOtp(form.email.trim());
        setStep("otp");
      }
    } catch (err) {
      setError(formatAuthError(err, "Account creation failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    if (isOffline) {
      setError(getOfflineMessage());
      return;
    }
    try {
      const { error } = await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
      if (error) setError(error.message || "Google sign-up unavailable.");
    } catch (err) {
      setError(formatAuthError(err, "Google sign-up unavailable."));
    }
  };

  if (step === "otp") {
    return (
      <RegisterOtpStep
        email={form.email}
        onSuccess={() => router.replace("/dashboard")}
        onBack={() => setStep("form")}
      />
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
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-[11px] font-mono mb-2">
          <FontAwesomeIcon icon={byPrefixAndName.fans["wand-magic-sparkles"]} className="w-3 h-3" />
          14-day free trial · No card needed
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-light tracking-tight">
          Create your account
        </h1>
        <p className="text-light-3 text-sm mt-1">
          Automate questionnaires with enterprise AI precision.
        </p>
      </div>

      {/* Google Sign-up */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={loading || isOffline}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14] text-light text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm"
      >
        <FontAwesomeIcon icon={byPrefixAndName.fab["google"]} className="w-4 h-4 text-brand" />
        Sign up with Google SSO
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.08]" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-light-4">
          or sign up with work email
        </span>
        <div className="flex-1 h-px bg-white/[0.08]" />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-center gap-2">
          <FontAwesomeIcon icon={byPrefixAndName.fans["circle-exclamation"]} className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-light-2 mb-1">Full Name</label>
            <div className="relative">
              <FontAwesomeIcon icon={byPrefixAndName.fans["user"]} className="w-3.5 h-3.5 text-light-4 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Alex Vance"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-dark-3/60 border border-white/[0.08] text-xs text-light placeholder:text-light-4 focus:outline-none focus:border-brand/40 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-light-2 mb-1">Company</label>
            <div className="relative">
              <FontAwesomeIcon icon={byPrefixAndName.fans["building"]} className="w-3.5 h-3.5 text-light-4 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Acme Security"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-dark-3/60 border border-white/[0.08] text-xs text-light placeholder:text-light-4 focus:outline-none focus:border-brand/40 transition"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-light-2 mb-1">Work Email</label>
          <div className="relative">
            <FontAwesomeIcon icon={byPrefixAndName.fans["envelope"]} className="w-3.5 h-3.5 text-light-4 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="alex@acme.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-dark-3/60 border border-white/[0.08] text-xs text-light placeholder:text-light-4 focus:outline-none focus:border-brand/40 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-light-2 mb-1">Password</label>
          <div className="relative">
            <FontAwesomeIcon icon={byPrefixAndName.fans["lock"]} className="w-3.5 h-3.5 text-light-4 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min 8 characters"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-dark-3/60 border border-white/[0.08] text-xs text-light placeholder:text-light-4 focus:outline-none focus:border-brand/40 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-light-4 hover:text-light transition cursor-pointer"
            >
              <FontAwesomeIcon icon={byPrefixAndName.fans[showPassword ? "eye-slash" : "eye"]} className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold transition shadow-md shadow-brand/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <FontAwesomeIcon icon={byPrefixAndName.fans["spinner"]} className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Get Started Free</span>
              <FontAwesomeIcon icon={byPrefixAndName.fans["arrow-right"]} className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-light-3">
        Already have an account?{" "}
        <Link href="/login" className="text-brand font-semibold hover:text-brand-light transition">
          Sign In
        </Link>
      </p>
    </motion.div>
  );
}
