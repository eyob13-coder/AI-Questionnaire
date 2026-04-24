"use client";

import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";
import { useWorkspace } from "@/lib/workspace";
import { VaultixLoader } from "@/components/ui/vaultix-loader";

interface WorkspaceGateProps {
    children: (workspaceId: string) => ReactNode;
}

/**
 * Common gate that resolves the user's active workspace before rendering a
 * dashboard page. Shows a spinner while loading, an error if no workspace
 * exists, and otherwise calls the render-prop with the workspace id.
 */
export function WorkspaceGate({ children }: WorkspaceGateProps) {
    const { workspace, isLoading, error } = useWorkspace();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
                <VaultixLoader className="w-16 h-16" />
                <span className="text-sm font-medium text-light-3 animate-pulse tracking-wide uppercase">
                    Initializing Workspace...
                </span>
            </div>
        );
    }

    if (error || !workspace) {
        return (
            <div className="max-w-xl mx-auto rounded-2xl border border-warning/20 bg-warning/[0.04] p-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-warning">
                        No workspace available
                    </p>
                    <p className="text-xs text-light-3 mt-1">
                        {error ||
                            "Sign in and create a workspace to start using Vaultix."}
                    </p>
                </div>
            </div>
        );
    }

    return <>{children(workspace.id)}</>;
}

export function PageError({ message }: { message: string }) {
    return (
        <div className="rounded-xl border border-danger/20 bg-danger/[0.04] p-4 text-sm text-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {message}
        </div>
    );
}

export function PageLoading() {
    return (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <VaultixLoader className="w-16 h-16" />
            <span className="text-sm font-medium text-light-3 animate-pulse tracking-wide uppercase">
                Loading...
            </span>
        </div>
    );
}

export function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <p className="text-base font-semibold text-light mb-2">{title}</p>
            <p className="text-sm text-light-3 max-w-sm mb-5">{description}</p>
            {action}
        </div>
    );
}
