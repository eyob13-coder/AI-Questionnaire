import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog | Vaultix",
  description: "Best practices for security questionnaires, trust workflows, and compliance operations.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

const posts = [
  {
    title: "How to cut security questionnaire turnaround by 60%",
    href: "/blog",
    meta: "Playbook · 6 min",
  },
  {
    title: "A practical checklist for citation-backed AI answers",
    href: "/blog",
    meta: "Guide · 8 min",
  },
  {
    title: "Metrics security leaders should track in review cycles",
    href: "/blog",
    meta: "Research · 5 min",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-dark text-light">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="font-heading text-4xl font-bold mb-10">Vaultix Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {posts.map((post) => (
            <Link key={post.title} href={post.href} className="rounded-2xl border border-white/[0.08] bg-dark-2/60 p-6 hover:border-brand/30 transition-colors">
              <p className="text-xs text-light-4 mb-3">{post.meta}</p>
              <p className="text-light font-semibold leading-relaxed">{post.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

