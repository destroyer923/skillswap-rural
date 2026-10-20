"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicUser } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function Navbar({ user }: { user: PublicUser | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/", label: "Home" },
    { href: "/find", label: "Find Skills" },
    { href: "/#how", label: "How it works" },
  ];

  if (user) {
    links.unshift({ href: "/matches", label: "🤝 Matches" });
    links.push({ href: "/offer/new", label: "Post an Offer" });
    links.push({ href: "/need/new", label: "Post a Need" });
    links.push({ href: "/collaborations", label: "Collaborations" });
    links.push({ href: "/dashboard", label: "Dashboard" });
    if (user.role === "admin") links.push({ href: "/admin", label: "Admin" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-lg text-white">🌾</span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            SkillSwap <span className="text-emerald-600">Rural</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-slate-100",
                pathname === l.href ? "text-emerald-700" : "text-slate-600"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-medium text-slate-700">{user.name}</span>
              </Link>
              <button
                onClick={logout}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={logout}
                className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-left text-sm font-medium text-slate-700"
              >
                Log out
              </button>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700">
                  Log in
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white">
                  Sign up free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
