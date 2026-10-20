import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SESSION_COOKIE } from "@/lib/auth";
import { CATEGORIES } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, business, email, password, location, category } = body;

    if (!name || !business || !email || !password || !location || !category) {
      return Response.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    if (!CATEGORIES.includes(category)) {
      return Response.json({ error: "Invalid category." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail));
    if (existing.length) {
      return Response.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const [user] = await db
      .insert(users)
      .values({ name: name.trim(), business: business.trim(), email: normalizedEmail, passwordHash, location: location.trim(), category })
      .returning({ id: users.id });

    const store = await cookies();
    store.set(SESSION_COOKIE, String(user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
