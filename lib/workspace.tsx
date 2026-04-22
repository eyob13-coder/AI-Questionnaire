"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { apiGet, apiPost } from "./api";

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    plan: "TRIAL" | "STARTER" | "PRO" | "ENTERPRISE";
    trialEndsAt: string | null;
    createdAt: string;
    updatedAt: string;
    myRole?: "OWNER" | "EDITOR" | "VIEWER";
}

interface WorkspaceContextValue {
    workspace: Workspace | null;
    workspaces: Workspace[];
    isLoading: boolean;
    error: string | null;
    setActiveWorkspace: (id: string) => void;
    refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
    undefined,
);

const STORAGE_KEY = "vaultix.activeWorkspaceId";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const list = await apiGet<Workspace[]>("/workspaces");
            const resolvedList =
                list.length > 0
                    ? list
                    : [await apiPost<Workspace>("/workspaces/bootstrap")];

            setWorkspaces(resolvedList);

            const stored =
                typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
            const initial =
                resolvedList.find((w) => w.id === stored)?.id || resolvedList[0]?.id || null;
            setActiveId(initial);
            if (initial && typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY, initial);
            }
        } catch (err: unknown) {
            const e = err as { response?: { status?: number }; message?: string };
            if (e?.response?.status !== 401) {
                setError(e?.message || "Failed to load workspaces");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const list = await apiGet<Workspace[]>("/workspaces");
                const resolvedList =
                    list.length > 0
                        ? list
                        : [await apiPost<Workspace>("/workspaces/bootstrap")];

                if (cancelled) return;

                setWorkspaces(resolvedList);

                const stored =
                    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
                const initial =
                    resolvedList.find((w) => w.id === stored)?.id || resolvedList[0]?.id || null;
                setActiveId(initial);
                if (initial && typeof window !== "undefined") {
                    localStorage.setItem(STORAGE_KEY, initial);
                }
            } catch (err: unknown) {
                const e = err as { response?: { status?: number }; message?: string };
                if (!cancelled && e?.response?.status !== 401) {
                    setError(e?.message || "Failed to load workspaces");
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const setActiveWorkspace = (id: string) => {
        setActiveId(id);
        if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
    };

    const workspace = workspaces.find((w) => w.id === activeId) || null;

    return (
        <WorkspaceContext.Provider
            value={{
                workspace,
                workspaces,
                isLoading,
                error,
                setActiveWorkspace,
                refresh: load,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace(): WorkspaceContextValue {
    const ctx = useContext(WorkspaceContext);
    if (!ctx) {
        throw new Error("useWorkspace must be used within <WorkspaceProvider>");
    }
    return ctx;
}
