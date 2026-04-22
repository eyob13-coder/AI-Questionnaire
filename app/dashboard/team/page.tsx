"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { UserPlus, Trash2, Mail, Crown, Eye, Pencil, Search } from "lucide-react";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { formatDate, initialsFromName } from "@/lib/format";
import {
  WorkspaceGate,
  PageError,
  PageLoading,
} from "@/components/dashboard/workspace-state";

type Role = "OWNER" | "EDITOR" | "VIEWER";

interface Member {
  id: string;
  role: Role;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    avatarUrl: string | null;
  };
}

const roleConfig: Record<Role, { label: string; class: string; Icon: typeof Crown }> = {
  OWNER: { label: "Owner", class: "bg-brand/10 text-brand", Icon: Crown },
  EDITOR: { label: "Editor", class: "bg-info/10 text-info", Icon: Pencil },
  VIEWER: { label: "Viewer", class: "bg-light-4/10 text-light-3", Icon: Eye },
};

function TeamContent({
  workspaceId,
  initialSearch,
}: {
  workspaceId: string;
  initialSearch: string;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("EDITOR");
  const [inviting, setInviting] = useState(false);
  const [search, setSearch] = useState(initialSearch);

  const fetchMembers = useCallback(
    () => apiGet<Member[]>(`/workspaces/${workspaceId}/members`),
    [workspaceId],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await fetchMembers();
        if (!cancelled) {
          setMembers(list);
          setError(null);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "Failed to load members");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchMembers]);

  const reload = useCallback(async () => {
    setLoading(true);

    try {
      const list = await fetchMembers();
      setMembers(list);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setInviting(true);

    try {
      await apiPost(`/workspaces/${workspaceId}/members`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      setInviteEmail("");
      await reload();
    } catch (nextError) {
      const responseError = nextError as { response?: { data?: { message?: string } } };
      alert(responseError.response?.data?.message || "Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Remove this member from the workspace?")) return;

    try {
      await apiDelete(`/workspaces/${workspaceId}/members/${memberId}`);
      setMembers((current) => current.filter((member) => member.id !== memberId));
    } catch (nextError) {
      const responseError = nextError as { response?: { data?: { message?: string } } };
      alert(responseError.response?.data?.message || "Failed to remove member");
    }
  };

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} />;

  const normalizedSearch = search.trim().toLowerCase();
  const filteredMembers = members.filter((member) => {
    if (!normalizedSearch) return true;

    const displayName = member.user.name || member.user.email;
    const roleLabel = roleConfig[member.role]?.label || member.role;

    return [displayName, member.user.email, roleLabel].some((value) =>
      value.toLowerCase().includes(normalizedSearch),
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold">Team & Roles</h2>
        <p className="text-sm text-light-3 mt-1">
          Manage workspace members and their permissions.
        </p>
      </motion.div>

      <div className="rounded-2xl border border-white/[0.06] bg-dark-3/30 p-6">
        <h3 className="font-heading text-base font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-brand" />
          Invite Member
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-dark-4/50 border border-white/[0.06] flex-1">
            <Mail className="w-4 h-4 text-light-3" />
            <input
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              className="bg-transparent text-sm text-light placeholder-light-3 outline-none w-full"
            />
          </div>

          <select
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value as Role)}
            className="px-3 py-2.5 rounded-xl bg-dark-4/50 border border-white/[0.06] text-sm text-light outline-none cursor-pointer"
          >
            <option value="EDITOR">Editor</option>
            <option value="VIEWER">Viewer</option>
          </select>

          <button
            type="button"
            onClick={handleInvite}
            disabled={inviting || !inviteEmail.trim()}
            className="px-5 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full transition-all"
          >
            {inviting ? "Inviting..." : "Send Invite"}
          </button>
        </div>

        <p className="text-xs text-light-4 mt-3">
          The user must already have a Vaultix account.
        </p>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-3/50 border border-white/[0.06] max-w-md">
        <Search className="w-4 h-4 text-light-3" />
        <input
          type="text"
          placeholder="Search team members..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="bg-transparent text-sm text-light placeholder-light-3 outline-none w-full"
        />
      </div>

      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-3 bg-dark-3/50 border-b border-white/[0.06] text-xs font-semibold text-light-3 uppercase tracking-wider">
          {search
            ? `${filteredMembers.length} matching member${filteredMembers.length === 1 ? "" : "s"}`
            : `${members.length} member${members.length === 1 ? "" : "s"}`}
        </div>

        {filteredMembers.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-light-3">
            {members.length === 0
              ? "No members yet. Invite teammates to start collaborating."
              : `No members match "${search}".`}
          </div>
        ) : (
          filteredMembers.map((member) => {
            const config = roleConfig[member.role];
            const displayName = member.user.name || member.user.email;

            return (
              <div
                key={member.id}
                className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 flex items-center justify-center text-sm font-bold text-brand shrink-0">
                  {initialsFromName(displayName)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-light">{displayName}</p>
                  <p className="text-xs text-light-3">{member.user.email}</p>
                </div>

                <span
                  className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${config.class}`}
                >
                  <config.Icon className="w-3 h-3" />
                  {config.label}
                </span>

                <span className="hidden md:block text-xs text-light-4">
                  {formatDate(member.joinedAt)}
                </span>

                {member.role !== "OWNER" && (
                  <button
                    type="button"
                    onClick={() => handleRemove(member.id)}
                    className="p-1.5 text-light-4 hover:text-danger rounded-lg hover:bg-white/[0.04] transition"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function TeamPageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search")?.trim() ?? "";

  return (
    <WorkspaceGate>
      {(workspaceId) => (
        <TeamContent
          key={`${workspaceId}:${initialSearch}`}
          workspaceId={workspaceId}
          initialSearch={initialSearch}
        />
      )}
    </WorkspaceGate>
  );
}

export default function TeamPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <TeamPageContent />
    </Suspense>
  );
}
