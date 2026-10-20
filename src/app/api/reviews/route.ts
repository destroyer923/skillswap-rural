import { cookies } from "next/headers";
import { db } from "@/db";
import { reviews, collaborations, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { SESSION_COOKIE } from "@/lib/auth";

async function getCurrentUser() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [user] = await db.select().from(users).where(eq(users.id, Number(raw)));
  return user ?? null;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json();
  const { collaborationId, rating, comment } = body;

  if (!collaborationId) return Response.json({ error: "Collaboration ID is required." }, { status: 400 });
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return Response.json({ error: "Rating must be a whole number between 1 and 5." }, { status: 400 });
  }

  const [collab] = await db.select().from(collaborations).where(eq(collaborations.id, Number(collaborationId)));
  if (!collab) return Response.json({ error: "Collaboration not found." }, { status: 404 });
  if (collab.status !== "completed") {
    return Response.json({ error: "Collaborations must be completed before reviewing." }, { status: 400 });
  }
  if (collab.requesterId !== user.id && collab.providerId !== user.id) {
    return Response.json({ error: "You are not part of this collaboration." }, { status: 403 });
  }

  const existing = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.collaborationId, collab.id), eq(reviews.reviewerId, user.id)));
  if (existing.length) {
    return Response.json({ error: "You have already reviewed this collaboration." }, { status: 409 });
  }

  const revieweeId = collab.requesterId === user.id ? collab.providerId : collab.requesterId;

  await db.insert(reviews).values({
    collaborationId: collab.id,
    reviewerId: user.id,
    revieweeId,
    rating: ratingNum,
    comment: comment?.trim() || null,
  });

  const [reviewee] = await db.select().from(users).where(eq(users.id, revieweeId));
  const newCount = reviewee.ratingCount + 1;
  const newAvg = (reviewee.ratingAvg * reviewee.ratingCount + ratingNum) / newCount;
  await db
    .update(users)
    .set({ ratingAvg: newAvg, ratingCount: newCount })
    .where(eq(users.id, revieweeId));

  return Response.json({ ok: true });
}
