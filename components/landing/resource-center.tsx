"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ArrowUpRight,
  Search,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import { fadeUp } from "./landing-animations";
import { resourcePosts } from "./resource-data";
import { ResourceNewsletter } from "./resource-newsletter";

export function ResourceCenter() {
  const allCategories = ["All", "Playbook", "Guide", "Research", "Template", "Case Study"] as const;
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = resourcePosts.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = filtered.filter((p) => p !== featured);

  const categoryColors: Record<string, string> = {
    Playbook: "bg-brand/10 text-brand border-brand/20",
    Guide: "bg-info/10 text-info border-info/20",
    Research: "bg-success/10 text-success border-success/20",
    Template: "bg-warning/10 text-warning border-warning/20",
    "Case Study": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <section id="resources" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dark-2" />
      <div className="absolute inset-0 bg-dots opacity-[0.12]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-brand/[0.03] blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div {...fadeUp} className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <span className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                Resource Center
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Learn what top
                <span className="text-gradient-brand"> security teams do differently</span>
              </h2>
              <p className="mt-3 text-light-2 text-lg max-w-xl">
                Playbooks, guides, and research for security teams that want to move faster without cutting corners.
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-light transition-colors shrink-0 group"
            >
              View all resources
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Filters + Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-brand text-white border-brand shadow-lg shadow-brand/20"
                      : "bg-dark-4/60 border-white/[0.08] text-light-3 hover:border-white/[0.16] hover:text-light"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative sm:ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-4" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-dark-4/60 border border-white/[0.08] rounded-lg text-light placeholder:text-light-4 focus:outline-none focus:border-brand/40 transition-colors w-full sm:w-56"
              />
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-light-4"
            >
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No resources match your search.</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeCategory + searchQuery}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {featured && (
                <Link
                  href={`/resources/${featured.slug}`}
                  className="group block rounded-2xl border border-white/[0.08] bg-dark-3/50 overflow-hidden mb-5 hover:border-brand/30 transition-all duration-300"
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${featured.gradient}`} />
                  <div className="p-7 sm:p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryColors[featured.category] ?? "bg-dark-5 text-light-3 border-white/10"}`}>
                          {featured.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-light-4">
                          <Clock className="w-3 h-3" />
                          {featured.readTime}
                        </span>
                        <span className="text-xs text-light-4">{featured.date}</span>
                        <span className="text-xs bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 rounded-full font-semibold">Featured</span>
                      </div>
                      <h3 className="font-heading text-xl sm:text-2xl font-bold text-light group-hover:text-brand-light transition-colors leading-snug mb-3">
                        {featured.title}
                      </h3>
                      <p className="text-light-2 text-sm leading-relaxed max-w-2xl">{featured.description}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-brand font-medium">
                        Read article
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                    <div className="hidden md:flex w-32 h-32 rounded-xl bg-gradient-to-br from-dark-4 to-dark-5 border border-white/[0.06] items-center justify-center shrink-0">
                      <BookOpen className="w-10 h-10 text-light-4 opacity-40" />
                    </div>
                  </div>
                </Link>
              )}

              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rest.map((post) => (
                    <Link
                      key={post.title}
                      href={`/resources/${post.slug}`}
                      className="group rounded-2xl border border-white/[0.07] bg-dark-3/40 overflow-hidden hover:border-brand/25 hover:bg-dark-3/60 transition-all duration-300 flex flex-col"
                    >
                      <div className={`h-1 w-full bg-gradient-to-r ${post.gradient} opacity-70`} />
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${categoryColors[post.category] ?? "bg-dark-5 text-light-3 border-white/10"}`}>
                            {post.category}
                          </span>
                          <span className="text-xs text-light-4 ml-auto">{post.date}</span>
                        </div>
                        <p className="text-sm font-semibold text-light leading-snug group-hover:text-brand-light transition-colors mb-2 flex-1">
                          {post.title}
                        </p>
                        <p className="text-xs text-light-3 leading-relaxed line-clamp-2 mb-4">
                          {post.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.04]">
                          <span className="flex items-center gap-1 text-xs text-light-4">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-brand font-medium">
                            Read
                            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Newsletter CTA */}
        <ResourceNewsletter />
      </div>
    </section>
  );
}
