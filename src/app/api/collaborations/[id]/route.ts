import { cookies } from "next/headers";
import { db } from "@/db";
import { collaborations, users, listings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { SESSION_COOKIE } from "@/lib/auth";

async function getCurrentUser() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [user] = await db.select().from(users).where(eq(users.id, Number(raw)));
  return user ?? null;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  const collabId = Number(id);
  const [collab] = await db.select().from(collaborations).where(eq(collaborations.id, collabId));
  if (!collab) return Response.json({ error: "Collaboration not found." }, { status: 404 });

  const isRequester = collab.requesterId === user.id;
  const isProvider = collab.providerId === user.id;

  if (!isRequester && !isProvider) {
    return Response.json({ error: "You are not a participant in this exchange." }, { status: 403 });
  }

  const body = await req.json();
  const {
    action,
    status,
    progress,
    deliveryStatus,
    deliveryMethod,
    deliveryNotes,
    requesterCommitment,
    providerCommitment,
  } = body;

  const updateData: Record<string, any> = { updatedAt: new Date() };

  if (action === "accept") {
    if (!isProvider) {
      return Response.json({ error: "Only the recipient can accept a request." }, { status: 403 });
    }
    if (collab.status !== "pending") {
      return Response.json({ error: "Request is not pending." }, { status: 400 });
    }
    updateData.status = "accepted";
    updateData.stage = "in_progress";
  } else if (action === "decline") {
    if (!isProvider) {
      return Response.json({ error: "Only the recipient can decline a request." }, { status: 403 });
    }
    if (collab.status !== "pending") {
      return Response.json({ error: "Request is not pending." }, { status: 400 });
    }
    updateData.status = "declined";
    updateData.stage = "cancelled";
  } else if (action === "withdraw" || action === "cancel") {
    if (collab.status === "completed") {
      return Response.json({ error: "Cannot cancel a completed exchange." }, { status: 400 });
    }
    updateData.status = "declined"; // maps to declined/cancelled
    updateData.stage = "cancelled";
  } else if (action === "confirm_completion") {
    if (isRequester) updateData.requesterConfirmed = true;
    if (isProvider) updateData.providerConfirmed = true;

    const reqConf = isRequester ? true : collab.requesterConfirmed;
    const provConf = isProvider ? true : collab.providerConfirmed;

    // Both parties confirmed, or if single provider
    if (reqConf && provConf) {
      updateData.status = "completed";
      updateData.stage = "completed";
      updateData.progress = 100;
      updateData.completedAt = new Date();
    } else {
      updateData.stage = "ready_for_confirmation";
    }
  } else if (action === "update_delivery") {
    if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;
    if (deliveryMethod) updateData.deliveryMethod = deliveryMethod;
    if (deliveryNotes !== undefined) updateData.deliveryNotes = deliveryNotes;
  } else if (action === "update_progress") {
    if (typeof progress === "number") {
      updateData.progress = Math.min(100, Math.max(0, progress));
      if (progress >= 100) {
        updateData.stage = "ready_for_confirmation";
      } else {
        updateData.stage = "in_progress";
      }
    }
  } else if (status) {
    // Legacy status update
    if (status === "accepted" || status === "declined") {
      if (!isProvider) {
        return Response.json({ error: "Only the recipient can respond." }, { status: 403 });
      }
    }
    updateData.status = status;
    if (status === "completed") {
      updateData.stage = "completed";
      updateData.completedAt = new Date();
    }
  }

  if (requesterCommitment !== undefined && isRequester) {
    updateData.requesterCommitment = requesterCommitment;
  }
  if (providerCommitment !== undefined && isProvider) {
    updateData.providerCommitment = providerCommitment;
  }

  await db.update(collaborations).set(updateData).where(eq(collaborations.id, collabId));

  return Response.json({ ok: true, ...updateData });
}
