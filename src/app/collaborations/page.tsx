import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCollaborationsForUser, getMyReviewIds } from "@/lib/data";
import DashboardShell from "@/components/dashboard-shell";
import ExchangeManager from "@/components/exchange-manager";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Search,
} from "lucide-react";

export default async function CollaborationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const currentTab = typeof sp.tab === "string" ? sp.tab : "active";
  const q = typeof sp.q === "string" ? sp.q.toLowerCase() : "";

  const [collabs, reviewedIds] = await Promise.all([
    getCollaborationsForUser(user.id),
    getMyReviewIds(user.id),
  ]);

  const activeCollabs = collabs.filter((c) => c.status === "accepted");
  const awaitingConf = activeCollabs.filter(
    (c) => c.requesterConfirmed || c.providerConfirmed
  );
  const completedCollabs = collabs.filter((c) => c.status === "completed");
  const cancelledCollabs = collabs.filter((c) => c.status === "declined");

  let displayed = collabs;
  if (currentTab === "active") {
    displayed = activeCollabs;
  } else if (currentTab === "awaiting") {
    displayed = awaitingConf;
  } else if (currentTab === "completed") {
    displayed = completedCollabs;
  } else if (currentTab === "cancelled") {
    displayed = cancelledCollabs;
  }

  if (q) {
    displayed = displayed.filter(
      (c) =>
        c.listingTitle.toLowerCase().includes(q) ||
        c.requester.name.toLowerCase().includes(q) ||
        c.provider.name.toLowerCase().includes(q)
    );
  }

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                <Users className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Collaborations
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Work together, track progress, and achieve more through skill exchange.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/find"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
            >
              Find New Collaborators
            </Link>
          </div>
        </div>

        {/* Real Count Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/collaborations?tab=active"
            className={`rounded-2xl border p-4 shadow-2xs transition ${
              currentTab === "active"
                ? "border-emerald-300 bg-emerald-50/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase text-emerald-900">
              <span>Active</span>
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{activeCollabs.length}</p>
            <p className="text-[11px] text-slate-500">Currently in progress</p>
          </Link>

          <Link
            href="/collaborations?tab=awaiting"
            className={`rounded-2xl border p-4 shadow-2xs transition ${
              currentTab === "awaiting"
                ? "border-amber-300 bg-amber-50/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase text-amber-900">
              <span>Awaiting Confirmation</span>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{awaitingConf.length}</p>
            <p className="text-[11px] text-slate-500">Reported completed</p>
          </Link>

          <Link
            href="/collaborations?tab=completed"
            className={`rounded-2xl border p-4 shadow-2xs transition ${
              currentTab === "completed"
                ? "border-teal-300 bg-teal-50/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase text-teal-900">
              <span>Completed</span>
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{completedCollabs.length}</p>
            <p className="text-[11px] text-slate-500">Finished & reviewed</p>
          </Link>

          <Link
            href="/collaborations?tab=cancelled"
            className={`rounded-2xl border p-4 shadow-2xs transition ${
              currentTab === "cancelled"
                ? "border-slate-400 bg-slate-100"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500">
              <span>Cancelled</span>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-700">{cancelledCollabs.length}</p>
            <p className="text-[11px] text-slate-500">Ended without completion</p>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <div className="flex gap-2">
            {[
              { id: "active", label: "Active", count: activeCollabs.length },
              { id: "awaiting", label: "Awaiting Confirmation", count: awaitingConf.length },
              { id: "completed", label: "Completed", count: completedCollabs.length },
              { id: "cancelled", label: "Cancelled", count: cancelledCollabs.length },
            ].map((tab) => (
              <Link
                key={tab.id}
                href={`/collaborations?tab=${tab.id}`}
                className={`relative px-4 py-2 text-xs font-bold transition ${
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

          {/* Search */}
          <form method="GET" className="flex items-center">
            <input type="hidden" name="tab" value={currentTab} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Filter by title or partner..."
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-emerald-600"
            />
          </form>
        </div>

        {/* Content list */}
        {displayed.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-800">
              No collaborations in &ldquo;{currentTab}&rdquo;
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              Once an exchange proposal is accepted, you can manage progress, track milestones, and verify completion here.
            </p>
            <div className="mt-5">
              <Link
                href="/exchange"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                View Resource Exchange Proposals
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((collab) => (
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
