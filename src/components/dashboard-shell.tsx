"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import type { PublicUser } from "@/lib/data";
import {
  Menu,
  Search,
  Bell,
  Globe,
  UserRound,
  Settings,
  LogOut,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Handshake,
} from "lucide-react";
import { useI18n, type Language } from "@/lib/i18n";

export interface DashboardShellProps {
  user: PublicUser | null;
  children: React.ReactNode;
  pendingRequests?: Array<{
    id: number;
    requesterName: string;
    listingTitle: string;
    createdAt: Date;
  }>;
}

export default function DashboardShell({
  user,
  children,
  pendingRequests = [],
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useI18n();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Restore collapsed preference
  useEffect(() => {
    const saved = localStorage.getItem("skillswap_sidebar_collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("skillswap_sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/find?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "mr", label: "मराठी" },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Sidebar Component */}
      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        pendingCollabsCount={pendingRequests.length}
      />

      {/* Main Content Area */}
      <div
        className={`flex min-h-screen flex-col transition-all duration-300 ease-in-out ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open mobile navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Global Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative hidden w-72 sm:block md:w-96">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </form>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-800"
                title="Select language / भाषा निवडा / भाषा चुनें"
              >
                <Globe className="h-4 w-4 text-emerald-700" />
                <span className="hidden sm:inline">
                  {languages.find((l) => l.code === language)?.label}
                </span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-50 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-xs text-left transition ${
                        language === l.code
                          ? "bg-emerald-50 font-semibold text-emerald-800"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{l.label}</span>
                      {language === l.code && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {pendingRequests.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                    {pendingRequests.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <p className="text-xs font-semibold text-slate-900">Notifications</p>
                    <span className="text-[10px] text-slate-400">
                      {pendingRequests.length} pending
                    </span>
                  </div>

                  {pendingRequests.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      <p>✨ All caught up!</p>
                      <p className="mt-1 text-[11px] text-slate-400">No new exchange requests.</p>
                    </div>
                  ) : (
                    <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                      {pendingRequests.map((req) => (
                        <Link
                          key={req.id}
                          href="/exchange"
                          onClick={() => setNotificationsOpen(false)}
                          className="block rounded-xl border border-slate-100 bg-emerald-50/50 p-2.5 transition hover:bg-emerald-50"
                        >
                          <div className="flex items-start gap-2">
                            <Handshake className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-slate-900">
                                {req.requesterName} proposed an exchange
                              </p>
                              <p className="truncate text-[11px] text-slate-500">
                                For: &ldquo;{req.listingTitle}&rdquo;
                              </p>
                              <p className="mt-1 text-[10px] text-slate-400">
                                {new Date(req.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 border-t border-slate-100 pt-2 text-center">
                    <Link
                      href="/exchange"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      View All in Resource Exchange &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar & Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-100"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-xs font-bold text-white shadow-xs">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden text-xs font-semibold text-slate-800 sm:inline">
                    {user.name.split(" ")[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="truncate text-xs font-semibold text-slate-900">{user.name}</p>
                      <p className="truncate text-[10px] text-slate-500">{user.email}</p>
                      <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-800">
                        {user.business || user.category}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <UserRound className="h-4 w-4 text-slate-400" />
                        <span>{t.myProfile}</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                        <span>{t.settings}</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t.logOut}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t.logIn}
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                >
                  {t.signUp}
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
