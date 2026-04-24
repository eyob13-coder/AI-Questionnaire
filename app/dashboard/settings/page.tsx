"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Shield, AlertTriangle, Loader2, User, Trash2 } from "lucide-react";
import { apiPatch, apiDelete, formatApiError } from "@/lib/api";
import { useWorkspace } from "@/lib/workspace";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  WorkspaceGate,
  PageError,
} from "@/components/dashboard/workspace-state";

function SettingsContent() {
  const { workspace, refresh } = useWorkspace();
  const { data: session } = useSession();
  const router = useRouter();

  // Workspace state
  const [name, setName] = useState(workspace?.name || "");
  const [slug, setSlug] = useState(workspace?.slug || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Personal state
  const [personalName, setPersonalName] = useState("");
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalSavedAt, setPersonalSavedAt] = useState<number | null>(null);

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setSlug(workspace.slug);
    }
    if (session?.user) {
      setPersonalName(session.user.name);
    }
  }, [workspace, session]);

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
      setError(formatApiError(error, "Failed to save workspace"));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePersonal = async () => {
    setSavingPersonal(true);
    setError(null);
    try {
      await authClient.updateUser({ name: personalName });
      setPersonalSavedAt(Date.now());
    } catch (err) {
      setError("Failed to update personal profile");
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspace || deleteConfirmText !== workspace.name) return;
    setDeleting(true);
    setError(null);
    try {
      await apiDelete(`/workspaces/${workspace.id}`);
      router.push("/dashboard");
    } catch (err) {
      setError(formatApiError(err, "Failed to delete workspace"));
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold">Settings</h2>
        <p className="text-sm text-light-3 mt-1">
          Manage your personal profile and workspace configuration.
        </p>
      </motion.div>

      {/* Personal Settings */}
      <div className="rounded-2xl border border-white/[0.06] bg-dark-3/30 p-6 space-y-5">
        <h3 className="font-heading text-base font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-brand" />
          Personal Profile
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-light-2 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={personalName}
              onChange={(e) => setPersonalName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-4/50 border border-white/[0.06] text-sm text-light outline-none focus:border-brand/30 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-light-2 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={session?.user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-xl bg-dark-4/50 border border-white/[0.06] text-sm text-light-4 outline-none opacity-60 cursor-not-allowed"
            />
          </div>
          <div className="flex justify-end items-center gap-3 pt-2">
            {personalSavedAt && (
              <span className="text-xs text-success">Saved</span>
            )}
            <button
              onClick={handleSavePersonal}
              disabled={savingPersonal || personalName === session?.user?.name}
              className="px-5 py-2 bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-50 disabled:cursor-not-allowed text-light text-sm font-medium rounded-xl transition-all flex items-center gap-2"
            >
              {savingPersonal && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Profile
            </button>
          </div>
        </div>
      </div>

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
            onClick={() => {
              setDeleteConfirmText("");
              setShowDeleteModal(true);
            }}
            className="mt-4 px-5 py-2 text-sm font-semibold text-danger border border-danger/30 hover:bg-danger/10 rounded-full transition-colors"
          >
            Delete Workspace
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

      {/* Delete Workspace Modal */}
      <AnimatePresence>
        {showDeleteModal && workspace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-dark-2 border border-danger/20 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-danger" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">
                  Delete Workspace
                </h3>
                <p className="text-sm text-light-3 mb-6 leading-relaxed">
                  You are about to permanently delete <strong className="text-light">{workspace.name}</strong>. This action cannot be undone and will permanently delete all questionnaires, documents, and members associated with this workspace.
                </p>
                
                <div className="space-y-2 mb-6">
                  <label className="text-xs text-light-3">
                    Please type <strong>{workspace.name}</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-3/50 border border-danger/30 text-sm text-light outline-none focus:border-danger transition"
                    placeholder={workspace.name}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-dark-4 hover:bg-dark-5 text-light-2 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteWorkspace}
                    disabled={deleteConfirmText !== workspace.name || deleting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-danger hover:bg-danger/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Delete Workspace
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SettingsPage() {
  return <WorkspaceGate>{() => <SettingsContent />}</WorkspaceGate>;
}
