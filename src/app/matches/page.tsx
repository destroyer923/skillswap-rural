import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getListingsByUser, getSavedListingIds } from "@/lib/data";
import {
  getMatchesForUser,
  findExchangeCircles,
  EXCHANGE_SHORT,
  KIND_EMOJI,
  MATCH_THRESHOLD,
  type Match,
} from "@/lib/matching";
import DashboardShell from "@/components/dashboard-shell";
import RequestButton from "@/components/request-button";
import { StarRating } from "@/components/star-rating";
import BookmarkButton from "@/components/bookmark-button";
import {
  Handshake,
  Flame,
  Target,
  Users,
  Repeat,
  Info,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  PlusCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

function strength(score: number) {
  return Math.min(100, Math.round((score / 120) * 100));
}

function MatchStrengthBadge({ score }: { score: number }) {
  const pct = strength(score);
  const color =
    pct >= 70
      ? "bg-emerald-500 text-white"
      : pct >= 45
      ? "bg-amber-400 text-amber-950"
      : "bg-slate-200 text-slate-700";

  return (
    <div className="flex items-center gap-1.5">
      <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            pct >= 70 ? "bg-emerald-600" : pct >= 45 ? "bg-amber-500" : "bg-slate-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-slate-700">{pct}% match</span>
    </div>
  );
}

function MatchReasons({ reasons }: { reasons: string[] }) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {reasons.slice(0, 4).map((r) => (
        <span
          key={r}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800"
        >
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          {r}
        </span>
      ))}
    </div>
  );
}

export default async function MatchesPage() {
  const user = await requireUser();
  const [report, circles, myListings, savedIds] = await Promise.all([
    getMatchesForUser(user.id),
    findExchangeCircles(user.id),
    getListingsByUser(user.id),
    getSavedListingIds(user.id),
  ]);

  const hasListings = myListings.length > 0;
  const myCircles = circles.filter((c) => c.includesMe);
  const otherCircles = circles.filter((c) => !c.includesMe);

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Handshake className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Smart Matches
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Discover people who need what you offer and can offer what you need.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/find"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              Explore All Listings
            </Link>
          </div>
        </div>

        {/* Summary Metric Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Mutual Matches
              </span>
              <Flame className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-amber-950">{report.mutual.length}</p>
            <p className="text-[11px] text-amber-800">Two-way reciprocity</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                They Can Help You
              </span>
              <Target className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-950">
              {report.theyCanHelpYou.length}
            </p>
            <p className="text-[11px] text-emerald-800">Offers for your needs</p>
          </div>

          <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
                You Can Help Them
              </span>
              <Users className="h-4 w-4 text-teal-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-teal-950">{report.youCanHelpThem.length}</p>
            <p className="text-[11px] text-teal-800">Needs you can meet</p>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                Exchange Circles
              </span>
              <Repeat className="h-4 w-4 text-purple-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-purple-950">{myCircles.length}</p>
            <p className="text-[11px] text-purple-800">Multi-person barter loops</p>
          </div>
        </div>

        {/* Empty listings nudge */}
        {!hasListings && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 text-center sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-900">Post an offer or need to start matching</h2>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-600">
              Our matching system compares your listings against other community entrepreneurs. Post at least one offer or need to unlock recommendations.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/offer/new"
                className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                Post an Offer
              </Link>
              <Link
                href="/need/new"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Post a Need
              </Link>
            </div>
          </div>
        )}

        {/* SECTION A & B: MUTUAL MATCHES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black text-amber-950">
                  MUTUAL MATCHES
                </span>
                <h2 className="text-lg font-bold text-slate-900">Two-Way Barter Opportunities</h2>
              </div>
              <p className="text-xs text-slate-500">
                &ldquo;I have what you need, and you have what I need.&rdquo; Ideal direct exchanges.
              </p>
            </div>
          </div>

          {report.mutual.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
              {hasListings
                ? "No direct two-way matches found yet. Check the one-way opportunities below or explore the community."
                : "Post both an offer and need to unlock two-way matches."}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {report.mutual.map((m) => (
                <div
                  key={m.partner.id}
                  className="rounded-3xl border-2 border-amber-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
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
                        <Link
                          href={`/profile/${m.partner.username || m.partner.id}`}
                          className="text-sm font-bold text-slate-900 hover:underline"
                        >
                          {m.partner.name}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {m.partner.business} · {m.partner.location}
                        </p>
                      </div>
                    </div>
                    <MatchStrengthBadge score={m.combinedScore} />
                  </div>

                  {/* Reciprocal Trade Cards */}
                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        They Provide to You
                      </span>
                      <p className="mt-1 font-semibold text-slate-900">
                        {m.theyHelpYou[0].offer.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Satisfies your need for &ldquo;{m.theyHelpYou[0].need.title}&rdquo;
                      </p>
                    </div>

                    <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                        You Provide in Return
                      </span>
                      <p className="mt-1 font-semibold text-slate-900">
                        {m.youHelpThem[0].offer.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Satisfies their need for &ldquo;{m.youHelpThem[0].need.title}&rdquo;
                      </p>
                    </div>
                  </div>

                  <MatchReasons
                    reasons={[...m.theyHelpYou[0].reasons, ...m.youHelpThem[0].reasons]}
                  />

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${m.partner.username || m.partner.id}`}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Profile
                      </Link>
                      <span className="text-slate-300">·</span>
                      <Link
                        href={`/messages?partnerId=${m.partner.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Chat</span>
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      <BookmarkButton
                        listingId={m.theyHelpYou[0].offer.id}
                        initialSaved={savedIds.has(m.theyHelpYou[0].offer.id)}
                      />
                      <RequestButton listing={m.theyHelpYou[0].offer} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION C: THEY CAN HELP YOU (ONE-WAY OPPORTUNITIES) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">They Can Help You</h2>
              <p className="text-xs text-slate-500">
                Entrepreneurs with active offers matching your posted needs.
              </p>
            </div>
          </div>

          {report.theyCanHelpYou.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
              No matching offers for your needs right now.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {report.theyCanHelpYou.map((m) => (
                <div
                  key={`help-${m.partner.id}-${m.offer.id}-${m.need.id}`}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-emerald-200 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                          {m.partner.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900">
                            {m.partner.name}
                          </p>
                          <p className="truncate text-[10px] text-slate-400">
                            {m.partner.business} · {m.partner.location}
                          </p>
                        </div>
                      </div>
                      <MatchStrengthBadge score={m.score} />
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="rounded-lg bg-rose-50/70 p-2 text-rose-900">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                          Your Need
                        </span>
                        <p className="font-semibold text-slate-900">{m.need.title}</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50/70 p-2 text-emerald-900">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          Their Offer
                        </span>
                        <p className="font-semibold text-slate-900">{m.offer.title}</p>
                      </div>
                    </div>

                    <MatchReasons reasons={m.reasons} />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <Link
                      href={`/messages?partnerId=${m.partner.id}&listingId=${m.offer.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-700"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Message</span>
                    </Link>
                    <RequestButton listing={m.offer} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION D: EXCHANGE CIRCLES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs font-bold text-white">
                  EXCHANGE CIRCLES
                </span>
                <h2 className="text-lg font-bold text-slate-900">Closed Barter Ecosystems</h2>
              </div>
              <p className="text-xs text-slate-500">
                Multi-person loops where each member&apos;s offer satisfies the next member&apos;s need. Zero cash required.
              </p>
            </div>
          </div>

          {myCircles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
              No exchange circle involving you yet. Once more members join complementary needs, loops form automatically.
            </div>
          ) : (
            <div className="space-y-4">
              {myCircles.map((circle) => (
                <div
                  key={circle.key}
                  className="rounded-3xl border-2 border-purple-200 bg-purple-50/40 p-5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white">
                      🔄 {circle.steps.length}-Person Circular Exchange
                    </span>
                    <span className="text-xs font-bold text-purple-800">
                      You are a key link in this chain!
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {circle.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-xl bg-white p-3 text-xs shadow-xs"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900">
                            {step.from.id === user.id ? `You (${step.from.name})` : step.from.name}{" "}
                            needs &ldquo;{step.need.title}&rdquo;
                          </p>
                          <p className="mt-0.5 text-slate-600">
                            &rarr; Fulfilled by{" "}
                            <span className="font-semibold text-emerald-700">
                              {step.to.id === user.id ? `You (${step.to.name})` : step.to.name}
                            </span>{" "}
                            offering &ldquo;{step.offer.title}&rdquo;
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 rounded-xl bg-purple-100 px-3 py-2 text-center text-xs font-medium text-purple-900">
                    The loop closes seamlessly! All {circle.steps.length} participants get what they need without exchanging a single rupee.
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Algorithm Transparency Card */}
        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-bold">Transparent Matching System</h3>
          </div>
          <p className="mt-2 text-xs text-slate-300">
            SkillSwap Rural uses a 100% deterministic, rule-based algorithm with zero black-box AI:
          </p>
          <div className="mt-3 grid gap-3 text-xs sm:grid-cols-4">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="font-bold text-emerald-300">+40 Points</p>
              <p className="mt-0.5 text-slate-300">Exact Category Match</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="font-bold text-emerald-300">+20 Points / Tag</p>
              <p className="mt-0.5 text-slate-300">Shared Domain Keywords</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="font-bold text-emerald-300">+12 Points</p>
              <p className="mt-0.5 text-slate-300">Same Town or District</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="font-bold text-emerald-300">+1.5 &times; &star;</p>
              <p className="mt-0.5 text-slate-300">Reputation & Review Score</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
