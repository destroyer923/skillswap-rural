import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
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
  if (!user) return Response.json({ error: "Not authenticated." }, { status: 401 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return Response.json(safe);
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
  if (typeof body.business === "string" && body.business.trim()) updates.business = body.business.trim();
  if (typeof body.location === "string" && body.location.trim()) updates.location = body.location.trim();
  if (typeof body.category === "string" && body.category.trim()) updates.category = body.category.trim();

  // Username validation & uniqueness
  if (typeof body.username === "string" && body.username.trim()) {
    const cleanUsername = body.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanUsername.length < 3) {
      return Response.json({ error: "Username must be at least 3 characters." }, { status: 400 });
    }
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, cleanUsername), ne(users.id, user.id)));
    if (existing) {
      return Response.json({ error: "This username is already taken." }, { status: 409 });
    }
    updates.username = cleanUsername;
  }

  if (typeof body.bio === "string") updates.bio = body.bio.trim() || null;
  if (typeof body.occupation === "string") updates.occupation = body.occupation.trim() || null;
  if (typeof body.languages === "string") updates.languages = body.languages.trim() || null;
  if (typeof body.skills === "string") updates.skills = body.skills.trim() || null;
  if (typeof body.avatarUrl === "string") updates.avatarUrl = body.avatarUrl.trim() || null;
  if (typeof body.coverUrl === "string") updates.coverUrl = body.coverUrl.trim() || null;
  if (typeof body.phone === "string") updates.phone = body.phone.trim() || null;

  if (typeof body.publicEmail === "boolean") updates.publicEmail = body.publicEmail;
  if (typeof body.publicLocation === "boolean") updates.publicLocation = body.publicLocation;
  if (typeof body.publicSkills === "boolean") updates.publicSkills = body.publicSkills;
  if (typeof body.preferredLanguage === "string") updates.preferredLanguage = body.preferredLanguage;
  if (typeof body.theme === "string") updates.theme = body.theme;

  if (typeof body.notifyMessages === "boolean") updates.notifyMessages = body.notifyMessages;
  if (typeof body.notifyExchanges === "boolean") updates.notifyExchanges = body.notifyExchanges;
  if (typeof body.notifyMilestones === "boolean") updates.notifyMilestones = body.notifyMilestones;
  if (typeof body.notifyReviews === "boolean") updates.notifyReviews = body.notifyReviews;

  if (!Object.keys(updates).length) {
    return Response.json({ error: "No valid fields to update." }, { status: 400 });
  }

  await db.update(users).set(updates).where(eq(users.id, user.id));
  return Response.json({ ok: true, updates });
}
