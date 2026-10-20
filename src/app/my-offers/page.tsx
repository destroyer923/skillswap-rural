import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getListingsByUser } from "@/lib/data";
import DashboardShell from "@/components/dashboard-shell";
import ListingItemActions from "@/components/listing-item-actions";
import { PlusCircle, Search, Tag, MapPin, Sparkles, HandHeart } from "lucide-react";

export default async function MyOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const statusFilter = typeof sp.status === "string" ? sp.status : "all";
  const q = typeof sp.q === "string" ? sp.q.toLowerCase() : "";

  const allOffers = await getListingsByUser(user.id, "offer");

  const activeCount = allOffers.filter((o) => o.status === "active").length;
  const inactiveCount = allOffers.filter((o) => o.status === "closed").length;

  let filtered = allOffers;
  if (statusFilter === "active") {
    filtered = filtered.filter((o) => o.status === "active");
  } else if (statusFilter === "inactive") {
    filtered = filtered.filter((o) => o.status === "closed");
  }

  if (q) {
    filtered = filtered.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q)
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
                <HandHeart className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Offers
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Share your skills, services, and resources with your community.
            </p>
          </div>

          <Link
            href="/offer/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Offer</span>
          </Link>
        </div>

        {/* Summary Filter Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/my-offers?status=all"
            className={`rounded-2xl border p-4 shadow-2xs transition ${
              statusFilter === "all"
                ? "border-emerald-300 bg-emerald-50/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-xs font-bold uppercase text-slate-500">Total Offers</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{allOffers.length}</p>
          </Link>
          <Link
            href="/my-offers?status=active"
            className={`rounded-2xl border p-4 shadow-2xs transition ${
              statusFilter === "active"
                ? "border-emerald-300 bg-emerald-50/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-xs font-bold uppercase text-emerald-800">Published / Active</p>
            <p className="mt-1 text-2xl font-black text-emerald-900">{activeCount}</p>
          </Link>
          <Link
            href="/my-offers?status=inactive"
            className={`rounded-2xl border p-4 shadow-2xs transition ${
              statusFilter === "inactive"
                ? "border-slate-400 bg-slate-100"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-xs font-bold uppercase text-slate-500">Inactive / Closed</p>
            <p className="mt-1 text-2xl font-black text-slate-700">{inactiveCount}</p>
          </Link>
        </div>

        {/* Search bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
          <form method="GET" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search your offers by title or category..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-600 focus:bg-white"
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

        {/* Offers Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <PlusCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-800">
              {q ? "No offers match your search" : "You haven't posted an offer yet"}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              Share a skill or resource with your community. Other entrepreneurs are looking for what you have!
            </p>
            <div className="mt-5">
              <Link
                href="/offer/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Your First Offer</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((offer) => (
              <div
                key={offer.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-emerald-200 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        offer.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {offer.status === "active" ? "Published" : "Inactive"}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {offer.category}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-900">{offer.title}</h3>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {offer.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] text-slate-400">
                    {new Date(offer.createdAt).toLocaleDateString()}
                  </span>
                  <ListingItemActions
                    listingId={offer.id}
                    currentStatus={offer.status}
                    editUrl={`/listings/${offer.id}/edit`}
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
