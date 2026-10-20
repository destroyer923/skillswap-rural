import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SESSION_COOKIE } from "@/lib/auth";

export async function requireAdminUser() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [user] = await db.select().from(users).where(eq(users.id, Number(raw)));
  if (!user || !user.isActive || user.role !== "admin") return null;
  return user;
}
