import Link from "next/link";
import type { ListingWithOwner } from "@/lib/data";
import { StarRating } from "@/components/star-rating";
import { cn } from "@/lib/utils";
import BookmarkButton from "@/components/bookmark-button";
import {
  Tag,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Package,
  Wrench,
  HelpCircle,
} from "lucide-react";

export default function ListingCard({
  listing,
  currentUserId,
  isSaved = false,
}: {
  listing: ListingWithOwner;
  currentUserId?: number;
  isSaved?: boolean;
}) {
  const isOwner = currentUserId === listing.userId;
  const isOffer = listing.type === "offer";

  return (
    <div className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
      <div>
        {/* Top Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase",
                isOffer
                  ? "bg-emerald-100/80 text-emerald-800"
                  : "bg-rose-100/80 text-rose-800"
              )}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isOffer ? "bg-emerald-600" : "bg-rose-600"
                }`}
              />
              {isOffer ? "Offer" : "Need"}
            </span>

            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
              {listing.category}
            </span>
          </div>

          <BookmarkButton listingId={listing.id} initialSaved={isSaved} />
        </div>

        {/* Title & Description */}
        <div className="mt-3">
          <Link href={`/listings/${listing.id}`}>
            <h3 className="text-base font-bold text-slate-900 transition hover:text-emerald-700">
              {listing.title}
            </h3>
          </Link>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
            {listing.description}
          </p>
        </div>

        {/* Tags */}
        {listing.tags && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {listing.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
              .slice(0, 3)
              .map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500"
                >
                  #{t}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-5 space-y-3 border-t border-slate-100 pt-3">
        {/* Owner Profile Row */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/profile/${listing.owner.username || listing.owner.id}`}
            className="flex items-center gap-2 overflow-hidden hover:opacity-80"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
              {listing.owner.avatarUrl ? (
                <img
                  src={listing.owner.avatarUrl}
                  alt={listing.owner.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                listing.owner.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">
                {isOwner ? "You" : listing.owner.name}
              </p>
              <p className="truncate text-[10px] text-slate-400">
                {listing.owner.business || listing.owner.location}
              </p>
            </div>
          </Link>

          {!isOwner && (
            <StarRating
              value={listing.owner.ratingAvg}
              count={listing.owner.ratingCount}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/listings/${listing.id}`}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold shadow-2xs transition",
              isOffer
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-rose-600 text-white hover:bg-rose-700"
            )}
          >
            {isOffer ? "View & Propose" : "View & Help"}
          </Link>

          {!isOwner && (
            <Link
              href={`/messages?partnerId=${listing.userId}&listingId=${listing.id}`}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-emerald-700"
              title="Message owner"
            >
              <MessageCircle className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
