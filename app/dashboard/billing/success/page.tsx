import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function BillingSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id } = await searchParams;

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <div className="rounded-2xl border border-brand/30 bg-dark-3/40 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand/15">
          <CheckCircle2 className="h-6 w-6 text-brand" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2">
          Payment successful
        </h1>
        <p className="text-sm text-light-3 mb-6">
          Thanks for upgrading. Your subscription is now active. It can take a
          minute for the new plan to appear in your workspace.
        </p>
        {session_id && (
          <p className="text-xs text-light-3 mb-6 break-all">
            Reference: <span className="font-mono">{session_id}</span>
          </p>
        )}
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
        >
          Back to billing
        </Link>
      </div>
    </div>
  );
}
