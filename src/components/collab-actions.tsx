"use client";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  completed: "Completed",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  declined: "bg-rose-100 text-rose-700",
  completed: "bg-sky-100 text-sky-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[status] ?? "bg-slate-100 text-slate-600"}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export default function CollabActions({
  collab,
  currentUserId,
}: {
  collab: { id: number; status: string; providerId: number; requesterId: number };
  currentUserId: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  async function update(status: string) {
    const res = await fetch(`/api/collaborations/${collab.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      showToast(
        status === "accepted"
          ? "Request accepted! 🎉"
          : status === "declined"
            ? "Request declined."
            : "Collaboration marked as completed! ⭐"
      );
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error || "Something went wrong.", "error");
    }
  }

  if (collab.status === "pending" && collab.providerId === currentUserId) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => update("accepted")}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
        >
          Accept
        </button>
        <button
          onClick={() => update("declined")}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Decline
        </button>
      </div>
    );
  }

  if (collab.status === "accepted") {
    return (
      <button
        onClick={() => update("completed")}
        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
      >
        Mark as completed
      </button>
    );
  }

  if (collab.status === "completed") {
    return <span className="text-xs font-medium text-sky-700">✓ Collaboration done</span>;
  }

  return <StatusBadge status={collab.status} />;
}
