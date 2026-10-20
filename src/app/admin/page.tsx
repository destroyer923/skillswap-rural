import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { toPublicUser } from "@/lib/data";
import { timeAgo } from "@/lib/utils";
import { UserRowActions, ListingRowActions } from "@/components/admin-actions";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const admin = await requireAdmin();
  const { tab } = await searchParams;
  const activeTab = tab === "listings" ? "listings" : "users";

  const [allUsers, allListings, stats] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)),
    db
      .select({ listing: listings, owner: users })
      .from(listings)
      .innerJoin(users, eq(listings.userId, users.id))
      .orderBy(desc(listings.createdAt)),
    Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(listings).where(eq(listings.status, "active")),
      db.select({ value: count() }).from(listings),
      db.select({ value: count() }).from(users).where(eq(users.role, "admin")),
    ]),
  ]);

  const [userCount, activeListings, totalListings, adminCount] = stats.map((r) => Number(r[0]?.value ?? 0));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🛡️ Admin Panel</h1>
          <p className="mt-1 text-sm text-slate-500">Manage users and keep the community safe.</p>
        </div>
        <p className="text-xs text-slate-500">Signed in as {admin.name} (admin)</p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total users", value: userCount },
          { label: "Active listings", value: activeListings },
          { label: "Total listings", value: totalListings },
          { label: "Admins", value: adminCount },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
            <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-slate-200 p-1">
        <Link
          href="/admin?tab=users"
          className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-semibold transition ${
            activeTab === "users" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          👥 Users ({allUsers.length})
        </Link>
        <Link
          href="/admin?tab=listings"
          className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-semibold transition ${
            activeTab === "listings" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          📋 Listings ({allListings.length})
        </Link>
      </div>

      {/* Users table */}
      {activeTab === "users" && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUsers.map((u) => {
                const pub = toPublicUser(u);
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium text-slate-800">
                            {u.name} {u.id === admin.id && <span className="text-xs text-slate-400">(you)</span>}
                          </p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.location}</td>
                    <td className="px-4 py-3 text-slate-600">{u.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      ⭐ {pub.ratingAvg ? pub.ratingAvg.toFixed(1) : "—"} ({pub.ratingCount})
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <UserRowActions userId={u.id} role={u.role} isActive={u.isActive} isSelf={u.id === admin.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Listings table */}
      {activeTab === "listings" && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Posted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allListings.map(({ listing, owner }) => (
                <tr key={listing.id} className="hover:bg-slate-50">
                  <td className="max-w-[220px] px-4 py-3">
                    <p className="truncate font-medium text-slate-800">{listing.title}</p>
                    <p className="truncate text-xs text-slate-500">{listing.category}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {owner.name}
                    <p className="text-xs text-slate-400">{owner.location}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        listing.type === "offer" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {listing.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        listing.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{timeAgo(listing.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          View
                        </Link>
                        <ListingRowActions listingId={listing.id} status={listing.status} />
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
