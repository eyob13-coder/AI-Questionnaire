"use client";

import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon, byPrefixAndName } from "@/lib/fontawesome";
import { useWorkspace } from "@/lib/workspace";
import { useSession } from "@/lib/auth-client";
import { useAuthStore, useWorkspaceStore } from "@/lib/store";
import { toast } from "sonner";

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export default function WorkspaceSwitcher({ collapsed = false }: WorkspaceSwitcherProps) {
  const { workspace, workspaces, setActiveWorkspace, refresh } = useWorkspace();
  const createWorkspaceAction = useWorkspaceStore((s) => s.createWorkspace);
  const { data: sessionData } = useSession();
  const authStoreUser = useAuthStore((s) => s.user);
  const user = authStoreUser || sessionData?.user;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
        setIsCreating(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    try {
      const res = await createWorkspaceAction(newClientName.trim());
      if (!res.success || !res.workspace) {
        throw new Error(res.error || "Failed to create workspace");
      }
      toast.success("Workspace Created", {
        description: `Switched to ${res.workspace.name}`,
      });
      await refresh();
      setActiveWorkspace(res.workspace.id);
      setNewClientName("");
      setIsCreating(false);
      setOpen(false);
    } catch (err) {
      toast.error("Could not create workspace", {
        description: err instanceof Error ? err.message : "Request failed",
      });
    }
  };

  const filteredWorkspaces = workspaces.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()),
  );

  const currentInitial = workspace?.name?.charAt(0).toUpperCase() || "W";
  const displayName = user?.name?.trim() || workspace?.name || "Account";

  return (
    <div className={`relative ${collapsed ? "flex justify-center" : "px-1"}`} ref={dropdownRef}>
      {/* Trigger Button — Borderless, subtle Apple/Linear surface highlight */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center rounded-xl transition-all text-left group cursor-pointer ${
          collapsed
            ? "w-10 h-10 justify-center p-0 hover:bg-white/[0.06] active:bg-white/[0.1]"
            : "w-full gap-2.5 px-2.5 py-2 hover:bg-white/[0.05] active:bg-white/[0.08]"
        }`}
        title={collapsed ? workspace?.name || "Workspaces" : undefined}
      >
        {/* User Image Avatar with Status Dot */}
        <div className="relative shrink-0">
          {user?.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 shadow-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand/25 to-brand/10 text-brand font-bold text-xs flex items-center justify-center ring-1 ring-brand/20">
              {currentInitial}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-dark-2" />
        </div>

        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-light truncate block group-hover:text-white transition-colors">
                {workspace?.name || "Select Workspace"}
              </span>
              <span className="text-[11px] text-light-4 flex items-center gap-1.5 font-normal truncate mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand/70 shrink-0" />
                {workspaces.length > 1 ? `${workspaces.length} client vaults` : "Active Vault"}
              </span>
            </div>
            <FontAwesomeIcon
              icon={byPrefixAndName.fans["sort"]}
              className="w-3 h-3 text-light-4/70 group-hover:text-light-3 transition-colors shrink-0"
            />
          </>
        )}
      </button>

      {/* Floating Dropdown Menu — Borderless with delicate ring & blur */}
      {open && (
        <div
          className={`absolute z-50 mt-1.5 rounded-2xl bg-dark-2/95 backdrop-blur-2xl p-2 shadow-2xl shadow-black/50 ring-1 ring-white/[0.08] animate-fade-in ${
            collapsed ? "left-full ml-2 w-64 -top-2" : "left-0 right-0 w-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2.5 py-1.5 mb-1.5 border-b border-white/[0.05]">
            <span className="text-[11px] font-medium text-light-3">
              Workspaces
            </span>
            <span className="text-[10px] font-medium text-brand/90 px-1.5 py-0.5 rounded-md bg-brand/10">
              Isolated
            </span>
          </div>

          {/* Search bar */}
          {workspaces.length > 3 && (
            <div className="relative mb-1.5 px-1">
              <FontAwesomeIcon
                icon={byPrefixAndName.fans["magnifying-glass"]}
                className="w-3 h-3 text-light-4 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.04] rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-light placeholder:text-light-4 focus:outline-none focus:ring-1 focus:ring-brand/40"
              />
            </div>
          )}

          {/* Workspaces list */}
          <div className="space-y-0.5 max-h-52 overflow-y-auto px-0.5">
            {filteredWorkspaces.map((w) => {
              const active = w.id === workspace?.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    setActiveWorkspace(w.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    active
                      ? "bg-brand/15 text-brand font-semibold"
                      : "text-light-2 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        active ? "bg-brand text-white" : "bg-white/[0.06] text-light-3"
                      }`}
                    >
                      {w.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{w.name}</span>
                  </div>
                  {active && (
                    <FontAwesomeIcon icon={byPrefixAndName.fans["check"]} className="w-3 h-3 text-brand shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Add Client Trigger / Form */}
          <div className="mt-1.5 pt-1.5 border-t border-white/[0.05]">
            {!isCreating ? (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-brand hover:bg-brand/10 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={byPrefixAndName.fans["plus"]} className="w-3 h-3" />
                Add Workspace
              </button>
            ) : (
              <form onSubmit={handleCreateClient} className="space-y-1.5 p-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Workspace name..."
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-white/[0.04] rounded-lg px-2.5 py-1.5 text-xs text-light placeholder:text-light-4 focus:outline-none focus:ring-1 focus:ring-brand/40"
                />
                <div className="flex items-center gap-1.5 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-2.5 py-1 text-[11px] text-light-4 hover:text-light transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-brand text-white text-[11px] font-semibold rounded-md hover:bg-brand-hover transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
