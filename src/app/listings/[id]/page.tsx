import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getListingById, getSavedListingIds } from "@/lib/data";
import { StarRating } from "@/components/star-rating";
import RequestButton from "@/components/request-button";
import BookmarkButton from "@/components/bookmark-button";
import DashboardShell from "@/components/dashboard-shell";
import { KIND_LABEL, EXCHANGE_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Tag,
  Clock,
  Sparkles,
  MessageCircle,
  Edit2,
  UserRound,
} from "lucide-react";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  const listing = await getListingById(Number(id));
  if (!listing) notFound();

  const savedIds = user ? await getSavedListingIds(user.id) : new Set<number>();

  const isOwner = user?.id === listing.userId;
  const isOffer = listing.type === "offer";
  const canRequest = user && !isOwner && listing.status === "active";

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/find"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Explore Skills</span>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Listing Details */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                      isOffer
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    )}
                  >
                    {isOffer ? "Offer" : "Need"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {listing.category}
                  </span>
                  {listing.status === "closed" && (
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                      Closed
                    </span>
                  )}
                </div>

                <BookmarkButton
                  listingId={listing.id}
                  initialSaved={savedIds.has(listing.id)}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                  {KIND_LABEL[listing.kind] || listing.kind}
                </span>
                <span className="rounded-lg bg-amber-50 px-2.5 py-1 font-medium text-amber-800">
                  {EXCHANGE_LABEL[listing.exchangeType] || listing.exchangeType}
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                {listing.title}
              </h1>

              {/* Photo preview if present */}
              {listing.imageUrl && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 max-h-72">
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {listing.description}
              </div>

              {/* Additional details */}
              {(listing.whatProvided || listing.whatWanted) && (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 text-xs">
                  {listing.whatProvided && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                      <p className="font-bold text-emerald-950">Scope / Details Provided:</p>
                      <p className="mt-1 text-slate-700">{listing.whatProvided}</p>
                    </div>
                  )}
                  {listing.whatWanted && (
                    <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
                      <p className="font-bold text-teal-950">Desired In Exchange:</p>
                      <p className="mt-1 text-slate-700">{listing.whatWanted}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {listing.tags && (
                <div className="mt-6 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
                  {listing.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((t) => (
                      <span
                        key={t}
                        className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        #{t}
                      </span>
                    ))}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
                <span>Published on {new Date(listing.createdAt).toLocaleDateString()}</span>
                {listing.location && <span>Location: {listing.location}</span>}
              </div>
            </div>
          </div>

          {/* Owner Sidebar Card */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isOffer ? "Offered by" : "Requested by"}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-bold text-emerald-800">
                  {listing.owner.avatarUrl ? (
                    <img
                      src={listing.owner.avatarUrl}
                      alt={listing.owner.name}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    listing.owner.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <Link
                    href={`/profile/${listing.owner.username || listing.owner.id}`}
                    className="text-sm font-bold text-slate-900 hover:underline"
                  >
                    {isOwner ? "You" : listing.owner.name}
                  </Link>
                  <p className="text-xs text-slate-500">{listing.owner.business}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{listing.owner.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  <span>{listing.owner.category}</span>
                </div>
                <div className="pt-1">
                  <StarRating
                    value={listing.owner.ratingAvg}
                    count={listing.owner.ratingCount}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                {canRequest && <RequestButton listing={listing} />}

                {!isOwner && (
                  <Link
                    href={`/messages?partnerId=${listing.userId}&listingId=${listing.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-700" />
                    <span>Message {listing.owner.name.split(" ")[0]}</span>
                  </Link>
                )}

                {isOwner && (
                  <Link
                    href={`/listings/${listing.id}/edit`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit Listing</span>
                  </Link>
                )}

                {!user && (
                  <p className="rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
                    <Link
                      href="/login"
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      Log in
                    </Link>{" "}
                    to propose an exchange or message this member.
                  </p>
                )}
              </div>
            </div>

            {/* Informational Card */}
            <div className="rounded-3xl bg-emerald-800 p-6 text-white shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-300" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Direct Rural Barter
                </h4>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-emerald-100">
                SkillSwap Rural enables mutual collaborations. Propose what you can give in return and trade skills directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
