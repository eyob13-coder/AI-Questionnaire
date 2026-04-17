"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Users, UserPlus, Shield, Edit3, Trash2, Mail, Crown, Eye, Pencil } from "lucide-react";

type Role = "owner" | "editor" | "viewer";

const members = [
  { id: "1", name: "John Doe", email: "john@company.com", role: "owner" as Role, avatar: "JD", joined: "Mar 1, 2026" },
  { id: "2", name: "Sarah Miller", email: "sarah@company.com", role: "editor" as Role, avatar: "SM", joined: "Mar 15, 2026" },
  { id: "3", name: "Mike Rodriguez", email: "mike@company.com", role: "editor" as Role, avatar: "MR", joined: "Apr 2, 2026" },
  { id: "4", name: "Lisa Chen", email: "lisa@company.com", role: "viewer" as Role, avatar: "LC", joined: "Apr 10, 2026" },
];

const roleConfig: Record<Role, { label: string; class: string; icon: React.ElementType }> = {
  owner: { label: "Owner", class: "bg-brand/10 text-brand", icon: Crown },
  editor: { label: "Editor", class: "bg-info/10 text-info", icon: Pencil },
  viewer: { label: "Viewer", class: "bg-light-4/10 text-light-3", icon: Eye },
};

export default function TeamPage() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("editor");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold">Team & Roles</h2>
        <p className="text-sm text-light-3 mt-1">Manage workspace members and their permissions.</p>
      </motion.div>

      {/* Invite */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/[0.06] bg-dark-3/30 p-6"
      >
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
              onChange={(e) => setInviteEmail(e.target.value)}
              className="bg-transparent text-sm text-light placeholder-light-3 outline-none w-full"
            />
          </div>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as Role)}
            className="px-3 py-2.5 rounded-xl bg-dark-4/50 border border-white/[0.06] text-sm text-light outline-none cursor-pointer"
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-full transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            Send Invite
          </button>
        </div>
      </motion.div>

      {/* Members */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="px-5 py-3 bg-dark-3/50 border-b border-white/[0.06] text-xs font-semibold text-light-3 uppercase tracking-wider">
          {members.length} Members
        </div>
        {members.map((m) => {
          const cfg = roleConfig[m.role];
          const RoleIcon = cfg.icon;
          return (
            <div key={m.id} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 flex items-center justify-center text-sm font-bold text-brand shrink-0">
                {m.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-light">{m.name}</p>
                <p className="text-xs text-light-3">{m.email}</p>
              </div>
              <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.class}`}>
                <RoleIcon className="w-3 h-3" />
                {cfg.label}
              </span>
              <span className="hidden md:block text-xs text-light-4">{m.joined}</span>
              {m.role !== "owner" && (
                <button className="p-1.5 text-light-4 hover:text-danger rounded-lg hover:bg-white/[0.04] transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
