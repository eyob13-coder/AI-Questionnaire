"use client";

import React, { useState } from "react";
import {
  Code2,
  Server,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  Layers,
  Cloud,
} from "lucide-react";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";

interface TechSyncModalProps {
  open: boolean;
  workspaceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function TechSyncModal({
  open,
  workspaceId,
  onClose,
  onSuccess,
}: TechSyncModalProps) {
  const [activeTab, setActiveTab] = useState<"package" | "docker" | "prisma" | "cloud">("package");
  const [syncing, setSyncing] = useState(false);
  const [extractedFacts, setExtractedFacts] = useState<Array<{ category: string; topic: string; fact: string; evidence: string }> | null>(null);

  // Form states
  const [pkgJson, setPkgJson] = useState(`{
  "name": "enterprise-app",
  "dependencies": {
    "better-auth": "^1.6.5",
    "@prisma/client": "^7.7.0",
    "pg": "^8.20.0",
    "bcrypt": "^6.0.0",
    "bullmq": "^5.75.2",
    "ioredis": "^5.10.1",
    "next": "16.2.4",
    "@nestjs/core": "^11.0.1"
  }
}`);

  const [dockerfile, setDockerfile] = useState(`FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]`);

  const [prismaSchema, setPrismaSchema] = useState(`datasource db {
  provider = "postgresql"
  extensions = [vector]
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  role      Role     @default(VIEWER)
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String
  userId    String
  createdAt DateTime @default(now())
}`);

  const [cloudProvider, setCloudProvider] = useState("AWS (us-east-1)");
  const [encryptionAtRest, setEncryptionAtRest] = useState("AES-256 managed via AWS KMS with automatic annual key rotation");
  const [encryptionInTransit, setEncryptionInTransit] = useState("TLS 1.3 enforced on CloudFront edge CDN and Application Load Balancer");

  if (!open) return null;

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await apiPost<{
        success: boolean;
        factsCount: number;
        chunkCount: number;
        facts: Array<{ category: string; topic: string; fact: string; evidence: string }>;
      }>(`/workspaces/${workspaceId}/knowledge/tech-sync`, {
        packageJson: pkgJson,
        dockerfile,
        prismaSchema,
        cloudConfig: {
          cloudProvider,
          encryptionAtRest,
          encryptionInTransit,
        },
      });

      setExtractedFacts(res.facts);
      toast.success("Live Technical Spec Synced!", {
        description: `Extracted ${res.factsCount} technical facts into ${res.chunkCount} knowledge chunks.`,
      });
      onSuccess();
    } catch (err) {
      toast.error("Technical Sync Failed", {
        description: err instanceof Error ? err.message : "Could not parse manifests",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-3xl border border-white/[0.12] bg-dark-2/95 shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-light">Live Technical Sync</h3>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand/15 text-brand font-semibold">
                  Zero Hallucinations
                </span>
              </div>
              <p className="text-xs text-light-3 mt-0.5">
                Auto-extract real technical facts from your dependencies, Dockerfile, and database schemas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-light-4 hover:text-white rounded-lg hover:bg-white/[0.06] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {extractedFacts ? (
            /* Results Screen */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-emerald-300">
                    Live Technical Architecture Card Created
                  </h4>
                  <p className="text-xs text-emerald-400/80 mt-0.5">
                    {extractedFacts.length} verified facts were chunked and indexed into your workspace knowledge vault. AI answers will now cite these exact technical specs.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {extractedFacts.map((fact, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-white/[0.06] bg-dark-3/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand font-medium">{fact.category}</span>
                      <span className="text-light-3 font-mono">{fact.topic}</span>
                    </div>
                    <p className="text-xs text-light font-medium">{fact.fact}</p>
                    <p className="text-[11px] font-mono text-light-4 bg-black/30 px-2 py-1 rounded inline-block">
                      Evidence: {fact.evidence}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setExtractedFacts(null);
                    onClose();
                  }}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-full transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Input Tabs & Form */
            <>
              {/* Tab selector */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("package")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeTab === "package"
                      ? "bg-brand/15 text-brand border border-brand/30"
                      : "text-light-3 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  package.json
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("docker")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeTab === "docker"
                      ? "bg-brand/15 text-brand border border-brand/30"
                      : "text-light-3 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Server className="w-3.5 h-3.5" />
                  Dockerfile
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("prisma")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeTab === "prisma"
                      ? "bg-brand/15 text-brand border border-brand/30"
                      : "text-light-3 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  schema.prisma
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("cloud")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeTab === "cloud"
                      ? "bg-brand/15 text-brand border border-brand/30"
                      : "text-light-3 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  Cloud &amp; Crypto
                </button>
              </div>

              {activeTab === "package" && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-light-2">
                    Paste package.json (extracts auth, DB clients, crypto, and session libraries):
                  </label>
                  <textarea
                    rows={8}
                    value={pkgJson}
                    onChange={(e) => setPkgJson(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/[0.08] p-3 text-xs font-mono text-light-2 focus:outline-none focus:border-brand/40 resize-none"
                  />
                </div>
              )}

              {activeTab === "docker" && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-light-2">
                    Paste Dockerfile (verifies container hardening and non-root users):
                  </label>
                  <textarea
                    rows={8}
                    value={dockerfile}
                    onChange={(e) => setDockerfile(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/[0.08] p-3 text-xs font-mono text-light-2 focus:outline-none focus:border-brand/40 resize-none"
                  />
                </div>
              )}

              {activeTab === "prisma" && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-light-2">
                    Paste prisma/schema.prisma (verifies database engine, pgvector, and audit logs):
                  </label>
                  <textarea
                    rows={8}
                    value={prismaSchema}
                    onChange={(e) => setPrismaSchema(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/[0.08] p-3 text-xs font-mono text-light-2 focus:outline-none focus:border-brand/40 resize-none"
                  />
                </div>
              )}

              {activeTab === "cloud" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-light-2">Cloud Provider &amp; Region</label>
                    <input
                      type="text"
                      value={cloudProvider}
                      onChange={(e) => setCloudProvider(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-black/40 border border-white/[0.08] p-2.5 text-xs text-light focus:outline-none focus:border-brand/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-light-2">Encryption at Rest Specification</label>
                    <input
                      type="text"
                      value={encryptionAtRest}
                      onChange={(e) => setEncryptionAtRest(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-black/40 border border-white/[0.08] p-2.5 text-xs text-light focus:outline-none focus:border-brand/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-light-2">Encryption in Transit Specification</label>
                    <input
                      type="text"
                      value={encryptionInTransit}
                      onChange={(e) => setEncryptionInTransit(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-black/40 border border-white/[0.08] p-2.5 text-xs text-light focus:outline-none focus:border-brand/40"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!extractedFacts && (
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-[11px] text-light-4 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              Auto-extracts SOC 2 technical facts
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-light-3 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={syncing}
                onClick={handleSync}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover disabled:opacity-50 rounded-full transition shadow-md shadow-brand/20 cursor-pointer"
              >
                {syncing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {syncing ? "Analyzing & Indexing..." : "Sync to Knowledge Vault"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
