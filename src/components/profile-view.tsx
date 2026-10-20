"use client";

import React, { useState } from "react";
import type { PublicUser, ListingWithOwner } from "@/lib/data";
import ProfileEditModal from "@/components/profile-edit-modal";
import ListingCard from "@/components/listing-card";
import { StarRating } from "@/components/star-rating";
import {
  UserRound,
  Edit2,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  Star,
  CheckCircle2,
  Package,
  Globe,
  Tag,
} from "lucide-react";
import Link from "next/link";

export default function ProfileView({
  user,
  offers,
  needs,
  reviews,
  isOwnProfile = true,
}: {
  user: PublicUser;
  offers: ListingWithOwner[];
  needs: ListingWithOwner[];
  reviews: any[];
  isOwnProfile?: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"offers" | "needs" | "reviews">("offers");

  // Calculate profile completion percentage
  const fields = [
    Boolean(user.name),
    Boolean(user.bio),
    Boolean(user.occupation),
    Boolean(user.location),
    Boolean(user.skills),
    Boolean(user.avatarUrl),
  ];
  const completionPercentage = Math.round(
    (fields.filter(Boolean).length / fields.length) * 100
  );

  const skillsList = user.skills
    ? user.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      {/* Cover & Profile Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        {/* Cover Banner */}
        <div className="h-36 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 sm:h-44" />

        <div className="relative px-6 pb-6 pt-0 sm:px-8">
          {/* Avatar and Edit Button Row */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="-mt-14 sm:-mt-16 relative">
              <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl border-4 border-white bg-emerald-100 text-2xl sm:text-3xl font-extrabold text-emerald-800 shadow-md overflow-hidden">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-emerald-800"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  href={`/messages?partnerId=${user.id}`}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                >
                  Message
                </Link>
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                {user.name}
              </h1>
              {user.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Verified Rural Entrepreneur
                </span>
              )}
            </div>

            <p className="text-xs font-medium text-slate-500">
              @{user.username || `user_${user.id}`} · {user.business}
            </p>

            {user.occupation && (
              <p className="mt-1 text-sm font-semibold text-emerald-900">
                {user.occupation}
              </p>
            )}

            {user.bio && (
              <p className="mt-2.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
                {user.bio}
              </p>
            )}

            {/* Meta tags */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              {user.publicLocation && user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.languages && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  <span>{user.languages}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  Member since {user.createdAt ? new Date(user.createdAt).getFullYear() : "2024"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <StarRating value={user.ratingAvg} count={user.ratingCount} />
              </div>
            </div>

            {/* Profile completion indicator (for own profile) */}
            {isOwnProfile && completionPercentage < 100 && (
              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-900">
                    Profile Strength: {completionPercentage}%
                  </span>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Complete your profile &rarr;
                  </button>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-200">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills & Expertise Section */}
      {skillsList.length > 0 && (user.publicSkills || isOwnProfile) && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Tag className="h-4 w-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Skills & Areas of Expertise</h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {skillsList.map((skill) => (
              <span
                key={skill}
                className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Profile Listings & Reviews Tabs */}
      <div className="space-y-4">
        <div className="border-b border-slate-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("offers")}
              className={`relative pb-3 text-xs font-bold transition ${
                activeTab === "offers"
                  ? "text-emerald-800 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Offers</span>
              <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {offers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("needs")}
              className={`relative pb-3 text-xs font-bold transition ${
                activeTab === "needs"
                  ? "text-emerald-800 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Needs</span>
              <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {needs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`relative pb-3 text-xs font-bold transition ${
                activeTab === "reviews"
                  ? "text-emerald-800 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Reviews</span>
              <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {reviews.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "offers" && (
          <div>
            {offers.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
                No active offers posted yet.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {offers.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    currentUserId={isOwnProfile ? user.id : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "needs" && (
          <div>
            {needs.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
                No open needs posted yet.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {needs.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    currentUserId={isOwnProfile ? user.id : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
                No reviews received yet. Completed collaborations will show testimonials here.
              </p>
            ) : (
              reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{r.reviewerName}</p>
                      <p className="text-[10px] text-slate-400">{r.reviewerBusiness}</p>
                    </div>
                    <div className="flex text-amber-400">
                      {"★".repeat(r.rating)}
                      <span className="text-slate-200">{"★".repeat(5 - r.rating)}</span>
                    </div>
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-slate-600 italic">&ldquo;{r.comment}&rdquo;</p>
                  )}
                  <p className="mt-2 text-[10px] text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isOwnProfile && (
        <ProfileEditModal
          user={user}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
