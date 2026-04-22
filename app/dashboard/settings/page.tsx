"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";
import { apiPatch, formatApiError } from "@/lib/api";
import { useWorkspace } from "@/lib/workspace";
import {
  WorkspaceGate,
  PageError,
} from "@/components/dashboard/workspace-state";

function SettingsContent() {
  const { workspace, refresh } = useWorkspace();
  const [name, setName] = useState(workspace?.name || "");
  const [slug, setSlug] = useState(workspace?.slug || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setSlug(workspace.slug);
    }
  }, [workspace]);

  const isOwner = workspace?.myRole === "OWNER";

  const handleSave = async () => {
    if (!workspace) return;
    setSaving(true);
    setError(null);
    try {
      await apiPatch(`/workspaces/${workspace.id}`, { name, slug });
      await refresh();
      setSavedAt(Date.now());
    } catch (error) {
      setError(formatApiError(error, "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold">Settings</h2>
        <p className="text-sm text-light-3 mt-1">
          Workspace configuration and preferences.
        </p>
      </motion.div>

      <div className="rounded-2xl border border-white/[0.06] bg-dark-3/30 p-6 space-y-5">
        <h3 className="font-heading text-base font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand" />
          Workspace Profile
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-light-2 mb-1.5">
              Workspace Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isOwner}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-4/50 border border-white/[0.06] text-sm text-light outline-none focus:border-brand/30 transition disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm text-light-2 mb-1.5">
              Workspace Slug
            </label>
            <div className="flex items-center rounded-xl bg-dark-4/50 border border-white/[0.06] overflow-hidden">
              <span className="px-3 py-2.5 text-sm text-light-3 bg-dark-5/50 border-r border-white/[0.06]">
                vaultix.app/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={!isOwner}
                className="flex-1 px-3 py-2.5 bg-transparent text-sm text-light outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      {error && <PageError message={error} />}

      {isOwner && (
        <div className="rounded-2xl border border-danger/20 bg-danger/[0.03] p-6">
          <h3 className="font-heading text-base font-semibold text-danger flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </h3>
          <p className="text-sm text-light-3 mt-2">
            Permanently delete this workspace and all its data. This action
            cannot be undone.
          </p>
          <button
            disabled
            className="mt-4 px-5 py-2 text-sm font-semibold text-danger border border-danger/30 rounded-full opacity-50 cursor-not-allowed"
          >
            Delete Workspace (coming soon)
          </button>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {savedAt && (
          <span className="text-xs text-success">Saved</span>
        )}
        <button
          onClick={handleSave}
          disabled={!isOwner || saving}
          className="px-6 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full transition-all inline-flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>

      {!isOwner && (
        <p className="text-xs text-light-4 text-center">
          Only workspace owners can edit settings.
        </p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return <WorkspaceGate>{() => <SettingsContent />}</WorkspaceGate>;
}
