import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getListingsByUser } from "@/lib/data";
import DashboardShell from "@/components/dashboard-shell";
import ListingItemActions from "@/components/listing-item-actions";
import { ClipboardList, PlusCircle, Search, Sparkles } from "lucide-react";

export default async function MyNeedsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const statusFilter = typeof sp.status === "string" ? sp.status : "all";
  const q = typeof sp.q === "string" ? sp.q.toLowerCase() : "";

  const allNeeds = await getListingsByUser(user.id, "need");

  const openCount = allNeeds.filter((n) => n.status === "active").length;
  const closedCount = allNeeds.filter((n) => n.status === "closed").length;

  let filtered = allNeeds;
  if (statusFilter === "open") {
    filtered = filtered.filter((n) => n.status === "active");
  } else if (statusFilter === "closed" || statusFilter === "fulfilled") {
    filtered = filtered.filter((n) => n.status === "closed");
  }

  if (q) {
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
    );
  }

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
                <ClipboardList className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Needs
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Find the skills, resources and support you need from local community members.
            </p>
          </div>

          <Link
            href="/need/new"
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Post a Need</span>
          </Link>
        </div>

        {/* Status Filter Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/my-needs?status=all"
            className={`rounded-2xl border p-4 shadow-2xs transition ${
              statusFilter === "all"
                ? "border-rose-300 bg-rose-50/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-xs font-bold uppercase text-slate-500">Total Needs</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{allNeeds.length}</p>
          </Link>
          <Link
            href="/my-needs?status=open"
            className={`rounded-2xl border p-4 shadow-2xs transition ${
              statusFilter === "open"
                ? "border-rose-300 bg-rose-50/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-xs font-bold uppercase text-rose-800">Open & Looking</p>
            <p className="mt-1 text-2xl font-black text-rose-900">{openCount}</p>
          </Link>
          <Link
            href="/my-needs?status=closed"
            className={`rounded-2xl border p-4 shadow-2xs transition ${
              statusFilter === "closed"
                ? "border-slate-400 bg-slate-100"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-xs font-bold uppercase text-slate-500">Fulfilled / Closed</p>
            <p className="mt-1 text-2xl font-black text-slate-700">{closedCount}</p>
          </Link>
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
          <form method="GET" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search your needs by title or description..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs outline-none focus:border-rose-600 focus:bg-white"
              />
            </div>
            {statusFilter !== "all" && (
              <input type="hidden" name="status" value={statusFilter} />
            )}
            <button
              type="submit"
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Needs Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-800">
              {q ? "No needs match your search" : "No needs posted yet"}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              Tell the community what you are looking for so members with complementary skills can help!
            </p>
            <div className="mt-5">
              <Link
                href="/need/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Post Your First Need</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((need) => (
              <div
                key={need.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-rose-200 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        need.status === "active"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {need.status === "active" ? "Open" : "Fulfilled"}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {need.category}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-900">{need.title}</h3>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {need.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] text-slate-400">
                    {new Date(need.createdAt).toLocaleDateString()}
                  </span>
                  <ListingItemActions
                    listingId={need.id}
                    currentStatus={need.status}
                    editUrl={`/listings/${need.id}/edit`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
