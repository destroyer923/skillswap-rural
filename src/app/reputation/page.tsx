import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  getReputationStats,
  getReviewsGivenByUser,
  getCollaborationsForUser,
  getMyReviewIds,
} from "@/lib/data";
import DashboardShell from "@/components/dashboard-shell";
import ReviewButton from "@/components/review-button";
import { Star, Award, MessageSquare, CheckCircle2, Clock } from "lucide-react";

export default async function ReputationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const currentTab = typeof sp.tab === "string" ? sp.tab : "received";

  const [stats, reviewsGiven, collabs, reviewedIds] = await Promise.all([
    getReputationStats(user.id),
    getReviewsGivenByUser(user.id),
    getCollaborationsForUser(user.id),
    getMyReviewIds(user.id),
  ]);

  // Find completed collaborations where current user hasn't left a review yet
  const pendingReviews = collabs.filter(
    (c) => c.status === "completed" && !reviewedIds.has(c.id)
  );

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Star className="h-5 w-5 fill-amber-600 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Reviews & Reputation
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Build community trust through successful, verified skill and resource exchanges.
          </p>
        </div>

        {/* Reputation Overview Card */}
        <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:grid-cols-12 sm:p-8">
          {/* Left score highlight */}
          <div className="flex flex-col items-center justify-center border-b border-slate-100 pb-6 sm:col-span-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
            <span className="text-5xl font-black text-slate-900">
              {stats.average > 0 ? stats.average.toFixed(1) : "—"}
            </span>
            <div className="mt-2 flex text-amber-400 text-lg">
              {"★".repeat(Math.round(stats.average || 0))}
              <span className="text-slate-200">
                {"★".repeat(5 - Math.round(stats.average || 0))}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-600">
              Based on {stats.total} verified {stats.total === 1 ? "review" : "reviews"}
            </p>
          </div>

          {/* Right rating distribution */}
          <div className="sm:col-span-8 flex flex-col justify-center space-y-2 text-xs">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.distribution[stars] || 0;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="w-12 font-semibold text-slate-600">{stars} stars</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-4">
            <Link
              href="/reputation?tab=received"
              className={`relative pb-3 text-xs font-bold transition ${
                currentTab === "received"
                  ? "text-emerald-800 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Reviews Received</span>
              <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {stats.total}
              </span>
            </Link>

            <Link
              href="/reputation?tab=given"
              className={`relative pb-3 text-xs font-bold transition ${
                currentTab === "given"
                  ? "text-emerald-800 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Reviews Given</span>
              <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {reviewsGiven.length}
              </span>
            </Link>

            <Link
              href="/reputation?tab=pending"
              className={`relative pb-3 text-xs font-bold transition ${
                currentTab === "pending"
                  ? "text-emerald-800 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Pending Reviews</span>
              {pendingReviews.length > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {pendingReviews.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Tab Content */}
        {currentTab === "received" && (
          <div className="space-y-3">
            {stats.reviews.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
                <p className="font-semibold text-slate-700">No reviews received yet</p>
                <p className="mt-1 text-slate-400">
                  Complete collaborations with partners to build your community reputation and receive reviews.
                </p>
              </div>
            ) : (
              stats.reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{r.reviewerName}</p>
                      <p className="text-xs text-slate-500">{r.reviewerBusiness}</p>
                    </div>
                    <div className="flex text-amber-400 text-sm">
                      {"★".repeat(r.rating)}
                      <span className="text-slate-200">{"★".repeat(5 - r.rating)}</span>
                    </div>
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-700 italic">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  )}
                  <p className="mt-3 text-[10px] text-slate-400">
                    Submitted on {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {currentTab === "given" && (
          <div className="space-y-3">
            {reviewsGiven.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
                <p className="font-semibold text-slate-700">No reviews given yet</p>
                <p className="mt-1 text-slate-400">
                  Reviews you submit for completed collaborations will appear here.
                </p>
              </div>
            ) : (
              reviewsGiven.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Review for {r.revieweeName}
                      </p>
                      <p className="text-xs text-slate-500">{r.revieweeBusiness}</p>
                    </div>
                    <div className="flex text-amber-400 text-sm">
                      {"★".repeat(r.rating)}
                      <span className="text-slate-200">{"★".repeat(5 - r.rating)}</span>
                    </div>
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-700 italic">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  )}
                  <p className="mt-3 text-[10px] text-slate-400">
                    Reviewed on {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {currentTab === "pending" && (
          <div className="space-y-3">
            {pendingReviews.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                <p className="mt-2 font-semibold text-slate-700">No pending reviews</p>
                <p className="mt-1 text-slate-400">
                  You have reviewed all completed collaborations. Great job keeping community trust high!
                </p>
              </div>
            ) : (
              pendingReviews.map((c) => {
                const partnerName =
                  c.requesterId === user.id ? c.provider.name : c.requester.name;
                return (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-2xs"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Completed Exchange: &ldquo;{c.listingTitle}&rdquo;
                      </p>
                      <p className="text-xs text-slate-600">
                        Partner: <span className="font-semibold">{partnerName}</span> · Completed on{" "}
                        {new Date(c.updatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <ReviewButton collaborationId={c.id} revieweeName={partnerName} />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
