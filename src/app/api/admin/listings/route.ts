import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdminUser } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });

  const rows = await db
    .select({ listing: listings, owner: users })
    .from(listings)
    .innerJoin(users, eq(listings.userId, users.id))
    .orderBy(desc(listings.createdAt));

  return Response.json(
    rows.map((r) => ({
      id: r.listing.id,
      userId: r.listing.userId,
      type: r.listing.type,
      title: r.listing.title,
      description: r.listing.description,
      category: r.listing.category,
      tags: r.listing.tags,
      status: r.listing.status,
      createdAt: r.listing.createdAt,
      owner: { id: r.owner.id, name: r.owner.name, business: r.owner.business, location: r.owner.location },
    }))
  );
}
