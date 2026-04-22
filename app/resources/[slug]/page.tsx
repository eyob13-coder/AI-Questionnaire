import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import type { Metadata } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

interface ResourceArticle {
    slug: string;
    title: string;
    category: string;
    readTime: string;
    description: string;
    date: string;
    body: string;
}

async function getArticle(slug: string): Promise<ResourceArticle | null> {
    try {
        const res = await fetch(`${BACKEND_URL}/api/resources/${slug}`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        return (await res.json()) as ResourceArticle;
    } catch {
        return null;
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const article = await getArticle(slug);
    if (!article) return { title: "Article not found · Vaultix" };
    return {
        title: `${article.title} · Vaultix Resources`,
        description: article.description,
    };
}

function renderInline(text: string): string {
    return text.replace(
        /\*\*(.+?)\*\*/g,
        '<strong class="text-light font-semibold">$1</strong>',
    );
}

function renderBody(body: string) {
    const blocks: React.ReactNode[] = [];
    const lines = body.split("\n");
    let para: string[] = [];
    let list: string[] = [];

    const flushPara = () => {
        if (para.length) {
            blocks.push(
                <p
                    key={`p-${blocks.length}`}
                    className="text-light-2 leading-relaxed mb-5"
                    dangerouslySetInnerHTML={{ __html: renderInline(para.join(" ")) }}
                />,
            );
            para = [];
        }
    };
    const flushList = () => {
        if (list.length) {
            blocks.push(
                <ul
                    key={`ul-${blocks.length}`}
                    className="list-disc list-outside ml-5 space-y-2 text-light-2 mb-5"
                >
                    {list.map((item, i) => (
                        <li
                            key={i}
                            dangerouslySetInnerHTML={{ __html: renderInline(item) }}
                        />
                    ))}
                </ul>,
            );
            list = [];
        }
    };

    for (const raw of lines) {
        const line = raw.trim();
        if (line.startsWith("## ")) {
            flushPara();
            flushList();
            blocks.push(
                <h2
                    key={`h-${blocks.length}`}
                    className="font-heading text-xl sm:text-2xl font-bold text-light mt-10 mb-4"
                >
                    {line.slice(3)}
                </h2>,
            );
        } else if (/^[-*]\s/.test(line)) {
            flushPara();
            list.push(line.replace(/^[-*]\s+/, ""));
        } else if (/^\d+\.\s/.test(line)) {
            flushPara();
            list.push(line.replace(/^\d+\.\s+/, ""));
        } else if (line === "") {
            flushPara();
            flushList();
        } else {
            flushList();
            para.push(line);
        }
    }
    flushPara();
    flushList();

    return blocks;
}

export default async function ArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const article = await getArticle(slug);
    if (!article) notFound();

    return (
        <main className="min-h-screen bg-dark-2 text-light">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <Link
                    href="/#resources"
                    className="inline-flex items-center gap-1.5 text-sm text-light-3 hover:text-light mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to resources
                </Link>

                <div className="mb-8">
                    <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
                        <span className="font-semibold px-2.5 py-1 rounded-full border bg-brand/10 text-brand border-brand/20">
                            {article.category}
                        </span>
                        <span className="flex items-center gap-1 text-light-4">
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                        </span>
                        <span className="text-light-4">{article.date}</span>
                    </div>
                    <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-5">
                        {article.title}
                    </h1>
                    <p className="text-lg text-light-2 leading-relaxed">
                        {article.description}
                    </p>
                </div>

                <div className="border-t border-white/[0.08] pt-8">
                    <article className="prose prose-invert max-w-none">
                        {renderBody(article.body)}
                    </article>
                </div>

                <div className="mt-16 pt-8 border-t border-white/[0.08] text-center">
                    <p className="text-sm text-light-3 mb-4">
                        Want to put these ideas into practice?
                    </p>
                    <Link
                        href="/sign-up"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-full transition-all"
                    >
                        Start your free trial
                    </Link>
                </div>
            </div>
        </main>
    );
}
