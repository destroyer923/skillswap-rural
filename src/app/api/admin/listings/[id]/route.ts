import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminUser } from "@/lib/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminUser();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });

  const { id } = await params;
  const [listing] = await db.select().from(listings).where(eq(listings.id, Number(id)));
  if (!listing) return Response.json({ error: "Listing not found." }, { status: 404 });

  const body = await req.json();
  if (body.status !== "active" && body.status !== "closed") {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }

  await db.update(listings).set({ status: body.status }).where(eq(listings.id, listing.id));
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminUser();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });

  const { id } = await params;
  const [listing] = await db.select().from(listings).where(eq(listings.id, Number(id)));
  if (!listing) return Response.json({ error: "Listing not found." }, { status: 404 });

  await db.delete(listings).where(eq(listings.id, listing.id));
  return Response.json({ ok: true });
}
