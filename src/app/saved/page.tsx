import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getSavedListingsForUser } from "@/lib/data";
import DashboardShell from "@/components/dashboard-shell";
import ListingCard from "@/components/listing-card";
import { Bookmark, Search, ArrowRight, Compass } from "lucide-react";

export default async function SavedListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const filterType = typeof sp.type === "string" ? sp.type : "all";
  const q = typeof sp.q === "string" ? sp.q.toLowerCase() : "";

  const allSaved = await getSavedListingsForUser(user.id);

  const offersCount = allSaved.filter((l) => l.type === "offer").length;
  const needsCount = allSaved.filter((l) => l.type === "need").length;

  let filtered = allSaved;
  if (filterType === "offer") {
    filtered = filtered.filter((l) => l.type === "offer");
  } else if (filterType === "need") {
    filtered = filtered.filter((l) => l.type === "need");
  }

  if (q) {
    filtered = filtered.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.owner.name.toLowerCase().includes(q)
    );
  }

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Bookmark className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Saved Listings
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Keep track of opportunities worth exploring.
            </p>
          </div>

          <Link
            href="/find"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
          >
            <Compass className="h-4 w-4" />
            <span>Explore More Skills</span>
          </Link>
        </div>

        {/* Filter Badges & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <Link
              href="/saved?type=all"
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                filterType === "all"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Saved ({allSaved.length})
            </Link>
            <Link
              href="/saved?type=offer"
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                filterType === "offer"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Offers ({offersCount})
            </Link>
            <Link
              href="/saved?type=need"
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                filterType === "need"
                  ? "bg-white text-rose-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Needs ({needsCount})
            </Link>
          </div>

          <form method="GET" className="relative w-72">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Filter saved listings..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-emerald-600"
            />
            {filterType !== "all" && <input type="hidden" name="type" value={filterType} />}
          </form>
        </div>

        {/* Saved Listings Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Bookmark className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-800">
              {q ? "No saved listings match your search" : "No saved listings yet"}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              Bookmark interesting offers and needs while browsing Explore Skills or Smart Matches to revisit them anytime.
            </p>
            <div className="mt-5">
              <Link
                href="/find"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <Compass className="h-4 w-4" />
                <span>Explore Skills</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                currentUserId={user.id}
                isSaved={true}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
