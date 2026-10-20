import { cookies } from "next/headers";
import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SESSION_COOKIE } from "@/lib/auth";
import { CATEGORIES, KINDS, EXCHANGE_TYPES } from "@/lib/constants";

async function getCurrentUser() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [user] = await db.select().from(users).where(eq(users.id, Number(raw)));
  return user ?? null;
}

// Server components fetch listings directly; this route is kept for future API consumers.
export async function GET() {
  return Response.json({ ok: true });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json();
  const {
    type,
    title,
    description,
    category,
    tags,
    kind,
    exchangeType,
    imageUrl,
    location,
    availability,
    whatProvided,
    whatWanted,
  } = body;

  if (type !== "offer" && type !== "need") {
    return Response.json({ error: "Invalid listing type." }, { status: 400 });
  }
  if (!title?.trim() || !description?.trim() || !category) {
    return Response.json({ error: "Title, description and category are required." }, { status: 400 });
  }
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    return Response.json({ error: "Invalid category." }, { status: 400 });
  }

  const resolvedKind = (KINDS as readonly string[]).includes(kind) ? kind : "skill";
  const resolvedExchange = (EXCHANGE_TYPES as readonly string[]).includes(exchangeType)
    ? exchangeType
    : "barter";

  const [listing] = await db
    .insert(listings)
    .values({
      userId: user.id,
      type,
      kind: resolvedKind,
      exchangeType: resolvedExchange,
      title: title.trim(),
      description: description.trim(),
      category,
      tags: tags?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      location: location?.trim() || null,
      availability: availability?.trim() || null,
      whatProvided: whatProvided?.trim() || null,
      whatWanted: whatWanted?.trim() || null,
    })
    .returning({ id: listings.id });

  return Response.json({ id: listing.id });
}
