import { cookies } from "next/headers";
import { db } from "@/db";
import { conversations, messages, users, listings, collaborations } from "@/db/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { SESSION_COOKIE } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/data";

async function getCurrentUser() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [user] = await db.select().from(users).where(eq(users.id, Number(raw)));
  return user ?? null;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const convList = await getConversationsForUser(user.id);
  return Response.json({ conversations: convList });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const body = await req.json();
    const { conversationId, partnerId, listingId, collabId, text } = body;

    if (!text || !text.trim()) {
      return Response.json({ error: "Message text cannot be empty" }, { status: 400 });
    }

    let convId = conversationId ? Number(conversationId) : null;

    if (!convId) {
      if (!partnerId) {
        return Response.json({ error: "partnerId or conversationId required" }, { status: 400 });
      }
      const pId = Number(partnerId);
      if (pId === user.id) {
        return Response.json({ error: "You cannot message yourself" }, { status: 400 });
      }

      // Check for existing conversation between user and partner
      const [existing] = await db
        .select()
        .from(conversations)
        .where(
          or(
            and(eq(conversations.participant1Id, user.id), eq(conversations.participant2Id, pId)),
            and(eq(conversations.participant1Id, pId), eq(conversations.participant2Id, user.id))
          )
        );

      if (existing) {
        convId = existing.id;
      } else {
        const [created] = await db
          .insert(conversations)
          .values({
            participant1Id: user.id,
            participant2Id: pId,
            listingId: listingId ? Number(listingId) : null,
            collaborationId: collabId ? Number(collabId) : null,
            lastMessage: text.trim(),
            lastMessageAt: new Date(),
          })
          .returning({ id: conversations.id });
        convId = created.id;
      }
    } else {
      // Verify user is in conversation
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, convId));
      if (!conv || (conv.participant1Id !== user.id && conv.participant2Id !== user.id)) {
        return Response.json({ error: "Unauthorized conversation access" }, { status: 403 });
      }
    }

    // Insert message
    const [msg] = await db
      .insert(messages)
      .values({
        conversationId: convId,
        senderId: user.id,
        text: text.trim(),
        isRead: false,
      })
      .returning();

    // Update conversation metadata
    await db
      .update(conversations)
      .set({
        lastMessage: text.trim(),
        lastMessageAt: new Date(),
      })
      .where(eq(conversations.id, convId));

    return Response.json({ message: msg, conversationId: convId });
  } catch (err) {
    console.error("Post message error:", err);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
