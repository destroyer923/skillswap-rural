import { db } from "@/db";
import {
  listings,
  users,
  collaborations,
  reviews,
  savedListings,
  conversations,
  messages,
  collaborationMilestones,
} from "@/db/schema";
import { eq, and, or, ilike, desc, inArray, count, sql } from "drizzle-orm";
import { CATEGORIES } from "@/lib/constants";

export { CATEGORIES };

export type PublicUser = {
  id: number;
  name: string;
  business: string;
  email: string;
  location: string;
  category: string;
  role: "user" | "admin";
  ratingAvg: number;
  ratingCount: number;
  username?: string | null;
  bio?: string | null;
  occupation?: string | null;
  languages?: string | null;
  skills?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  phone?: string | null;
  isVerified?: boolean | null;
  publicEmail?: boolean | null;
  publicLocation?: boolean | null;
  publicSkills?: boolean | null;
  preferredLanguage?: string | null;
  theme?: string | null;
  notifyMessages?: boolean | null;
  notifyExchanges?: boolean | null;
  notifyMilestones?: boolean | null;
  notifyReviews?: boolean | null;
  createdAt?: Date;
};

export function toPublicUser(u: typeof users.$inferSelect): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = u;
  return rest;
}

export type ListingWithOwner = {
  id: number;
  userId: number;
  type: "offer" | "need";
  kind: "skill" | "service" | "resource";
  exchangeType: "barter" | "free" | "paid";
  title: string;
  description: string;
  category: string;
  tags: string | null;
  status: "active" | "closed";
  createdAt: Date;
  imageUrl?: string | null;
  location?: string | null;
  availability?: string | null;
  whatProvided?: string | null;
  whatWanted?: string | null;
  lifecycleStatus?: string | null;
  updatedAt?: Date | null;
  owner: PublicUser;
};

export type CollaborationWithPeople = {
  id: number;
  requesterId: number;
  providerId: number;
  listingId: number;
  message: string | null;
  status: "pending" | "accepted" | "declined" | "completed";
  createdAt: Date;
  updatedAt: Date;
  listingTitle: string;
  listingType: "offer" | "need";
  requesterConfirmed?: boolean | null;
  providerConfirmed?: boolean | null;
  requesterCommitment?: string | null;
  providerCommitment?: string | null;
  progress?: number | null;
  stage?: string | null;
  deliveryRequired?: boolean | null;
  deliveryMethod?: string | null;
  deliveryStatus?: string | null;
  deliveryNotes?: string | null;
  targetDate?: Date | null;
  completedAt?: Date | null;
  requester: Pick<PublicUser, "id" | "name" | "business" | "ratingAvg" | "ratingCount" | "avatarUrl">;
  provider: Pick<PublicUser, "id" | "name" | "business" | "ratingAvg" | "ratingCount" | "avatarUrl">;
};

export async function searchListings(opts: {
  type?: string;
  category?: string;
  q?: string;
  location?: string;
  limit?: number;
}): Promise<ListingWithOwner[]> {
  const conds = [eq(listings.status, "active")];
  if (opts.type === "offer" || opts.type === "need") {
    conds.push(eq(listings.type, opts.type));
  }
  if (opts.category && opts.category !== "All") {
    conds.push(eq(listings.category, opts.category));
  }
  if (opts.q) {
    const qTerm = `%${opts.q}%`;
    conds.push(
      or(
        ilike(listings.title, qTerm),
        ilike(listings.description, qTerm),
        ilike(listings.tags, qTerm),
        ilike(users.name, qTerm),
        ilike(users.business, qTerm)
      ) as any
    );
  }
  if (opts.location) {
    conds.push(
      or(
        ilike(users.location, `%${opts.location}%`),
        ilike(listings.location, `%${opts.location}%`)
      ) as any
    );
  }

  const rows = await db
    .select({ listing: listings, owner: users })
    .from(listings)
    .innerJoin(users, eq(listings.userId, users.id))
    .where(and(...conds))
    .orderBy(desc(listings.createdAt));

  const limited = opts.limit ? rows.slice(0, opts.limit) : rows;
  return limited.map((r) => ({ ...r.listing, owner: toPublicUser(r.owner) }));
}

export async function getListingById(id: number): Promise<ListingWithOwner | null> {
  const rows = await db
    .select({ listing: listings, owner: users })
    .from(listings)
    .innerJoin(users, eq(listings.userId, users.id))
    .where(eq(listings.id, id));
  if (!rows.length) return null;
  return { ...rows[0].listing, owner: toPublicUser(rows[0].owner) };
}

export async function getListingsByUser(
  userId: number,
  type?: "offer" | "need"
): Promise<ListingWithOwner[]> {
  const conds = [eq(listings.userId, userId)];
  if (type) conds.push(eq(listings.type, type));
  const rows = await db
    .select({ listing: listings, owner: users })
    .from(listings)
    .innerJoin(users, eq(listings.userId, users.id))
    .where(and(...conds))
    .orderBy(desc(listings.createdAt));
  return rows.map((r) => ({ ...r.listing, owner: toPublicUser(r.owner) }));
}

export async function getSavedListingIds(userId: number): Promise<Set<number>> {
  const rows = await db
    .select({ listingId: savedListings.listingId })
    .from(savedListings)
    .where(eq(savedListings.userId, userId));
  return new Set(rows.map((r) => r.listingId));
}

export async function getSavedListingsForUser(userId: number): Promise<ListingWithOwner[]> {
  const rows = await db
    .select({ listing: listings, owner: users, saved: savedListings })
    .from(savedListings)
    .innerJoin(listings, eq(savedListings.listingId, listings.id))
    .innerJoin(users, eq(listings.userId, users.id))
    .where(eq(savedListings.userId, userId))
    .orderBy(desc(savedListings.createdAt));

  return rows.map((r) => ({
    ...r.listing,
    owner: toPublicUser(r.owner),
  }));
}

export async function getCollaborationsForUser(userId: number): Promise<CollaborationWithPeople[]> {
  const rows = await db
    .select({
      id: collaborations.id,
      requesterId: collaborations.requesterId,
      providerId: collaborations.providerId,
      listingId: collaborations.listingId,
      message: collaborations.message,
      status: collaborations.status,
      createdAt: collaborations.createdAt,
      updatedAt: collaborations.updatedAt,
      requesterConfirmed: collaborations.requesterConfirmed,
      providerConfirmed: collaborations.providerConfirmed,
      requesterCommitment: collaborations.requesterCommitment,
      providerCommitment: collaborations.providerCommitment,
      progress: collaborations.progress,
      stage: collaborations.stage,
      deliveryRequired: collaborations.deliveryRequired,
      deliveryMethod: collaborations.deliveryMethod,
      deliveryStatus: collaborations.deliveryStatus,
      deliveryNotes: collaborations.deliveryNotes,
      targetDate: collaborations.targetDate,
      completedAt: collaborations.completedAt,
      listingTitle: listings.title,
      listingType: listings.type,
    })
    .from(collaborations)
    .innerJoin(listings, eq(collaborations.listingId, listings.id))
    .where(or(eq(collaborations.requesterId, userId), eq(collaborations.providerId, userId)))
    .orderBy(desc(collaborations.createdAt));

  if (!rows.length) return [];

  const userIds = [...new Set(rows.flatMap((r) => [r.requesterId, r.providerId]))];
  const userRows = await db
    .select({
      id: users.id,
      name: users.name,
      business: users.business,
      ratingAvg: users.ratingAvg,
      ratingCount: users.ratingCount,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(inArray(users.id, userIds));

  const userMap = new Map(userRows.map((u) => [u.id, u]));

  return rows.map((r) => ({
    ...r,
    requester: userMap.get(r.requesterId) || {
      id: r.requesterId,
      name: "Partner",
      business: "",
      ratingAvg: 0,
      ratingCount: 0,
      avatarUrl: null,
    },
    provider: userMap.get(r.providerId) || {
      id: r.providerId,
      name: "Partner",
      business: "",
      ratingAvg: 0,
      ratingCount: 0,
      avatarUrl: null,
    },
  }));
}

export async function getCollaborationById(id: number): Promise<CollaborationWithPeople | null> {
  const rows = await db
    .select({
      id: collaborations.id,
      requesterId: collaborations.requesterId,
      providerId: collaborations.providerId,
      listingId: collaborations.listingId,
      message: collaborations.message,
      status: collaborations.status,
      createdAt: collaborations.createdAt,
      updatedAt: collaborations.updatedAt,
      requesterConfirmed: collaborations.requesterConfirmed,
      providerConfirmed: collaborations.providerConfirmed,
      requesterCommitment: collaborations.requesterCommitment,
      providerCommitment: collaborations.providerCommitment,
      progress: collaborations.progress,
      stage: collaborations.stage,
      deliveryRequired: collaborations.deliveryRequired,
      deliveryMethod: collaborations.deliveryMethod,
      deliveryStatus: collaborations.deliveryStatus,
      deliveryNotes: collaborations.deliveryNotes,
      targetDate: collaborations.targetDate,
      completedAt: collaborations.completedAt,
      listingTitle: listings.title,
      listingType: listings.type,
    })
    .from(collaborations)
    .innerJoin(listings, eq(collaborations.listingId, listings.id))
    .where(eq(collaborations.id, id));
  if (!rows.length) return null;

  const userIds = [...new Set([rows[0].requesterId, rows[0].providerId])];
  const userRows = await db
    .select({
      id: users.id,
      name: users.name,
      business: users.business,
      ratingAvg: users.ratingAvg,
      ratingCount: users.ratingCount,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(inArray(users.id, userIds));
  const userMap = new Map(userRows.map((u) => [u.id, u]));

  return {
    ...rows[0],
    requester: userMap.get(rows[0].requesterId)!,
    provider: userMap.get(rows[0].providerId)!,
  };
}

export async function getMilestonesForCollaboration(collaborationId: number) {
  return await db
    .select()
    .from(collaborationMilestones)
    .where(eq(collaborationMilestones.collaborationId, collaborationId))
    .orderBy(desc(collaborationMilestones.createdAt));
}

export async function getMyReviewIds(userId: number): Promise<Set<number>> {
  const rows = await db
    .select({ collaborationId: reviews.collaborationId })
    .from(reviews)
    .where(eq(reviews.reviewerId, userId));
  return new Set(rows.map((r) => r.collaborationId));
}

export async function getReviewsForUser(userId: number) {
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      collaborationId: reviews.collaborationId,
      reviewerId: reviews.reviewerId,
      reviewerName: users.name,
      reviewerBusiness: users.business,
      reviewerAvatar: users.avatarUrl,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.reviewerId, users.id))
    .where(eq(reviews.revieweeId, userId))
    .orderBy(desc(reviews.createdAt));
  return rows;
}

export async function getReviewsGivenByUser(userId: number) {
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      collaborationId: reviews.collaborationId,
      revieweeId: reviews.revieweeId,
      revieweeName: users.name,
      revieweeBusiness: users.business,
      revieweeAvatar: users.avatarUrl,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.revieweeId, users.id))
    .where(eq(reviews.reviewerId, userId))
    .orderBy(desc(reviews.createdAt));
  return rows;
}

export async function getReputationStats(userId: number) {
  const received = await getReviewsForUser(userId);
  const total = received.length;
  const avg = total > 0 ? received.reduce((s, r) => s + r.rating, 0) / total : 0;
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of received) {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    }
  }
  return {
    total,
    average: Math.round(avg * 10) / 10,
    distribution,
    reviews: received,
  };
}

export async function getUserProfile(idOrUsername: number | string): Promise<PublicUser | null> {
  const query = typeof idOrUsername === "number"
    ? eq(users.id, idOrUsername)
    : eq(users.username, idOrUsername.toLowerCase());

  const [user] = await db.select().from(users).where(query);
  if (!user || !user.isActive) return null;
  return toPublicUser(user);
}

export async function getConversationsForUser(userId: number) {
  const rows = await db
    .select({
      id: conversations.id,
      participant1Id: conversations.participant1Id,
      participant2Id: conversations.participant2Id,
      listingId: conversations.listingId,
      collaborationId: conversations.collaborationId,
      lastMessage: conversations.lastMessage,
      lastMessageAt: conversations.lastMessageAt,
      createdAt: conversations.createdAt,
    })
    .from(conversations)
    .where(or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId)))
    .orderBy(desc(conversations.lastMessageAt));

  if (!rows.length) return [];

  const partnerIds = [
    ...new Set(rows.map((r) => (r.participant1Id === userId ? r.participant2Id : r.participant1Id))),
  ];

  const partnerRows = await db
    .select({
      id: users.id,
      name: users.name,
      business: users.business,
      location: users.location,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(inArray(users.id, partnerIds));

  const partnerMap = new Map(partnerRows.map((p) => [p.id, p]));

  // Get unread counts for current user in each conversation
  const unreadRows = await db
    .select({
      conversationId: messages.conversationId,
      unreadCount: count(),
    })
    .from(messages)
    .where(and(eq(messages.isRead, false), sql`${messages.senderId} != ${userId}`))
    .groupBy(messages.conversationId);

  const unreadMap = new Map(unreadRows.map((u) => [u.conversationId, Number(u.unreadCount)]));

  return rows.map((r) => {
    const partnerId = r.participant1Id === userId ? r.participant2Id : r.participant1Id;
    return {
      ...r,
      partner: partnerMap.get(partnerId) || {
        id: partnerId,
        name: "Community Member",
        business: "",
        location: "",
        avatarUrl: null,
      },
      unreadCount: unreadMap.get(r.id) || 0,
    };
  });
}

export async function getConversationWithMessages(conversationId: number, currentUserId: number) {
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
  if (!conv) return null;
  if (conv.participant1Id !== currentUserId && conv.participant2Id !== currentUserId) {
    return null; // Forbidden
  }

  const partnerId = conv.participant1Id === currentUserId ? conv.participant2Id : conv.participant1Id;
  const [partner] = await db
    .select({
      id: users.id,
      name: users.name,
      business: users.business,
      location: users.location,
      avatarUrl: users.avatarUrl,
      username: users.username,
    })
    .from(users)
    .where(eq(users.id, partnerId));

  let contextItem: { title: string; type: "listing" | "collaboration"; id: number } | null = null;
  if (conv.listingId) {
    const [l] = await db.select().from(listings).where(eq(listings.id, conv.listingId));
    if (l) contextItem = { title: l.title, type: "listing", id: l.id };
  } else if (conv.collaborationId) {
    const c = await getCollaborationById(conv.collaborationId);
    if (c) contextItem = { title: c.listingTitle, type: "collaboration", id: c.id };
  }

  const msgList = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);

  return {
    conversation: conv,
    partner,
    contextItem,
    messages: msgList,
  };
}

export async function getPlatformStats() {
  const [userRows, listingRows, collabRows, reviewRows] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(listings).where(eq(listings.status, "active")),
    db.select({ value: count() }).from(collaborations).where(eq(collaborations.status, "completed")),
    db.select({ value: count() }).from(reviews),
  ]);
  return {
    entrepreneurs: Number(userRows[0]?.value ?? 0),
    listings: Number(listingRows[0]?.value ?? 0),
    completedCollabs: Number(collabRows[0]?.value ?? 0),
    reviews: Number(reviewRows[0]?.value ?? 0),
  };
}
