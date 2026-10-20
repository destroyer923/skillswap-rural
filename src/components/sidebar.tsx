"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Handshake,
  Package,
  PlusCircle,
  ClipboardList,
  Users,
  MessageCircle,
  Bookmark,
  UserRound,
  Star,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sprout,
  Menu,
  X,
  Bell,
  Search,
  ExternalLink,
  Shield,
} from "lucide-react";
import type { PublicUser } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export interface SidebarProps {
  user: PublicUser | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  pendingCollabsCount?: number;
}

export default function Sidebar({
  user,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  pendingCollabsCount = 0,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close user menu on route change
  useEffect(() => {
    setUserMenuOpen(false);
    onCloseMobile();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navGroups = [
    {
      label: t.navMain,
      items: [
        {
          label: t.dashboard,
          href: "/dashboard",
          icon: LayoutDashboard,
          active: pathname === "/dashboard",
        },
        {
          label: t.exploreSkills,
          href: "/find",
          icon: Compass,
          active: pathname === "/find" || pathname.startsWith("/listings"),
        },
        {
          label: t.smartMatches,
          href: "/matches",
          icon: Handshake,
          active: pathname === "/matches",
        },
        {
          label: t.resourceExchange,
          href: "/exchange",
          icon: Package,
          active: pathname === "/exchange",
        },
      ],
    },
    {
      label: t.navMyExchange,
      items: [
        {
          label: t.myOffers,
          href: "/my-offers",
          icon: PlusCircle,
          active: pathname === "/my-offers" || pathname === "/offer/new",
        },
        {
          label: t.myNeeds,
          href: "/my-needs",
          icon: ClipboardList,
          active: pathname === "/my-needs" || pathname === "/need/new",
        },
        {
          label: t.collaborations,
          href: "/collaborations",
          icon: Users,
          active: pathname === "/collaborations",
          badge: pendingCollabsCount > 0 ? pendingCollabsCount : undefined,
        },
        {
          label: t.messages,
          href: "/messages",
          icon: MessageCircle,
          active: pathname.startsWith("/messages"),
        },
        {
          label: t.savedListings,
          href: "/saved",
          icon: Bookmark,
          active: pathname === "/saved",
        },
      ],
    },
    {
      label: t.navPersonal,
      items: [
        {
          label: t.myProfile,
          href: "/profile",
          icon: UserRound,
          active: pathname === "/profile",
        },
        {
          label: t.reviewsReputation,
          href: "/reputation",
          icon: Star,
          active: pathname === "/reputation",
        },
        {
          label: t.settings,
          href: "/settings",
          icon: Settings,
          active: pathname === "/settings",
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto overflow-x-hidden bg-white text-slate-700">
      {/* Top Header & Brand */}
      <div>
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-3.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 overflow-hidden transition-opacity hover:opacity-90"
            title="SkillSwap Rural"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm shadow-emerald-700/20">
              <Sprout className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1 leading-none">
                <span className="block text-sm font-bold tracking-tight text-slate-900">
                  SkillSwap <span className="text-emerald-700">Rural</span>
                </span>
                <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-400">
                  Skill & Resource Exchange
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? t.expand : t.collapse}
            className="hidden h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:flex"
            title={collapsed ? t.expand : t.collapse}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-6 px-3 py-4">
          {navGroups.map((group, groupIdx) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {group.label}
                </div>
              )}
              {collapsed && groupIdx > 0 && (
                <div className="mx-auto my-2 w-6 border-t border-slate-100" />
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      item.active
                        ? "bg-emerald-50 text-emerald-900 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {/* Active vertical pill indicator */}
                    {item.active && (
                      <span className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-emerald-600" />
                    )}

                    <Icon
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        item.active
                          ? "text-emerald-700"
                          : "text-slate-400 group-hover:text-emerald-700"
                      }`}
                    />

                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}

                    {!collapsed && item.badge !== undefined && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed Tooltip */}
                    {collapsed && (
                      <div className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-lg group-hover:block">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Admin link if user is admin */}
          {user?.role === "admin" && (
            <div className="pt-2">
              {!collapsed && (
                <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Administration
                </div>
              )}
              <Link
                href="/admin"
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  pathname === "/admin"
                    ? "bg-purple-50 text-purple-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                title={collapsed ? "Admin Console" : undefined}
              >
                <Shield className="h-5 w-5 shrink-0 text-purple-600" />
                {!collapsed && <span className="truncate">Admin Console</span>}
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* User Profile & Account Footer */}
      <div className="border-t border-slate-100 p-3">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex w-full items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50 ${
                userMenuOpen ? "bg-slate-50" : ""
              }`}
              title={collapsed ? `${user.name} (${user.email})` : undefined}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
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
              {!collapsed && (
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-xs font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-[11px] text-slate-400">{user.business || user.email}</p>
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div
                className={`absolute bottom-full mb-2 z-50 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ${
                  collapsed ? "left-full ml-2 w-56" : "left-0 right-0 w-full"
                }`}
              >
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="truncate text-xs font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-[10px] text-slate-500">{user.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    <UserRound className="h-3.5 w-3.5" />
                    <span>{t.myProfile}</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>{t.settings}</span>
                  </Link>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t.logOut}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <Link
              href="/login"
              className="flex items-center justify-center rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              {!collapsed ? t.logIn : <LogOut className="h-4 w-4" />}
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200/80 bg-white transition-all duration-300 ease-in-out lg:block ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
