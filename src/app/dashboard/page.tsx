import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  getListingsByUser,
  getCollaborationsForUser,
  getReviewsForUser,
  getMyReviewIds,
} from "@/lib/data";
import { getMatchesForUser } from "@/lib/matching";
import DashboardShell from "@/components/dashboard-shell";
import {
  HandHeart,
  ClipboardList,
  Handshake,
  Users,
  Compass,
  PlusCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Star,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import RequestButton from "@/components/request-button";
import CollabActions, { StatusBadge } from "@/components/collab-actions";
import ReviewButton from "@/components/review-button";

export default async function DashboardPage() {
  const user = await requireUser();

  const [myOffers, myNeeds, collabs, reviewsReceived, matchReport] = await Promise.all([
    getListingsByUser(user.id, "offer"),
    getListingsByUser(user.id, "need"),
    getCollaborationsForUser(user.id),
    getReviewsForUser(user.id),
    getMatchesForUser(user.id),
  ]);

  const reviewedIds = await getMyReviewIds(user.id);

  const activeOffersCount = myOffers.filter((o) => o.status === "active").length;
  const activeNeedsCount = myNeeds.filter((n) => n.status === "active").length;
  const activeCollabsCount = collabs.filter(
    (c) => c.status === "accepted" || c.status === "pending"
  ).length;

  const totalMatchesCount =
    matchReport.mutual.length +
    matchReport.theyCanHelpYou.length +
    matchReport.youCanHelpThem.length;

  const pendingIncoming = collabs.filter(
    (c) => c.providerId === user.id && c.status === "pending"
  );

  // Build Recent Activity Feed from real DB records
  const recentActivities: Array<{
    id: string;
    icon: any;
    title: string;
    description: string;
    time: Date;
    link?: string;
  }> = [];

  for (const c of collabs.slice(0, 5)) {
    const isRequester = c.requesterId === user.id;
    const other = isRequester ? c.provider : c.requester;
    if (c.status === "pending") {
      recentActivities.push({
        id: `collab-${c.id}`,
        icon: Clock,
        title: isRequester
          ? `You sent an exchange request to ${other.name}`
          : `New exchange request from ${other.name}`,
        description: `For “${c.listingTitle}”`,
        time: c.createdAt,
        link: "/exchange",
      });
    } else if (c.status === "accepted") {
      recentActivities.push({
        id: `collab-${c.id}`,
        icon: Handshake,
        title: `Collaboration active with ${other.name}`,
        description: `Agreed exchange for “${c.listingTitle}”`,
        time: c.updatedAt,
        link: "/collaborations",
      });
    } else if (c.status === "completed") {
      recentActivities.push({
        id: `collab-${c.id}`,
        icon: CheckCircle2,
        title: `Collaboration completed with ${other.name}`,
        description: `Successfully concluded “${c.listingTitle}”`,
        time: c.updatedAt,
        link: "/collaborations",
      });
    }
  }

  for (const r of reviewsReceived.slice(0, 3)) {
    recentActivities.push({
      id: `review-${r.id}`,
      icon: Star,
      title: `Review received from ${r.reviewerName}`,
      description: `${r.rating}★: “${r.comment || "Great collaboration"}”`,
      time: r.createdAt,
      link: "/reputation",
    });
  }

  // Sort by latest
  recentActivities.sort((a, b) => b.time.getTime() - a.time.getTime());

  // Greeting based on time of day
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Pending requests for shell notification bell
  const pendingRequestsForHeader = pendingIncoming.map((p) => ({
    id: p.id,
    requesterName: p.requester.name,
    listingTitle: p.listingTitle,
    createdAt: p.createdAt,
  }));

  // Recommended matches sample
  const recommendedMatches = matchReport.mutual.slice(0, 3);
  const oneWayMatches = matchReport.theyCanHelpYou.slice(0, 2);

  return (
    <DashboardShell user={user} pendingRequests={pendingRequestsForHeader}>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Personalized Top Greeting */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {timeGreeting}, {user.name.split(" ")[0]}!
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Your skills have value. Let&apos;s find the right people to grow together.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/offer/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post an Offer</span>
            </Link>
            <Link
              href="/need/new"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
            >
              <ClipboardList className="h-4 w-4 text-emerald-700" />
              <span>Post a Need</span>
            </Link>
          </div>
        </div>

        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white p-6 shadow-sm sm:p-8">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-800">
              <Sparkles className="h-3.5 w-3.5" />
              Direct Rural Barter & Resource Exchange
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Your next great exchange starts here.
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              Find someone who needs what you offer and has what you need. Zero cash required — trade skills, harvest produce, design, and machinery locally.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/matches"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800"
              >
                <Handshake className="h-4 w-4" />
                <span>Find Matches</span>
              </Link>
              <Link
                href="/offer/new"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-5 py-2.5 text-xs font-semibold text-emerald-900 shadow-xs transition hover:bg-emerald-50"
              >
                <PlusCircle className="h-4 w-4 text-emerald-700" />
                <span>Post an Offer</span>
              </Link>
            </div>
          </div>

          {/* Decorative Leaf / Sprout Accent */}
          <div className="pointer-events-none absolute -bottom-8 -right-8 opacity-10 sm:opacity-15">
            <Handshake className="h-64 w-64 text-emerald-800" />
          </div>
        </div>

        {/* 4 Dashboard Statistics Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Link
            href="/my-offers"
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Offers
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100">
                <HandHeart className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">{activeOffersCount}</p>
            <p className="mt-1 text-xs text-slate-500">Skills & produce offered</p>
          </Link>

          <Link
            href="/my-needs"
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Open Needs
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">{activeNeedsCount}</p>
            <p className="mt-1 text-xs text-slate-500">Unresolved requests</p>
          </Link>

          <Link
            href="/collaborations"
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Collaborations
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-100">
                <Handshake className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">{activeCollabsCount}</p>
            <p className="mt-1 text-xs text-slate-500">Active or pending</p>
          </Link>

          <Link
            href="/matches"
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Potential Matches
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-100">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">{totalMatchesCount}</p>
            <p className="mt-1 text-xs text-slate-500">Complementary partners</p>
          </Link>
        </div>

        {/* Informational Exchange Banner */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
              💡
            </span>
            <div className="text-xs leading-relaxed text-slate-700 sm:text-sm">
              <span className="font-semibold text-slate-900">How SkillSwap Works: </span>
              A farmer needs packaging design. A graphic designer needs organic vegetables. Rather than spending scarce cash, they exchange complementary services directly.
            </div>
          </div>
        </div>

        {/* Main Grid: Recommended Matches + Recent Activity */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recommended Matches (2 Columns) */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recommended for You</h2>
                <p className="text-xs text-slate-500">
                  Entrepreneurs whose offers and needs match yours right now.
                </p>
              </div>
              <Link
                href="/matches"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <span>View All Matches</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recommendedMatches.length === 0 && oneWayMatches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-2xl">🌱</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  No recommended matches yet
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                  Post both an offer and a need so our rule-based matching engine can discover two-way exchange partners for you.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Link
                    href="/offer/new"
                    className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Post an Offer
                  </Link>
                  <Link
                    href="/need/new"
                    className="rounded-xl border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Post a Need
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendedMatches.map((m) => (
                  <div
                    key={m.partner.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-200 hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                          {m.partner.avatarUrl ? (
                            <img
                              src={m.partner.avatarUrl}
                              alt={m.partner.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            m.partner.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{m.partner.name}</p>
                          <p className="text-xs text-slate-500">
                            {m.partner.business} · {m.partner.location}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                        ⚡ Two-Way Match
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
                      <div className="rounded-xl bg-emerald-50/70 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          They Can Offer
                        </span>
                        <p className="mt-1 font-medium text-slate-800">
                          {m.theyHelpYou[0].offer.title}
                        </p>
                      </div>
                      <div className="rounded-xl bg-rose-50/70 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                          They Need
                        </span>
                        <p className="mt-1 font-medium text-slate-800">
                          {m.youHelpThem[0].need.title}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Why this works: </span>
                      They offer what you need ({m.theyHelpYou[0].need.title}) and need what you offer ({m.youHelpThem[0].offer.title}).
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                      <Link
                        href={`/profile/${m.partner.username || m.partner.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View Full Profile</span>
                      </Link>
                      <div className="flex gap-2">
                        <Link
                          href={`/messages?partnerId=${m.partner.id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-emerald-700" />
                          <span>Message</span>
                        </Link>
                        <RequestButton listing={m.theyHelpYou[0].offer} />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Additional one-way matches if fewer mutual */}
                {recommendedMatches.length < 2 &&
                  oneWayMatches.map((m) => (
                    <div
                      key={`oneway-${m.partner.id}-${m.offer.id}`}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800">
                            {m.partner.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{m.partner.name}</p>
                            <p className="text-xs text-slate-500">
                              {m.partner.business} · {m.partner.location}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800">
                          Potential Helper
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-slate-600">
                        Offers: <span className="font-semibold">{m.offer.title}</span> (answers your need &ldquo;{m.need.title}&rdquo;)
                      </p>
                      <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-2">
                        <RequestButton listing={m.offer} />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Right Column: Quick Actions + Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href="/offer/new"
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-center transition hover:border-emerald-300 hover:bg-emerald-50/40"
                >
                  <PlusCircle className="h-5 w-5 text-emerald-700" />
                  <span className="mt-1 text-xs font-semibold text-slate-800">Create Offer</span>
                </Link>
                <Link
                  href="/need/new"
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-center transition hover:border-emerald-300 hover:bg-emerald-50/40"
                >
                  <ClipboardList className="h-5 w-5 text-rose-600" />
                  <span className="mt-1 text-xs font-semibold text-slate-800">Post a Need</span>
                </Link>
                <Link
                  href="/find"
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-center transition hover:border-emerald-300 hover:bg-emerald-50/40"
                >
                  <Compass className="h-5 w-5 text-teal-700" />
                  <span className="mt-1 text-xs font-semibold text-slate-800">Explore Skills</span>
                </Link>
                <Link
                  href="/collaborations"
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-center transition hover:border-emerald-300 hover:bg-emerald-50/40"
                >
                  <Handshake className="h-5 w-5 text-amber-600" />
                  <span className="mt-1 text-xs font-semibold text-slate-800">Collaborations</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                <Link
                  href="/collaborations"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  View All
                </Link>
              </div>

              {recentActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <p>No recent activity yet.</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Send a proposal or publish listings to see events here.
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {recentActivities.slice(0, 5).map((act) => {
                    const Icon = act.icon;
                    return (
                      <div key={act.id} className="flex items-start gap-3 text-xs">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800">{act.title}</p>
                          <p className="truncate text-slate-500">{act.description}</p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {new Date(act.time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
