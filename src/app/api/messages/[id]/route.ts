import { cookies } from "next/headers";
import { db } from "@/db";
import { conversations, messages, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { SESSION_COOKIE } from "@/lib/auth";
import { getConversationWithMessages } from "@/lib/data";

async function getCurrentUser() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [user] = await db.select().from(users).where(eq(users.id, Number(raw)));
  return user ?? null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const convId = Number(id);

  const data = await getConversationWithMessages(convId, user.id);
  if (!data) return Response.json({ error: "Conversation not found" }, { status: 404 });

  // Mark all unread messages from partner as read
  await db
    .update(messages)
    .set({ isRead: true })
    .where(and(eq(messages.conversationId, convId), sql`${messages.senderId} != ${user.id}`));

  return Response.json(data);
}
