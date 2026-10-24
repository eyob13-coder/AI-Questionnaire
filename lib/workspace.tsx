"use client";

import {
    createContext,
    useContext,
    useEffect,
    useCallback,
    useState,
    type ReactNode,
} from "react";
import { useWorkspaceStore } from "@/lib/store/workspace-store";

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    plan: "FREE" | "TRIAL" | "STARTER" | "PRO" | "ENTERPRISE" | string;
    subscriptionStatus?: string | null;
    polarSubscriptionId?: string | null;
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

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            const list = await useWorkspaceStore.getState().fetchWorkspaces();
            setWorkspaces(list as unknown as Workspace[]);
            const currentActive = useWorkspaceStore.getState().activeWorkspaceId;
            setActiveId(currentActive);
        } catch (err: unknown) {
            const e = err as { response?: { status?: number }; message?: string };
            if (e?.response?.status !== 401) {
                setError(e?.message || "Failed to load workspaces");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            if (isMounted) {
                await load();
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [load]);

    const setActiveWorkspace = (id: string) => {
        setActiveId(id);
        useWorkspaceStore.getState().setActiveWorkspaceId(id);
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
