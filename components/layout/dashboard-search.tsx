"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import {
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  AlertCircle,
  BookOpen,
  FileSpreadsheet,
  Loader2,
  ScrollText,
  Search,
  Users,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/format";
import {
  useDashboardSearch,
  type DashboardSearchResult,
  type DashboardSearchResultType,
} from "@/lib/use-dashboard-search";
import { useWorkspace } from "@/lib/workspace";

const resultConfig: Record<
  DashboardSearchResultType,
  {
    label: string;
    Icon: typeof Search;
    badgeClass: string;
  }
> = {
  questionnaire: {
    label: "Questionnaire",
    Icon: FileSpreadsheet,
    badgeClass: "text-brand bg-brand/10 border-brand/20",
  },
  document: {
    label: "Document",
    Icon: BookOpen,
    badgeClass: "text-success bg-success/10 border-success/20",
  },
  member: {
    label: "Member",
    Icon: Users,
    badgeClass: "text-info bg-info/10 border-info/20",
  },
  activity: {
    label: "Activity",
    Icon: ScrollText,
    badgeClass: "text-warning bg-warning/10 border-warning/20",
  },
};

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

export default function DashboardSearch() {
  const router = useRouter();
  const { workspace, isLoading: workspaceLoading, error: workspaceError } = useWorkspace();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [debouncedQuery] = useDebounce(query, 180);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = useId();

  const { results, suggestions, isLoading, error, totalIndexed } = useDashboardSearch(
    workspace?.id ?? null,
    debouncedQuery,
  );

  const trimmedQuery = query.trim();
  const debouncedTrimmedQuery = debouncedQuery.trim();
  const hasQuery = debouncedTrimmedQuery.length > 0;
  const disabled = workspaceLoading || Boolean(workspaceError) || !workspace;

  const visibleItems = useMemo(
    () => (hasQuery ? results : suggestions),
    [hasQuery, results, suggestions],
  );
  const selectedIndex =
    visibleItems.length === 0 ? -1 : Math.min(activeIndex, visibleItems.length - 1);
  const activeResult = selectedIndex >= 0 ? visibleItems[selectedIndex] : null;

  const focusInput = (shouldSelect = false) => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      if (shouldSelect) {
        inputRef.current?.select();
      }
    });
  };

  const closeSearch = () => {
    setOpen(false);
    setActiveIndex(0);
  };

  const openSearch = (shouldSelect = false) => {
    if (disabled) return;

    setOpen(true);
    focusInput(shouldSelect);
  };

  const handleSelect = (result: DashboardSearchResult) => {
    closeSearch();
    setQuery("");
    router.push(result.href);
  };

  const handleDocumentClick = useEffectEvent((event: MouseEvent) => {
    if (!containerRef.current) return;

    const target = event.target;
    if (target instanceof Node && !containerRef.current.contains(target)) {
      closeSearch();
    }
  });

  const handleGlobalShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") {
      return;
    }

    if (isEditableTarget(event.target) && document.activeElement !== inputRef.current) {
      return;
    }

    event.preventDefault();
    openSearch(true);
  });

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalShortcut);

    return () => {
      document.removeEventListener("keydown", handleGlobalShortcut);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [open]);

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && visibleItems.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (current + 1) % visibleItems.length);
      return;
    }

    if (event.key === "ArrowUp" && visibleItems.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (current - 1 + visibleItems.length) % visibleItems.length);
      return;
    }

    if (event.key === "Enter" && activeResult) {
      event.preventDefault();
      handleSelect(activeResult);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
      inputRef.current?.blur();
    }
  };

  const placeholder = disabled
    ? workspaceError
      ? "Search unavailable"
      : "Loading workspace search..."
    : "Search questionnaires, docs, members, and activity";

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] transition-colors w-72 lg:w-80">
        <Search className="w-4 h-4 text-light-3" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          role="combobox"
          aria-label="Search workspace"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeResult ? `${listboxId}-${activeResult.id}` : undefined
          }
          onFocus={() => {
            if (!disabled) {
              setOpen(true);
            }
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            if (!open && !disabled) {
              setOpen(true);
            }
          }}
          onKeyDown={handleInputKeyDown}
          className="bg-transparent text-sm text-light placeholder-light-3 outline-none w-full disabled:cursor-not-allowed"
        />
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-light-4 animate-spin" />
        ) : (
          <kbd className="hidden lg:inline-block text-[10px] text-light-4 bg-dark-4 px-1.5 py-0.5 rounded font-mono">
            Ctrl K
          </kbd>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+0.75rem)] w-[32rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/[0.08] bg-dark-2/95 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.35)] overflow-hidden z-50"
          >
            <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-white/[0.06]">
              <div>
                <p className="font-heading text-sm font-semibold text-light">Workspace search</p>
                <p className="text-xs text-light-4">
                  {hasQuery
                    ? `${visibleItems.length} match${visibleItems.length === 1 ? "" : "es"}`
                    : `${totalIndexed} indexed items`}
                </p>
              </div>
              <p className="text-[11px] text-light-4 text-right">
                Search across questionnaires, docs, team, and activity.
              </p>
            </div>

            {error && (
              <div className="mx-4 mt-4 rounded-xl border border-warning/20 bg-warning/10 px-3 py-2.5 text-xs text-warning flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="max-h-[28rem] overflow-y-auto p-2">
              {isLoading && visibleItems.length === 0 ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 animate-pulse"
                    >
                      <div className="h-3 w-2/3 rounded bg-white/[0.08]" />
                      <div className="h-3 w-full rounded bg-white/[0.05] mt-3" />
                      <div className="h-3 w-1/3 rounded bg-white/[0.05] mt-2" />
                    </div>
                  ))}
                </div>
              ) : visibleItems.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <Search className="w-5 h-5 text-light-4" />
                  </div>
                  <p className="text-sm font-medium text-light mt-4">
                    {trimmedQuery ? `No results for "${trimmedQuery}"` : "Nothing indexed yet"}
                  </p>
                  <p className="text-xs text-light-4 mt-1">
                    {trimmedQuery
                      ? "Try a document name, teammate email, or questionnaire title."
                      : "Upload a questionnaire or add knowledge documents to build your workspace search index."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleItems.map((item, index) => {
                    const config = resultConfig[item.type];
                    const Icon = config.Icon;
                    const isActive = index === selectedIndex;

                    return (
                      <button
                        key={item.id}
                        id={`${listboxId}-${item.id}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => handleSelect(item)}
                        className={clsx(
                          "w-full text-left flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors",
                          isActive
                            ? "border-brand/25 bg-brand/[0.08]"
                            : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]",
                        )}
                      >
                        <div
                          className={clsx(
                            "mt-0.5 flex w-10 h-10 shrink-0 items-center justify-center rounded-xl border",
                            config.badgeClass,
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-light truncate">{item.title}</p>
                              <p className="mt-1 text-xs leading-5 text-light-3 truncate">
                                {item.subtitle}
                              </p>
                            </div>
                            <span className="text-[11px] px-2 py-1 rounded-full border border-white/[0.08] text-light-4 whitespace-nowrap">
                              {config.label}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-[11px] text-light-4">
                            <span className="truncate">{item.meta}</span>
                            <span className="w-1 h-1 rounded-full bg-white/[0.16]" />
                            <span>{formatRelativeTime(item.createdAt)}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.06] px-4 py-3 flex items-center justify-between gap-3 text-[11px] text-light-4">
              <span>{hasQuery ? "Press Enter to open the highlighted result." : "Recent workspace items"}</span>
              <span>Use Up/Down to move</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
