"use client";

import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";
import { useWorkspace } from "@/lib/workspace";

interface WorkspaceGateProps {
    children: (workspaceId: string) => ReactNode;
}

export function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`shimmer-skeleton rounded-xl ${className}`} />;
}

export function DashboardShimmer() {
    return (
        <div className="space-y-8 animate-fade-in w-full max-w-7xl mx-auto py-2">
            {/* Top Header Row Shimmer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                <div className="space-y-2">
                    <div className="h-7 w-48 sm:w-64 rounded-xl shimmer-skeleton" />
                    <div className="h-4 w-72 sm:w-96 rounded-lg shimmer-skeleton opacity-70" />
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="h-9 w-24 rounded-xl shimmer-skeleton" />
                    <div className="h-9 w-32 rounded-xl shimmer-skeleton" />
                </div>
            </div>

            {/* Metric / Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-white/[0.06] bg-dark-2/40 p-5 space-y-3 relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between">
                            <div className="h-3.5 w-24 rounded-md shimmer-skeleton opacity-70" />
                            <div className="w-7 h-7 rounded-lg shimmer-skeleton opacity-80" />
                        </div>
                        <div className="h-8 w-28 rounded-lg shimmer-skeleton" />
                        <div className="h-3 w-36 rounded-md shimmer-skeleton opacity-50" />
                    </div>
                ))}
            </div>

            {/* Main Content Area / Table Shimmer */}
            <div className="rounded-2xl border border-white/[0.06] bg-dark-2/40 p-5 sm:p-6 space-y-5">
                {/* Panel Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-36 rounded-lg shimmer-skeleton" />
                        <div className="h-5 w-12 rounded-full shimmer-skeleton opacity-60" />
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-48 sm:w-64 rounded-xl shimmer-skeleton" />
                        <div className="h-9 w-24 rounded-xl shimmer-skeleton" />
                    </div>
                </div>

                {/* Rows of Content Skeleton */}
                <div className="space-y-3">
                    {[0, 1, 2, 3, 4].map((idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] gap-4"
                        >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                <div className="w-9 h-9 rounded-xl shimmer-skeleton shrink-0" />
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div
                                        className={`h-4 rounded-md shimmer-skeleton ${
                                            idx % 2 === 0
                                                ? "w-48 sm:w-64"
                                                : "w-40 sm:w-56"
                                        }`}
                                    />
                                    <div className="h-3 w-32 sm:w-44 rounded-md shimmer-skeleton opacity-60" />
                                </div>
                            </div>

                            <div className="hidden sm:flex items-center gap-3">
                                <div className="h-6 w-20 rounded-full shimmer-skeleton opacity-70" />
                                <div className="h-3 w-16 rounded-md shimmer-skeleton opacity-50" />
                            </div>

                            <div className="w-8 h-8 rounded-lg shimmer-skeleton shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Common gate that resolves the user's active workspace before rendering a
 * dashboard page. Shows a shimmer skeleton while loading, an error if no workspace
 * exists, and otherwise calls the render-prop with the workspace id.
 */
export function WorkspaceGate({ children }: WorkspaceGateProps) {
    const { workspace, isLoading, error } = useWorkspace();

    if (isLoading) {
        return <DashboardShimmer />;
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
    return <DashboardShimmer />;
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
