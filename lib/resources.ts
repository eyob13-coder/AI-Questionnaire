import { apiGet, apiPost } from "./api";

export interface ResourceArticle {
    slug: string;
    title: string;
    category: string;
    readTime: string;
    description: string;
    featured: boolean;
    date: string;
    gradient: string;
    body?: string;
}

export async function fetchResources(): Promise<ResourceArticle[]> {
    return apiGet<ResourceArticle[]>("/resources");
}

export async function fetchResource(slug: string): Promise<ResourceArticle> {
    return apiGet<ResourceArticle>(`/resources/${slug}`);
}

export async function subscribeNewsletter(
    email: string,
    source = "landing",
): Promise<{ ok: true }> {
    return apiPost<{ ok: true }>("/resources/subscribe", { email, source });
}
