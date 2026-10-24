"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
  Shield,
  AlertTriangle,
  Loader2,
  User,
  Trash2,
  Lock,
  Upload,
  Camera,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  Mail,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { apiPatch, apiDelete, formatApiError } from "@/lib/api";
import { useWorkspace } from "@/lib/workspace";
import { useSession, changePassword } from "@/lib/auth-client";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  WorkspaceGate,
  PageError,
} from "@/components/dashboard/workspace-state";

type SettingsTab = "profile" | "security" | "workspace";

const PRESET_AVATARS = [
  { label: "Sunset Glow", gradient: "from-orange-500 to-amber-500", c1: "#F97316", c2: "#D97706" },
  { label: "Emerald Vault", gradient: "from-emerald-500 to-teal-600", c1: "#10B981", c2: "#0D9488" },
  { label: "Deep Indigo", gradient: "from-indigo-500 to-blue-600", c1: "#6366F1", c2: "#2563EB" },
  { label: "Cyber Violet", gradient: "from-purple-500 to-pink-500", c1: "#A855F7", c2: "#EC4899" },
  { label: "Slate Noir", gradient: "from-zinc-600 to-zinc-900", c1: "#52525B", c2: "#18181B" },
];

function SettingsContent() {
  const { workspace, refresh } = useWorkspace();
  const { data: session } = useSession();
  const authStoreUser = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Current effective user
  const user = authStoreUser || session?.user;

  // Personal Profile State
  const [personalName, setPersonalName] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [company, setCompany] = useState("");
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Workspace state
  const [name, setName] = useState(workspace?.name || "");
  const [slug, setSlug] = useState(workspace?.slug || "");
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // General error state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setSlug(workspace.slug);
    }
  }, [workspace]);

  useEffect(() => {
    if (user) {
      setPersonalName(user.name || "");
      setPersonalEmail(user.email || "");
      setCompany(user.company || "");
      setAvatarImage(user.image || null);
    }
  }, [user]);

  const isOwner = workspace?.myRole === "OWNER";
  const displayInitial = (personalName || "U").charAt(0).toUpperCase();

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image file is too large", {
        description: "Please select an image under 4MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarImage(result);
      toast.success("Photo selected", {
        description: "Click 'Save Changes' below to apply your new profile photo.",
      });
    };
    reader.readAsDataURL(file);
  };

  // Remove Photo Handler
  const handleRemovePhoto = () => {
    setAvatarImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Photo removed", {
      description: "Click 'Save Changes' to revert to your initials avatar.",
    });
  };

  // Save Personal Profile
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setError(null);
    try {
      const res = await updateProfile({
        name: personalName.trim(),
        email: personalEmail.trim().toLowerCase(),
        company: company.trim(),
        image: avatarImage,
      });

      if (!res.success) {
        toast.error("Failed to update profile", { description: res.error });
        setError(res.error || "Failed to update profile");
      } else {
        toast.success("Profile updated successfully!", {
          description: "Your photo, name, and contact details have been saved.",
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Profile update failed.";
      toast.error("Failed to update profile", { description: msg });
      setError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (res.error) {
        toast.error("Failed to change password", {
          description: res.error.message || "Please check your current password and try again.",
        });
      } else {
        toast.success("Password changed successfully!", {
          description: "Your account is now secured with your new password.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error("Failed to change password", {
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  // Save Workspace Settings
  const handleSaveWorkspace = async () => {
    if (!workspace) return;
    setSavingWorkspace(true);
    setError(null);
    try {
      await apiPatch(`/workspaces/${workspace.id}`, { name, slug });
      await refresh();
      setSavedAt(Date.now());
      toast.success("Workspace updated successfully!");
    } catch (err) {
      const msg = formatApiError(err, "Failed to save workspace");
      setError(msg);
      toast.error(msg);
    } finally {
      setSavingWorkspace(false);
    }
  };

  // Delete Workspace
  const handleDeleteWorkspace = async () => {
    if (!workspace || deleteConfirmText !== workspace.name) return;
    setDeleting(true);
    setError(null);
    try {
      await apiDelete(`/workspaces/${workspace.id}`);
      toast.success("Workspace deleted");
      router.push("/dashboard");
    } catch (err) {
      setError(formatApiError(err, "Failed to delete workspace"));
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
          Account &amp; Settings
        </h2>
        <p className="text-sm text-light-3 mt-1">
          Customize your profile, secure your credentials, and manage workspace configurations.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "profile"
              ? "bg-brand/10 text-brand border border-brand/20 shadow-sm"
              : "text-light-3 hover:text-light hover:bg-white/[0.03]"
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "security"
              ? "bg-brand/10 text-brand border border-brand/20 shadow-sm"
              : "text-light-3 hover:text-light hover:bg-white/[0.03]"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Security &amp; Password</span>
        </button>

        <button
          onClick={() => setActiveTab("workspace")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "workspace"
              ? "bg-brand/10 text-brand border border-brand/20 shadow-sm"
              : "text-light-3 hover:text-light hover:bg-white/[0.03]"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Workspace</span>
        </button>
      </div>

      {error && <PageError message={error} />}

      {/* ─── TAB 1: PROFILE CUSTOMIZATION ─── */}
      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Avatar Section */}
          <div className="rounded-2xl border border-white/[0.08] bg-dark-3/40 p-5 sm:p-6 space-y-6">
            <div>
              <h3 className="font-heading text-base font-semibold text-light flex items-center gap-2">
                <Camera className="w-4 h-4 text-brand" />
                Profile Photo
              </h3>
              <p className="text-xs text-light-3 mt-1">
                This image represents your identity across questionnaires, audit logs, and team workspaces.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Photo Display */}
              <div className="relative group shrink-0">
                {avatarImage ? (
                  <img
                    src={avatarImage}
                    alt={personalName}
                    className="w-24 h-24 rounded-2xl object-cover ring-2 ring-brand/30 shadow-xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/30 flex items-center justify-center text-3xl font-bold text-brand shadow-xl">
                    {displayInitial}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success ring-4 ring-dark-2" />
              </div>

              {/* Action Controls */}
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand hover:bg-brand-hover transition-all active:scale-95 shadow-md shadow-brand/20 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </button>

                  {avatarImage && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium text-danger hover:bg-danger/10 border border-danger/20 transition-colors cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-light-4">
                  Recommended: Square JPG, PNG, or WebP under 4MB.
                </p>

                {/* Pre-made gradient avatar options */}
                <div className="pt-2">
                  <p className="text-[11px] font-mono font-medium text-light-4 uppercase tracking-wider mb-2">
                    Or pick a preset gradient
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {PRESET_AVATARS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          // Pre-generate a modern SVG data URI
                          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${preset.c1}"/><stop offset="100%" stop-color="${preset.c2}"/></linearGradient></defs><rect width="128" height="128" rx="28" fill="url(#g)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="52" font-weight="bold">${displayInitial}</text></svg>`;
                          setAvatarImage(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
                          toast.success(`Selected ${preset.label}`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-dark-4 hover:bg-dark-5 border border-white/[0.04] text-[11px] text-light-3 hover:text-light transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${preset.gradient}`} />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details Form */}
          <div className="rounded-2xl border border-white/[0.08] bg-dark-3/40 p-5 sm:p-6 space-y-5">
            <h3 className="font-heading text-base font-semibold text-light flex items-center gap-2">
              <User className="w-4 h-4 text-brand" />
              Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-light-2 mb-1.5 uppercase font-mono tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-light-4 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={personalName}
                    onChange={(e) => setPersonalName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-4/60 border border-white/[0.08] text-sm text-light outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-2 mb-1.5 uppercase font-mono tracking-wider">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-light-4 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme CyberSecurity"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-4/60 border border-white/[0.08] text-sm text-light outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/30 transition"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-light-2 uppercase font-mono tracking-wider">
                    Email Address
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-light-4 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    placeholder="alex@acme.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-4/60 border border-white/[0.08] text-sm text-light outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/30 transition"
                  />
                </div>
                <p className="text-[11px] text-light-4 mt-1.5">
                  Used for sign-in, deal export alerts, and invitation notifications.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand/20 transition-all active:scale-95 cursor-pointer"
              >
                {savingProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── TAB 2: SECURITY & PASSWORD ─── */}
      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <form
            onSubmit={handleChangePassword}
            className="rounded-2xl border border-white/[0.08] bg-dark-3/40 p-5 sm:p-6 space-y-5"
          >
            <div>
              <h3 className="font-heading text-base font-semibold text-light flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand" />
                Change Password
              </h3>
              <p className="text-xs text-light-3 mt-1">
                Ensure your account is using a long, randomized password to stay secure.
              </p>
            </div>

            <div className="space-y-4 max-w-lg">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-light-2 mb-1.5 uppercase font-mono tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="w-full px-4 pr-10 py-2.5 rounded-xl bg-dark-4/60 border border-white/[0.08] text-sm text-light outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-4 hover:text-light transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-light-2 mb-1.5 uppercase font-mono tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 pr-10 py-2.5 rounded-xl bg-dark-4/60 border border-white/[0.08] text-sm text-light outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-4 hover:text-light transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-light-2 mb-1.5 uppercase font-mono tracking-wider">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-4/60 border border-white/[0.08] text-sm text-light outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/30 transition"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/[0.06]">
              <button
                type="submit"
                disabled={savingPassword || !currentPassword || !newPassword}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand/20 transition-all active:scale-95 cursor-pointer"
              >
                {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ─── TAB 3: WORKSPACE CONFIGURATION ─── */}
      {activeTab === "workspace" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-white/[0.08] bg-dark-3/40 p-5 sm:p-6 space-y-5">
            <h3 className="font-heading text-base font-semibold text-light flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand" />
              Workspace Profile
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-light-2 mb-1.5 uppercase font-mono tracking-wider">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isOwner}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-4/60 border border-white/[0.08] text-sm text-light outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/30 transition disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-light-2 mb-1.5 uppercase font-mono tracking-wider">
                  Workspace Slug
                </label>
                <div className="flex items-center rounded-xl bg-dark-4/60 border border-white/[0.08] overflow-hidden">
                  <span className="px-3 py-2.5 text-xs text-light-4 bg-dark-5/50 border-r border-white/[0.06] font-mono">
                    vaultix.app/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={!isOwner}
                    className="flex-1 px-3 py-2.5 bg-transparent text-sm text-light outline-none disabled:opacity-50 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              {savedAt && <span className="text-xs text-success font-medium">Saved</span>}
              <button
                onClick={handleSaveWorkspace}
                disabled={!isOwner || savingWorkspace}
                className="ml-auto px-6 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-2 shadow-lg shadow-brand/20 active:scale-95 cursor-pointer"
              >
                {savingWorkspace && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Workspace</span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          {isOwner && (
            <div className="rounded-2xl border border-danger/25 bg-danger/[0.03] p-5 sm:p-6 space-y-3">
              <h3 className="font-heading text-base font-semibold text-danger flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger" />
                Danger Zone
              </h3>
              <p className="text-xs text-light-3 leading-relaxed">
                Permanently delete this workspace and all its data. This action cannot be undone and will permanently remove all documents and questionnaires.
              </p>
              <button
                onClick={() => {
                  setDeleteConfirmText("");
                  setShowDeleteModal(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-danger border border-danger/30 hover:bg-danger/10 rounded-xl transition-colors active:scale-95 cursor-pointer"
              >
                Delete Workspace
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Delete Workspace Modal */}
      <AnimatePresence>
        {showDeleteModal && workspace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-dark-2 border border-danger/30 rounded-2xl shadow-2xl overflow-hidden p-6"
            >
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-danger" />
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">
                Delete Workspace
              </h3>
              <p className="text-xs text-light-3 mb-6 leading-relaxed">
                You are about to permanently delete <strong className="text-light">{workspace.name}</strong>.
                Please type <strong>{workspace.name}</strong> below to confirm.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-dark-3/60 border border-danger/30 text-sm text-light outline-none focus:border-danger transition mb-6"
                placeholder={workspace.name}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-dark-4 hover:bg-dark-5 text-light-2 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWorkspace}
                  disabled={deleteConfirmText !== workspace.name || deleting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-danger hover:bg-danger/90 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Delete</span>
                </button>
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
