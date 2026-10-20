import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { toPublicUser, type ListingWithOwner, type PublicUser } from "@/lib/data";
import { KINDS, EXCHANGE_TYPES } from "@/lib/constants";

/**
 * SkillSwap Rural — Matching System
 * ---------------------------------
 * No AI, no ML. Pure deterministic scoring over categories, keywords and location,
 * plus graph traversal to find multi-person "exchange circles".
 *
 * A directed edge A -> B means: "A has a NEED that B's OFFER can satisfy."
 * A circle is a loop that starts and ends at the same entrepreneur, e.g.
 *   Raj needs packaging -> Priya offers packaging
 *   Priya needs photos  -> Sameer offers photos
 *   Sameer needs produce-> Raj offers produce   (circle closes!)
 */

export {
  KINDS,
  EXCHANGE_TYPES,
  KIND_LABEL,
  KIND_EMOJI,
  EXCHANGE_LABEL,
  EXCHANGE_SHORT,
} from "@/lib/constants";

/** Score at or above which an offer is considered able to satisfy a need. */
export const MATCH_THRESHOLD = 36;

/**
 * Circles need a stricter bar than plain match suggestions, because every link in
 * the chain has to be believable — a weak link makes the whole circle nonsense.
 */
export const CIRCLE_THRESHOLD = 60;

/**
 * Words that carry no matching signal. Two groups:
 *  - ordinary English filler
 *  - platform/business boilerplate that appears in almost every listing
 *    ("small business", "rural entrepreneurs", "barter", "happy to help").
 * Without filtering these, unrelated people match on shared clichés.
 * Domain words (packaging, organic, photography, website...) are deliberately kept.
 */
const STOPWORDS = new Set([
  // English filler
  "the","a","an","and","or","for","with","to","of","in","on","my","i","we","you","is","are",
  "can","need","help","want","our","your","it","at","from","be","will","would","like","am",
  "also","just","very","really","more","some","any","other","others","every","each","able",
  "get","gets","make","makes","making","provide","providing","looking","work","working",
  "good","great","new","simple","proper","right","way","thing","things","someone","people",
  // Business / platform boilerplate
  "small","business","businesses","local","friendly","happy","available","team","quality",
  "fellow","rural","entrepreneur","entrepreneurs","community","platform","services","service",
  "barter","free","paid","trade","trading","settle","settled","money","instead","needs","wants",
  "offers","offer","weekly","daily","monthly","week","weeks","day","days","order","orders",
]);

/** Turn a listing into a set of comparable lowercase keywords. */
function keywords(l: ListingWithOwner): Set<string> {
  const out = new Set<string>();

  for (const raw of (l.tags ?? "").split(",")) {
    const t = raw.trim().toLowerCase();
    if (t) out.add(t);
  }

  const words = `${l.title} ${l.description}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/);
  for (const w of words) {
    if (w.length > 3 && !STOPWORDS.has(w)) out.add(w);
  }
  return out;
}

export type ScoreResult = { score: number; reasons: string[]; shared: string[] };

/**
 * How well does `offer` satisfy `need`?
 * Both must belong to different people.
 */
export function scoreMatch(offer: ListingWithOwner, need: ListingWithOwner): ScoreResult {
  if (offer.type !== "offer" || need.type !== "need") return { score: 0, reasons: [], shared: [] };
  if (offer.userId === need.userId) return { score: 0, reasons: [], shared: [] };

  const reasons: string[] = [];
  let score = 0;

  if (offer.category === need.category) {
    score += 40;
    reasons.push(`Same category · ${offer.category}`);
  }

  const offerKw = keywords(offer);
  const needKw = keywords(need);
  const shared = [...offerKw].filter((k) => needKw.has(k));
  if (shared.length) {
    score += Math.min(shared.length * 20, 60);
    reasons.push(`Shared keywords · ${shared.slice(0, 5).join(", ")}`);
  }

  if (offer.owner.location.toLowerCase() === need.owner.location.toLowerCase()) {
    score += 12;
    reasons.push(`Both in ${offer.owner.location}`);
  }

  if (offer.owner.ratingAvg > 0) {
    score += Math.round(offer.owner.ratingAvg * 1.5);
    reasons.push(`Rated ${offer.owner.ratingAvg.toFixed(1)}★`);
  }

  return { score, reasons, shared };
}

async function loadActiveListings(): Promise<ListingWithOwner[]> {
  const rows = await db
    .select({ listing: listings, owner: users })
    .from(listings)
    .innerJoin(users, eq(listings.userId, users.id))
    .where(and(eq(listings.status, "active"), eq(users.isActive, true)));
  return rows.map((r) => ({ ...r.listing, owner: toPublicUser(r.owner) }));
}

export type Match = {
  score: number;
  reasons: string[];
  partner: PublicUser;
  offer: ListingWithOwner;
  need: ListingWithOwner;
};

export type MatchReport = {
  /** Their offer can satisfy one of my needs — "they can help you" */
  theyCanHelpYou: Match[];
  /** My offer can satisfy one of their needs — "you can help them" */
  youCanHelpThem: Match[];
  /** Two-way: both of the above involve the same partner */
  mutual: { partner: PublicUser; theyHelpYou: Match[]; youHelpThem: Match[]; combinedScore: number }[];
};

/** Build the full match report for one entrepreneur. */
export async function getMatchesForUser(userId: number): Promise<MatchReport> {
  const all = await loadActiveListings();

  const myNeeds = all.filter((l) => l.type === "need" && l.userId === userId);
  const myOffers = all.filter((l) => l.type === "offer" && l.userId === userId);
  const otherOffers = all.filter((l) => l.type === "offer" && l.userId !== userId);
  const otherNeeds = all.filter((l) => l.type === "need" && l.userId !== userId);

  const theyCanHelpYou: Match[] = [];
  for (const need of myNeeds) {
    for (const offer of otherOffers) {
      const { score, reasons } = scoreMatch(offer, need);
      if (score >= MATCH_THRESHOLD) {
        theyCanHelpYou.push({ score, reasons, partner: offer.owner, offer, need });
      }
    }
  }

  const youCanHelpThem: Match[] = [];
  for (const need of otherNeeds) {
    for (const offer of myOffers) {
      const { score, reasons } = scoreMatch(offer, need);
      if (score >= MATCH_THRESHOLD) {
        youCanHelpThem.push({ score, reasons, partner: need.owner, offer, need });
      }
    }
  }

  theyCanHelpYou.sort((a, b) => b.score - a.score);
  youCanHelpThem.sort((a, b) => b.score - a.score);

  // Mutual = same partner shows up on both sides.
  const partnerIds = new Set([...theyCanHelpYou, ...youCanHelpThem].map((m) => m.partner.id));
  const mutual: MatchReport["mutual"] = [];
  for (const pid of partnerIds) {
    const theyHelpYou = theyCanHelpYou.filter((m) => m.partner.id === pid);
    const youHelpThem = youCanHelpThem.filter((m) => m.partner.id === pid);
    if (theyHelpYou.length && youHelpThem.length) {
      const partner = theyHelpYou[0].partner;
      mutual.push({
        partner,
        theyHelpYou,
        youHelpThem,
        combinedScore:
          Math.max(...theyHelpYou.map((m) => m.score)) + Math.max(...youHelpThem.map((m) => m.score)),
      });
    }
  }
  mutual.sort((a, b) => b.combinedScore - a.combinedScore);

  return { theyCanHelpYou, youCanHelpThem, mutual };
}

export type CircleStep = {
  from: PublicUser;
  to: PublicUser;
  need: ListingWithOwner;
  offer: ListingWithOwner;
  score: number;
};

export type ExchangeCircle = {
  key: string;
  members: number[];
  steps: CircleStep[];
  totalScore: number;
  includesMe: boolean;
};

/**
 * Find closed exchange circles across the whole community.
 * `maxLength` caps how many entrepreneurs a circle may involve (2..4 is realistic).
 */
export async function findExchangeCircles(
  userId?: number,
  maxLength = 4,
  limit = 8
): Promise<ExchangeCircle[]> {
  const all = await loadActiveListings();
  const offers = all.filter((l) => l.type === "offer");
  const needs = all.filter((l) => l.type === "need");

  // Edge A -> B : A has a need that B's offer satisfies.
  // Only the single strongest offer is kept per (A, B) pair, so a circle always
  // shows the most convincing reason each person helps the next.
  const best = new Map<string, CircleStep>();
  for (const need of needs) {
    for (const offer of offers) {
      if (offer.userId === need.userId) continue;
      const { score, shared } = scoreMatch(offer, need);
      if (score < CIRCLE_THRESHOLD) continue;
      // A circle is only shown if every link is believable. Keyword overlap pulled
      // from long descriptions can be misleading, so a cross-category link has to
      // prove itself with a much heavier overlap.
      const sameCategory = offer.category === need.category;
      if (!sameCategory && shared.length < 4) continue;
      const key = `${need.userId}->${offer.userId}`;
      const prev = best.get(key);
      if (!prev || score > prev.score) {
        best.set(key, { from: need.owner, to: offer.owner, need, offer, score });
      }
    }
  }

  const adj = new Map<number, CircleStep[]>();
  for (const step of best.values()) {
    const list = adj.get(step.from.id);
    if (list) list.push(step);
    else adj.set(step.from.id, [step]);
  }
  for (const list of adj.values()) list.sort((a, b) => b.score - a.score);

  const circles: ExchangeCircle[] = [];
  const seen = new Set<string>();

  function record(path: CircleStep[]) {
    const members = path.map((s) => s.from.id);
    const key = [...members].sort((a, b) => a - b).join("-");
    if (seen.has(key)) return;
    seen.add(key);
    circles.push({
      key,
      members,
      steps: path,
      totalScore: path.reduce((sum, s) => sum + s.score, 0),
      includesMe: userId !== undefined && members.includes(userId),
    });
  }

  function dfs(start: number, current: number, path: CircleStep[], visited: Set<number>) {
    if (path.length > maxLength) return;
    for (const step of adj.get(current) ?? []) {
      // Closing the loop back to where we started.
      if (step.to.id === start) {
        if (path.length >= 1) record([...path, step]);
        continue;
      }
      if (visited.has(step.to.id)) continue;
      visited.add(step.to.id);
      dfs(start, step.to.id, [...path, step], visited);
      visited.delete(step.to.id);
    }
  }

  // Start a search from every entrepreneur so circles are found even when the
  // viewer is only an intermediate member of the loop.
  for (const startId of adj.keys()) {
    dfs(startId, startId, [], new Set([startId]));
    if (circles.length > 200) break; // safety valve for large datasets
  }

  circles.sort((a, b) => {
    if (a.includesMe !== b.includesMe) return a.includesMe ? -1 : 1;
    if (a.steps.length !== b.steps.length) return a.steps.length - b.steps.length;
    return b.totalScore - a.totalScore;
  });

  return circles.slice(0, limit);
}
