import { cookies } from "next/headers";
import { db } from "@/db";
import { collaborations, listings, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { SESSION_COOKIE } from "@/lib/auth";

async function getCurrentUser() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [user] = await db.select().from(users).where(eq(users.id, Number(raw)));
  return user ?? null;
}

export async function GET() {
  return Response.json({ ok: true });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json();
  const { listingId, message, requesterCommitment } = body;
  if (!listingId) return Response.json({ error: "Listing ID is required." }, { status: 400 });

  const [listing] = await db.select().from(listings).where(eq(listings.id, Number(listingId)));
  if (!listing) return Response.json({ error: "Listing not found." }, { status: 404 });
  if (listing.userId === user.id) {
    return Response.json({ error: "You cannot request collaboration on your own listing." }, { status: 400 });
  }
  if (listing.status !== "active") {
    return Response.json({ error: "This listing is no longer active." }, { status: 400 });
  }

  const existing = await db
    .select({ id: collaborations.id })
    .from(collaborations)
    .where(
      and(
        eq(collaborations.requesterId, user.id),
        eq(collaborations.listingId, listing.id),
        eq(collaborations.status, "pending")
      )
    );
  if (existing.length) {
    return Response.json({ error: "You already have a pending request for this listing." }, { status: 409 });
  }

  await db.insert(collaborations).values({
    requesterId: user.id,
    providerId: listing.userId,
    listingId: listing.id,
    message: message?.trim() || null,
    requesterCommitment: requesterCommitment?.trim() || null,
  });

  return Response.json({ ok: true });
}
