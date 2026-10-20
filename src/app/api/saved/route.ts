import { cookies } from "next/headers";
import { db } from "@/db";
import { savedListings, listings, users } from "@/db/schema";
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
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const rows = await db
    .select({ listingId: savedListings.listingId })
    .from(savedListings)
    .where(eq(savedListings.userId, user.id));

  return Response.json({ savedIds: rows.map((r) => r.listingId) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const body = await req.json();
    const { listingId } = body;
    if (!listingId) return Response.json({ error: "listingId is required" }, { status: 400 });

    const numId = Number(listingId);

    // Check if already saved
    const [existing] = await db
      .select()
      .from(savedListings)
      .where(and(eq(savedListings.userId, user.id), eq(savedListings.listingId, numId)));

    if (existing) {
      await db
        .delete(savedListings)
        .where(and(eq(savedListings.userId, user.id), eq(savedListings.listingId, numId)));
      return Response.json({ saved: false });
    } else {
      await db.insert(savedListings).values({
        userId: user.id,
        listingId: numId,
      });
      return Response.json({ saved: true });
    }
  } catch (err) {
    console.error("Save listing error:", err);
    return Response.json({ error: "Failed to update saved listing" }, { status: 500 });
  }
}
