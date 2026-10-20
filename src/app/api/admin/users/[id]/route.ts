import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminUser } from "@/lib/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminUser();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });

  const { id } = await params;
  const targetId = Number(id);
  if (targetId === admin.id) {
    return Response.json({ error: "You cannot change your own admin account." }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, targetId));
  if (!user) return Response.json({ error: "User not found." }, { status: 404 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.role === "user" || body.role === "admin") updates.role = body.role;
  if (typeof body.isActive === "boolean") updates.isActive = body.isActive;

  if (!Object.keys(updates).length) {
    return Response.json({ error: "No valid fields to update." }, { status: 400 });
  }

  await db.update(users).set(updates).where(eq(users.id, targetId));
  return Response.json({ ok: true });
}
