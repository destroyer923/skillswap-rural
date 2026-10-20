import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { toPublicUser, type PublicUser } from "@/lib/data";

export const SESSION_COOKIE = "skillswap_session";

export async function getSessionUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [user] = await db.select().from(users).where(eq(users.id, Number(raw)));
  if (!user || !user.isActive) return null;
  return toPublicUser(user);
}

export async function requireUser(): Promise<PublicUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<PublicUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
