import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCollaborationsForUser, getMyReviewIds } from "@/lib/data";
import DashboardShell from "@/components/dashboard-shell";
import ExchangeManager from "@/components/exchange-manager";
import {
  Package,
  Inbox,
  Send,
  CheckCircle2,
  Clock,
  History,
  PlusCircle,
  Search,
  Filter,
} from "lucide-react";

export default async function ExchangePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const currentTab = typeof sp.tab === "string" ? sp.tab : "requests";

  const [collabs, reviewedIds] = await Promise.all([
    getCollaborationsForUser(user.id),
    getMyReviewIds(user.id),
  ]);

  const incomingRequests = collabs.filter(
    (c) => c.providerId === user.id && c.status === "pending"
  );
  const outgoingRequests = collabs.filter(
    (c) => c.requesterId === user.id && c.status === "pending"
  );
  const activeExchanges = collabs.filter((c) => c.status === "accepted");
  const awaitingConfirmation = activeExchanges.filter(
    (c) => c.requesterConfirmed || c.providerConfirmed
  );
  const completedExchanges = collabs.filter((c) => c.status === "completed");
  const historyExchanges = collabs.filter(
    (c) => c.status === "declined" || c.status === "completed"
  );

  let displayedCollabs = collabs;
  if (currentTab === "requests") {
    displayedCollabs = collabs.filter((c) => c.status === "pending");
  } else if (currentTab === "active") {
    displayedCollabs = activeExchanges;
  } else if (currentTab === "completed") {
    displayedCollabs = completedExchanges;
  } else if (currentTab === "history") {
    displayedCollabs = historyExchanges;
  }

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Package className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Resource Exchange
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Manage your agreements, track progress, and complete meaningful exchanges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/find"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              Explore Skills
            </Link>
          </div>
        </div>

        {/* Database-backed Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Link
            href="/exchange?tab=requests"
            className={`rounded-2xl border p-4 shadow-2xs transition hover:shadow-xs ${
              currentTab === "requests"
                ? "border-amber-300 bg-amber-50/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase text-amber-900">
              <span>Incoming</span>
              <Inbox className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{incomingRequests.length}</p>
            <p className="text-[11px] text-slate-500">Awaiting your response</p>
          </Link>

          <Link
            href="/exchange?tab=requests"
            className={`rounded-2xl border p-4 shadow-2xs transition hover:shadow-xs ${
              currentTab === "requests"
                ? "border-teal-300 bg-teal-50/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase text-teal-900">
              <span>Outgoing</span>
              <Send className="h-4 w-4 text-teal-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{outgoingRequests.length}</p>
            <p className="text-[11px] text-slate-500">Proposals sent</p>
          </Link>

          <Link
            href="/exchange?tab=active"
            className={`rounded-2xl border p-4 shadow-2xs transition hover:shadow-xs ${
              currentTab === "active"
                ? "border-emerald-300 bg-emerald-50/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase text-emerald-900">
              <span>Active</span>
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{activeExchanges.length}</p>
            <p className="text-[11px] text-slate-500">In progress</p>
          </Link>

          <Link
            href="/exchange?tab=active"
            className={`rounded-2xl border p-4 shadow-2xs transition hover:shadow-xs ${
              currentTab === "active"
                ? "border-purple-300 bg-purple-50/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase text-purple-900">
              <span>Confirming</span>
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {awaitingConfirmation.length}
            </p>
            <p className="text-[11px] text-slate-500">Awaiting mutual sign-off</p>
          </Link>

          <Link
            href="/exchange?tab=completed"
            className={`rounded-2xl border p-4 shadow-2xs transition hover:shadow-xs ${
              currentTab === "completed"
                ? "border-emerald-300 bg-emerald-50/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase text-emerald-900">
              <span>Completed</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{completedExchanges.length}</p>
            <p className="text-[11px] text-slate-500">Done & verified</p>
          </Link>
        </div>

        {/* 4 Main Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-2">
            {[
              { id: "requests", label: "Requests", count: incomingRequests.length + outgoingRequests.length },
              { id: "active", label: "Active Exchanges", count: activeExchanges.length },
              { id: "completed", label: "Completed", count: completedExchanges.length },
              { id: "history", label: "History", count: historyExchanges.length },
            ].map((tab) => (
              <Link
                key={tab.id}
                href={`/exchange?tab=${tab.id}`}
                className={`relative px-4 py-2.5 text-xs font-bold transition ${
                  currentTab === tab.id
                    ? "text-emerald-800 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {tab.count}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Tab Content Display */}
        {displayedCollabs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-800">
              No exchanges in &ldquo;{currentTab}&rdquo;
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              Browse listings or check your Smart Matches to propose your next great skill exchange.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/find"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Explore Skills
              </Link>
              <Link
                href="/matches"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                View Smart Matches
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedCollabs.map((collab) => (
              <ExchangeManager
                key={collab.id}
                collab={collab}
                currentUserId={user.id}
                hasReviewed={reviewedIds.has(collab.id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
