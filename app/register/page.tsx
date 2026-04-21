"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
    Eye, EyeOff, ArrowRight, Lock, Mail, User, Building2,
    Check, Sparkles, Shield, Brain, Zap,
} from "lucide-react";
import { VaultixIcon } from "@/components/ui/vaultix-icon";
import { signUp, signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const perks = [
    { icon: Zap, text: "Process 300+ questions in minutes" },
    { icon: Brain, text: "AI answers with source citations" },
    { icon: Shield, text: "SOC 2 ready · AES-256 encrypted" },
];

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"form" | "success">("form");
    const [error, setError] = useState("");
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        company: "",
        password: "",
    });

    const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [k]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { error: signUpError } = await signUp.email({
                email: form.email,
                password: form.password,
                name: form.name,
                callbackURL: "/dashboard",
            });

            if (signUpError) {
                setError(signUpError.message || "Failed to create account");
            } else {
                setStep("success");
            }
        } catch (err: any) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        await signIn.social({
            provider: "google",
            callbackURL: "/dashboard",
        });
    };

    const passwordStrength = (() => {
        const p = form.password;
        if (!p) return null;
        if (p.length < 6) return { level: 0, label: "Too short", color: "bg-danger" };
        if (p.length < 8) return { level: 1, label: "Weak", color: "bg-danger" };
        const strong = /[A-Z]/.test(p) && /[0-9]/.test(p) && p.length >= 10;
        const medium = p.length >= 8;
        if (strong) return { level: 3, label: "Strong", color: "bg-success" };
        if (medium) return { level: 2, label: "Fair", color: "bg-warning" };
        return { level: 1, label: "Weak", color: "bg-danger" };
    })();

    return (
        <div className="min-h-screen bg-dark flex">
            {/* ── Left panel: form ── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative order-2 lg:order-1">
                <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand/[0.04] blur-[120px] pointer-events-none" />

                {/* Mobile logo */}
                <div className="lg:hidden mb-8">
                    <Link href="/" className="flex items-center gap-2.5 w-fit mx-auto">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center">
                            <VaultixIcon className="w-5 h-5" />
                        </div>
                        <span className="font-heading text-xl font-bold">
                            Vault<span className="text-brand">ix</span>
                        </span>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-full max-w-[420px]"
                >
                    {step === "success" ? (
                        /* ── Success state ── */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6">
                                <Check className="w-8 h-8 text-success" />
                            </div>
                            <h2 className="font-heading text-2xl font-bold mb-2">You&apos;re in!</h2>
                            <p className="text-light-2 text-sm mb-8">
                                Your workspace is ready. Let&apos;s complete your first questionnaire.
                            </p>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-full transition-all hover:shadow-[0_0_24px_rgba(249,115,22,0.35)] w-full"
                            >
                                Go to Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            {/* Heading */}
                            <div className="mb-8 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand/20 bg-brand/[0.06] text-brand text-xs font-medium mb-4">
                                    <Sparkles className="w-3 h-3" />
                                    14-day free trial · No credit card
                                </div>
                                <h1 className="font-heading text-2xl sm:text-3xl font-bold">
                                    Start your free trial
                                </h1>
                                <p className="text-light-2 text-sm mt-2">
                                    Join 120+ security teams using Vaultix
                                </p>
                            </div>

                            {/* Google SSO */}
                            <button onClick={handleGoogleSignUp} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-200 text-sm font-medium text-light mb-6 cursor-pointer">
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign up with Google
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 h-px bg-white/[0.06]" />
                                <span className="text-xs text-light-3 px-1">or sign up with email</span>
                                <div className="flex-1 h-px bg-white/[0.06]" />
                            </div>

                            {/* Form */}
                            {error && (
                                <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name + Company row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-light-2 mb-1.5">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-3" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Jane Smith"
                                                value={form.name}
                                                onChange={update("name")}
                                                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-dark-3/50 border border-white/[0.08] text-sm text-light placeholder-light-3 outline-none focus:border-brand/40 focus:bg-dark-3/80 transition-all duration-200"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-light-2 mb-1.5">Company</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-3" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Acme Inc."
                                                value={form.company}
                                                onChange={update("company")}
                                                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-dark-3/50 border border-white/[0.08] text-sm text-light placeholder-light-3 outline-none focus:border-brand/40 focus:bg-dark-3/80 transition-all duration-200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Work email */}
                                <div>
                                    <label className="block text-sm font-medium text-light-2 mb-1.5">Work Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-3" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="you@company.com"
                                            value={form.email}
                                            onChange={update("email")}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-3/50 border border-white/[0.08] text-sm text-light placeholder-light-3 outline-none focus:border-brand/40 focus:bg-dark-3/80 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-light-2 mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-3" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="Min. 8 characters"
                                            value={form.password}
                                            onChange={update("password")}
                                            className="w-full pl-10 pr-12 py-3 rounded-xl bg-dark-3/50 border border-white/[0.08] text-sm text-light placeholder-light-3 outline-none focus:border-brand/40 focus:bg-dark-3/80 transition-all duration-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-light-3 hover:text-light-2 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {/* Password strength */}
                                    {passwordStrength && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex gap-1 flex-1">
                                                {[0, 1, 2].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passwordStrength.level ? passwordStrength.color : "bg-dark-5"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-light-3">{passwordStrength.label}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Terms */}
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative mt-0.5">
                                        <input type="checkbox" required className="sr-only peer" />
                                        <div className="w-4 h-4 rounded border border-white/[0.15] peer-checked:bg-brand peer-checked:border-brand transition-all" />
                                        <Check className="w-2.5 h-2.5 text-white absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-xs text-light-3 leading-relaxed">
                                        I agree to the{" "}
                                        <a href="#" className="text-brand hover:text-brand-light transition-colors">Terms of Service</a>
                                        {" "}and{" "}
                                        <a href="#" className="text-brand hover:text-brand-light transition-colors">Privacy Policy</a>
                                    </span>
                                </label>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full transition-all duration-200 hover:shadow-[0_0_24px_rgba(249,115,22,0.35)]"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Creating your workspace...
                                        </>
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Login link */}
                            <p className="text-center text-sm text-light-3 mt-6">
                                Already have an account?{" "}
                                <Link href="/login" className="text-brand hover:text-brand-light font-medium transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
                </motion.div>
            </div>

            {/* ── Right panel: brand ── */}
            <div className="hidden lg:flex flex-col justify-between w-[460px] xl:w-[500px] shrink-0 relative overflow-hidden bg-dark-2 border-l border-white/[0.04] p-12 order-1 lg:order-2">
                {/* Background effects */}
                <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-brand/[0.06] blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-brand/[0.04] blur-[80px] pointer-events-none" />

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10"
                >
                    <Link href="/" className="flex items-center gap-2.5 w-fit">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center shadow-lg shadow-brand/20">
                            <VaultixIcon className="w-5 h-5" />
                        </div>
                        <span className="font-heading text-xl font-bold">
                            Vault<span className="text-brand">ix</span>
                        </span>
                    </Link>
                </motion.div>

                {/* Center content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="relative z-10 space-y-8"
                >
                    <div>
                        <h2 className="font-heading text-3xl font-bold leading-snug">
                            Everything you need to
                            <span className="text-gradient-brand"> ship deals faster</span>
                        </h2>
                        <p className="text-light-2 mt-3 leading-relaxed text-sm">
                            Security reviews slow down your sales cycle. Vaultix automates the answers, so your team stays focused on closing.
                        </p>
                    </div>

                    {/* Perks */}
                    <div className="space-y-4">
                        {perks.map((perk, i) => (
                            <motion.div
                                key={perk.text}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                                className="flex items-center gap-4 p-4 rounded-xl bg-dark-3/40 border border-white/[0.04]"
                            >
                                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                                    <perk.icon className="w-4.5 h-4.5 text-brand" />
                                </div>
                                <span className="text-sm text-light-2">{perk.text}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Plan included */}
                    <div className="rounded-2xl bg-gradient-to-br from-brand/[0.08] to-brand/[0.03] border border-brand/20 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-light">Pro Trial — 14 days free</span>
                            <span className="text-xs text-brand bg-brand/10 px-2.5 py-1 rounded-full font-medium">Included</span>
                        </div>
                        <ul className="space-y-2">
                            {[
                                "Unlimited questionnaires",
                                "5,000 questions/month",
                                "100 knowledge docs",
                                "10 workspace members",
                                "Priority support",
                            ].map((f) => (
                                <li key={f} className="flex items-center gap-2 text-xs text-light-2">
                                    <Check className="w-3.5 h-3.5 text-brand shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Bottom: companies */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="relative z-10"
                >
                    <p className="text-xs text-light-4 uppercase tracking-widest mb-3">Trusted by teams at</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {["CloudKin", "VaultStack", "TrustLayer", "ComplianceHQ"].map((name) => (
                            <span key={name} className="text-sm font-heading font-semibold text-light-4">
                                {name}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
