"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight, Lock, Mail, CheckCircle2, BarChart3, Zap, WifiOff } from "lucide-react";
import { VaultixIcon } from "@/components/ui/vaultix-icon";
import { signIn } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { formatAuthError, getOfflineMessage } from "@/lib/auth-errors";

const testimonial = {
    quote: "Vaultix cut our security questionnaire turnaround from 2 weeks to 2 hours. Absolutely game-changing for our sales cycle.",
    author: "Priya Sharma",
    title: "Head of Security · CloudKin",
    avatar: "PS",
};

const stats = [
    { icon: Zap, value: "10x", label: "Faster" },
    { icon: BarChart3, value: "87%", label: "Acceptance rate" },
    { icon: CheckCircle2, value: "50K+", label: "Questions answered" },
];

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [isOffline, setIsOffline] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextTarget = searchParams.get("next");
    const callbackURL =
        nextTarget && nextTarget.startsWith("/dashboard")
            ? nextTarget
            : "/dashboard";

    useEffect(() => {
        const updateOnlineState = () => {
            setIsOffline(!navigator.onLine);
        };

        updateOnlineState();
        window.addEventListener("online", updateOnlineState);
        window.addEventListener("offline", updateOnlineState);

        return () => {
            window.removeEventListener("online", updateOnlineState);
            window.removeEventListener("offline", updateOnlineState);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (isOffline) {
            setError(getOfflineMessage());
            return;
        }

        setLoading(true);

        try {
            const { error: signInError } = await signIn.email({
                email,
                password,
                callbackURL,
            });

            if (signInError) {
                setError(formatAuthError(signInError, "Failed to sign in"));
            } else {
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
            await signIn.social({
                provider: "google",
                callbackURL,
            });
        } catch (err) {
            setError(formatAuthError(err, "Google sign-in is unavailable right now."));
        }
    };

    return (
        <div className="min-h-screen bg-dark flex">
            {/* ── Left panel: brand / social proof ── */}
            <div className="hidden lg:flex flex-col justify-between w-[480px] xl:w-[520px] shrink-0 relative overflow-hidden bg-dark-2 border-r `border-white/[0.04]` p-12">
                {/* Background effects */}
                <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
                <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full `bg-brand/[0.06]` blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full `bg-brand/[0.04]` blur-[80px] pointer-events-none" />

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

                {/* Main copy + visual */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="relative z-10 space-y-8"
                >
                    <div>
                        <h2 className="font-heading text-3xl font-bold leading-snug">
                            Security questionnaires,
                            <span className="text-gradient-brand"> answered in minutes</span>
                        </h2>
                        <p className="text-light-2 mt-3 leading-relaxed">
                            Upload your questionnaire, let AI draft answers from your knowledge base, then review and export.
                        </p>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-6">
                        {stats.map((s) => (
                            <div key={s.label} className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <s.icon className="w-3.5 h-3.5 text-brand" />
                                    <span className="font-heading text-xl font-bold text-gradient-brand">{s.value}</span>
                                </div>
                                <span className="text-xs text-light-3">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Mini product preview */}
                    <div className="rounded-2xl bg-dark-3/60 border border-white/[0.06] overflow-hidden backdrop-blur-sm">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-dark-4/50 border-b border-white/[0.04]">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                            </div>
                            <span className="text-xs text-light-3 font-mono ml-1">SOC2_Questionnaire.xlsx</span>
                            <span className="ml-auto text-xs text-light-3 bg-dark-5 px-2 py-0.5 rounded font-mono">42/50</span>
                        </div>
                        {[
                            { q: "Do you encrypt all data at rest?", conf: 96, status: "Approved" },
                            { q: "Describe your incident response process", conf: 82, status: "Review" },
                            { q: "Do you perform penetration testing?", conf: 88, status: "Approved" },
                        ].map((row, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03]">
                                <span className="text-xs text-light-2 flex-1 truncate">{row.q}</span>
                                <span className={`text-xs font-mono font-semibold shrink-0 ${row.conf >= 85 ? "text-success" : "text-warning"}`}>
                                    {row.conf}%
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${row.status === "Approved" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                    }`}>
                                    {row.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Testimonial */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="relative z-10"
                >
                    <div className="rounded-2xl bg-dark-3/40 border border-white/[0.06] p-5 backdrop-blur-sm">
                        <p className="text-sm text-light-2 leading-relaxed italic mb-4">
                            &ldquo;{testimonial.quote}&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand/40 to-brand/10 flex items-center justify-center text-xs font-bold text-brand shrink-0">
                                {testimonial.avatar}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-light">{testimonial.author}</p>
                                <p className="text-xs text-light-3">{testimonial.title}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── Right panel: login form ── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative">
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
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="relative z-10 w-full max-w-[400px]"
                >
                    {/* Heading */}
                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
                            Welcome back
                        </h1>
                        <p className="text-light-2 text-sm mt-2">
                            Sign in to your Vaultix workspace
                        </p>
                    </div>

                    {/* Google SSO */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading || isOffline}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/[0.15] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium text-light mb-6 cursor-pointer"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px `bg-white/[0.06]`" />
                        <span className="text-xs text-light-3 px-1">or continue with email</span>
                        <div className="flex-1 h-px `bg-white/[0.06]`" />
                    </div>

                    {/* Form */}
                    {isOffline && (
                        <div className="mb-4 p-3 rounded-xl bg-warning/10 border border-warning/20 text-sm text-warning flex items-start gap-2">
                            <WifiOff className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{getOfflineMessage()}</span>
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-light-2 mb-1.5">
                                Work Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-3" />
                                <input
                                    type="email"
                                    required
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-3/50 border border-white/[0.08] text-sm text-light placeholder-light-3 outline-none focus:border-brand/40 focus:bg-dark-3/80 transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-medium text-light-2">Password</label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-brand hover:text-brand-light transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-3" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || isOffline}
                            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full transition-all duration-200 hover:shadow-[0_0_24px_rgba(249,115,22,0.35)] mt-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register link */}
                    <p className="text-center text-sm text-light-3 mt-6">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-brand hover:text-brand-light font-medium transition-colors">
                            Start free trial
                        </Link>
                    </p>

                    {/* Security note */}
                    <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-white/[0.04]">
                        {["SOC 2", "AES-256", "SSO"].map((badge) => (
                            <span key={badge} className="text-xs text-light-4 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-success/60" />
                                {badge}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
