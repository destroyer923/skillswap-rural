import { cookies } from "next/headers";
import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { SESSION_COOKIE } from "@/lib/auth";
import { KINDS, EXCHANGE_TYPES } from "@/lib/constants";

async function getCurrentUser() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [user] = await db.select().from(users).where(eq(users.id, Number(raw)));
  return user ?? null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db
    .select({ listing: listings, owner: users })
    .from(listings)
    .innerJoin(users, eq(listings.userId, users.id))
    .where(eq(listings.id, Number(id)));
  if (!row) return Response.json({ error: "Listing not found." }, { status: 404 });
  return Response.json({ ...row.listing, owner: { ...row.owner, passwordHash: undefined } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  const [listing] = await db.select().from(listings).where(eq(listings.id, Number(id)));
  if (!listing) return Response.json({ error: "Listing not found." }, { status: 404 });
  if (listing.userId !== user.id) {
    return Response.json({ error: "You can only edit your own listings." }, { status: 403 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (typeof body.title === "string" && body.title.trim()) updates.title = body.title.trim();
  if (typeof body.description === "string" && body.description.trim()) updates.description = body.description.trim();
  if (typeof body.category === "string" && body.category.trim()) updates.category = body.category.trim();
  if (typeof body.tags === "string") updates.tags = body.tags.trim() || null;
  if (body.status === "active" || body.status === "closed") updates.status = body.status;
  if (typeof body.lifecycleStatus === "string") updates.lifecycleStatus = body.lifecycleStatus;
  if (typeof body.imageUrl === "string") updates.imageUrl = body.imageUrl.trim() || null;
  if (typeof body.location === "string") updates.location = body.location.trim() || null;
  if (typeof body.availability === "string") updates.availability = body.availability.trim() || null;
  if (typeof body.whatProvided === "string") updates.whatProvided = body.whatProvided.trim() || null;
  if (typeof body.whatWanted === "string") updates.whatWanted = body.whatWanted.trim() || null;
  if ((KINDS as readonly string[]).includes(body.kind)) updates.kind = body.kind;
  if ((EXCHANGE_TYPES as readonly string[]).includes(body.exchangeType)) updates.exchangeType = body.exchangeType;

  if (!Object.keys(updates).length) {
    return Response.json({ error: "No valid fields to update." }, { status: 400 });
  }

  await db.update(listings).set(updates).where(eq(listings.id, listing.id));
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  const [listing] = await db.select().from(listings).where(eq(listings.id, Number(id)));
  if (!listing) return Response.json({ error: "Listing not found." }, { status: 404 });
  if (listing.userId !== user.id) {
    return Response.json({ error: "You can only delete your own listings." }, { status: 403 });
  }

  await db.delete(listings).where(eq(listings.id, listing.id));
  return Response.json({ ok: true });
}
