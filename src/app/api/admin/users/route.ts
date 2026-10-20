import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdminUser } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });

  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  return Response.json(
    allUsers.map((u) => ({
      id: u.id,
      name: u.name,
      business: u.business,
      email: u.email,
      location: u.location,
      category: u.category,
      role: u.role,
      isActive: u.isActive,
      ratingAvg: u.ratingAvg,
      ratingCount: u.ratingCount,
      createdAt: u.createdAt,
    }))
  );
}
