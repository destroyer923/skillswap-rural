import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import {
  searchListings,
  getSavedListingIds,
  CATEGORIES,
} from "@/lib/data";
import { getMatchesForUser } from "@/lib/matching";
import ListingCard from "@/components/listing-card";
import DashboardShell from "@/components/dashboard-shell";
import {
  Compass,
  Search,
  Filter,
  PlusCircle,
  ClipboardList,
  Sparkles,
  ArrowRight,
  Handshake,
} from "lucide-react";
import RequestButton from "@/components/request-button";

export default async function FindPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const user = await getSessionUser();

  const type = typeof sp.type === "string" ? sp.type : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const q = typeof sp.q === "string" ? sp.q : "";
  const location = typeof sp.location === "string" ? sp.location : "";

  const [results, savedIds, matchReport] = await Promise.all([
    searchListings({
      type: type || undefined,
      category: category || undefined,
      q: q || undefined,
      location: location || undefined,
    }),
    user ? getSavedListingIds(user.id) : new Set<number>(),
    user ? getMatchesForUser(user.id) : null,
  ]);

  const hasFilters = Boolean(type || category || q || location);

  function qs(patch: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = { type, category, q, location, ...patch };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    return `/find?${params.toString()}`;
  }

  // Count active offers and needs in the community
  const totalOffers = results.filter((r) => r.type === "offer").length;
  const totalNeeds = results.filter((r) => r.type === "need").length;

  const smartMatches = matchReport?.mutual.slice(0, 2) || [];

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Compass className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Explore Skills
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Discover people, exchange skills, and grow together across rural communities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/offer/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post an Offer</span>
            </Link>
            <Link
              href="/need/new"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
            >
              <ClipboardList className="h-4 w-4 text-emerald-700" />
              <span>Post a Need</span>
            </Link>
          </div>
        </div>

        {/* Potential Exchange Matches Section (if user has matches) */}
        {smartMatches.length > 0 && (
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-xs font-bold text-amber-950">
                  ⚡
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Potential Exchange Matches for You
                </h2>
              </div>
              <Link
                href="/matches"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 hover:underline"
              >
                <span>View all in Smart Matches</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {smartMatches.map((m) => (
                <div
                  key={m.partner.id}
                  className="rounded-xl border border-amber-100 bg-white p-3 text-xs shadow-2xs"
                >
                  <p className="font-semibold text-slate-900">{m.partner.name} ({m.partner.business})</p>
                  <p className="mt-0.5 text-slate-600">
                    Offers: <span className="font-medium text-emerald-700">{m.theyHelpYou[0].offer.title}</span>
                  </p>
                  <p className="mt-0.5 text-slate-600">
                    Needs: <span className="font-medium text-rose-700">{m.youHelpThem[0].need.title}</span>
                  </p>
                  <div className="mt-2.5 flex justify-end gap-2">
                    <Link
                      href={`/profile/${m.partner.username || m.partner.id}`}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View Profile
                    </Link>
                    <RequestButton listing={m.theyHelpYou[0].offer} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <form method="GET" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
            <div className="relative sm:col-span-2 lg:col-span-5">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search skills, people, or resources..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="lg:col-span-3">
              <input
                name="location"
                defaultValue={location}
                placeholder="Location (e.g. Nashik, Pune)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="lg:col-span-2">
              <select
                name="category"
                defaultValue={category}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Hidden type preserve */}
            {type && <input type="hidden" name="type" value={type} />}

            <div className="flex gap-2 lg:col-span-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                Search
              </button>
              {hasFilters && (
                <Link
                  href="/find"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  title="Clear filters"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>

          {/* Category Chips Selector */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
            <span className="mr-1 text-[11px] font-semibold text-slate-400">Categories:</span>
            <Link
              href={qs({ category: "" })}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                !category
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={qs({ category: c })}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  category === c
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>

        {/* Discovery Tabs: All / Offers / Needs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <Link
              href={qs({ type: "" })}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                !type
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Listings ({results.length})
            </Link>
            <Link
              href={qs({ type: "offer" })}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                type === "offer"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Offers ({totalOffers})
            </Link>
            <Link
              href={qs({ type: "need" })}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                type === "need"
                  ? "bg-white text-rose-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Needs ({totalNeeds})
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{results.length}</span> opportunities
          </p>
        </div>

        {/* Listings Grid */}
        {results.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                currentUserId={user?.id}
                isSaved={savedIds.has(listing.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-800">No opportunities match your filter</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              Try adjusting your keywords or category, or be the first to post what you need.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/find"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear all filters
              </Link>
              <Link
                href="/need/new"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Post a Need
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
