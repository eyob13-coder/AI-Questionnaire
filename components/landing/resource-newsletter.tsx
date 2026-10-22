"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2 } from "lucide-react";
import { subscribeNewsletter } from "@/lib/resources";
import { formatApiError } from "@/lib/api";

export function ResourceNewsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;
    setSubscribing(true);
    setSubscribeError(null);
    try {
      await subscribeNewsletter(email.trim(), "landing");
      setSubscribed(true);
    } catch (error) {
      setSubscribeError(formatApiError(error, "Could not subscribe - please try again."));
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-12 rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/[0.07] via-dark-3/60 to-dark-3/60 p-8 sm:p-10 overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-[300px] h-[200px] rounded-full bg-brand/[0.06] blur-[80px] pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4.5 h-4.5 text-brand" />
            <span className="text-xs font-semibold text-brand uppercase tracking-wider">
              Security Digest
            </span>
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-light mb-1">
            Get the security team playbook
          </h3>
          <p className="text-sm text-light-3">
            Biweekly guides on questionnaire automation, AI adoption, and closing enterprise deals faster. No spam.
          </p>
        </div>
        {subscribed ? (
          <div className="flex items-center gap-2 text-success font-semibold shrink-0">
            <CheckCircle2 className="w-5 h-5" />
            You&apos;re subscribed!
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col w-full sm:w-auto shrink-0">
            <div className="flex gap-2.5">
              <input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={subscribing}
                className="px-4 py-2.5 text-sm bg-dark-4/80 border border-white/[0.1] rounded-xl text-light placeholder:text-light-4 focus:outline-none focus:border-brand/50 transition-colors w-full sm:w-52 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl transition-colors shrink-0 disabled:opacity-60 cursor-pointer"
              >
                {subscribing ? "Subscribing…" : "Subscribe"}
              </button>
            </div>
            {subscribeError && (
              <p className="text-xs text-danger mt-2">{subscribeError}</p>
            )}
          </form>
        )}
      </div>
    </motion.div>
  );
}
