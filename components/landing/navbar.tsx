"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("vaultix-theme") as "dark" | "light" | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("vaultix-theme", next);
  };

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Proof", href: "#proof" },
    { label: "Why Vaultix", href: "#why-vaultix" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 pointer-events-none transition-all duration-300 px-4 sm:px-6 pt-3 sm:pt-4">
      <header
        className={`pointer-events-auto mx-auto max-w-5xl rounded-full border transition-all duration-300 flex items-center justify-between gap-2 sm:gap-4 ${
          scrolled
            ? "bg-dark-2/90 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl py-2 px-3 sm:px-4"
            : "bg-dark-2/70 border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl py-2.5 px-4 sm:px-5"
        }`}
      >
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="relative w-8 h-8 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Image src="/logo.svg" alt="Vaultix" fill className="object-contain" priority />
          </div>
          <span className="font-heading text-lg font-bold tracking-tight">
            Vault<span className="text-brand">ix</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-light-3 transition-colors hover:bg-white/[0.06] hover:text-light"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Utility Cluster */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <span aria-hidden className="h-4 w-px bg-white/10 mx-1 shrink-0" />

          {/* Theme toggle */}
          {mounted && <ThemeToggle theme={theme} onToggle={toggleTheme} />}

          {mounted && session ? (
            <Link
              href="/dashboard"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-full transition-all duration-200 shadow-md shadow-brand/20 hover:shadow-brand/35 active:scale-95"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-medium text-light-3 hover:text-light transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-full transition-all duration-200 shadow-md shadow-brand/20 hover:shadow-brand/35 active:scale-95"
              >
                Start Free Trial
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-1.5 shrink-0">
          {mounted && <ThemeToggle theme={theme} onToggle={toggleTheme} />}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            className="p-1.5 text-light-2 hover:text-light rounded-full hover:bg-white/[0.06] transition-colors"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Card Dropdown) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-auto md:hidden mx-auto max-w-sm mt-2 rounded-2xl border border-white/10 bg-dark-2/95 backdrop-blur-2xl p-4 shadow-2xl"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-light-2 hover:text-light rounded-xl hover:bg-white/[0.06] transition-all"
                >
                  {item.label}
                </a>
              ))}

              <hr className="my-2 border-white/10" />

              {mounted && session ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="bg-brand text-white font-semibold px-4 py-2.5 rounded-full text-center text-xs shadow-md shadow-brand/20"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="px-3.5 py-2 text-xs text-center text-light-2 hover:text-light hover:bg-white/[0.04] rounded-xl transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="bg-brand text-white font-semibold px-4 py-2.5 rounded-full text-center text-xs shadow-md shadow-brand/20"
                  >
                    Start Free Trial
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
