"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Settings, Shield, Palette, Brain, Database, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [workspaceName, setWorkspaceName] = useState("Acme Security Team");
  const [aiTone, setAiTone] = useState("professional");
  const [retentionDays, setRetentionDays] = useState("90");

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold">Settings</h2>
        <p className="text-sm text-light-3 mt-1">Workspace configuration and preferences.</p>
      </motion.div>

      {/* Workspace Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/[0.06] bg-dark-3/30 p-6 space-y-5"
      >
        <h3 className="font-heading text-base font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand" />
          Workspace Profile
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-light-2 mb-1.5">Workspace Name</label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-4/50 border border-white/[0.06] text-sm text-light outline-none focus:border-brand/30 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-light-2 mb-1.5">Workspace Slug</label>
            <div className="flex items-center gap-0 rounded-xl bg-dark-4/50 border border-white/[0.06] overflow-hidden">
              <span className="px-3 py-2.5 text-sm text-light-3 bg-dark-5/50 border-r border-white/[0.06]">shieldai.app/</span>
              <input
                type="text"
                defaultValue="acme-security"
                className="flex-1 px-3 py-2.5 bg-transparent text-sm text-light outline-none"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-white/[0.06] bg-dark-3/30 p-6 space-y-5"
      >
        <h3 className="font-heading text-base font-semibold flex items-center gap-2">
          <Brain className="w-4 h-4 text-brand" />
          AI Configuration
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-light-2 mb-1.5">Answer Tone</label>
            <select
              value={aiTone}
              onChange={(e) => setAiTone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-4/50 border border-white/[0.06] text-sm text-light outline-none cursor-pointer focus:border-brand/30 transition"
            >
              <option value="professional">Professional — Formal and precise</option>
              <option value="concise">Concise — Brief and to the point</option>
              <option value="detailed">Detailed — Comprehensive explanations</option>
              <option value="friendly">Friendly — Approachable but informative</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-light-2 mb-1.5">Default Response Template</label>
            <textarea
              defaultValue="Answer the question based solely on the provided evidence. If insufficient information is available, state: 'Insufficient information in knowledge base to answer this question.'"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-4/50 border border-white/[0.06] text-sm text-light outline-none focus:border-brand/30 transition resize-none"
            />
          </div>
        </div>
      </motion.div>

      {/* Data Retention */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/[0.06] bg-dark-3/30 p-6 space-y-5"
      >
        <h3 className="font-heading text-base font-semibold flex items-center gap-2">
          <Database className="w-4 h-4 text-brand" />
          Data Retention
        </h3>
        <div>
          <label className="block text-sm text-light-2 mb-1.5">Auto-delete uploaded files after</label>
          <select
            value={retentionDays}
            onChange={(e) => setRetentionDays(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-dark-4/50 border border-white/[0.06] text-sm text-light outline-none cursor-pointer focus:border-brand/30 transition"
          >
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="90">90 days</option>
            <option value="180">180 days</option>
            <option value="365">1 year</option>
            <option value="0">Never (keep indefinitely)</option>
          </select>
          <p className="text-xs text-light-4 mt-1.5">Pinned files are excluded from auto-deletion.</p>
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-danger/20 bg-danger/[0.03] p-6"
      >
        <h3 className="font-heading text-base font-semibold text-danger flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h3>
        <p className="text-sm text-light-3 mt-2">Permanently delete this workspace and all its data. This action cannot be undone.</p>
        <button className="mt-4 px-5 py-2 text-sm font-semibold text-danger border border-danger/30 rounded-full hover:bg-danger/10 transition">
          Delete Workspace
        </button>
      </motion.div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-full transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]">
          Save Changes
        </button>
      </div>
    </div>
  );
}
