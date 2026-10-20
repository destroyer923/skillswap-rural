"use client";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";

export default function ListingActions({
  listingId,
  status,
}: {
  listingId: number;
  status: "active" | "closed";
}) {
  const router = useRouter();
  const { showToast } = useToast();

  async function patch(data: Record<string, unknown>) {
    const res = await fetch(`/api/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      showToast(data.status === "closed" ? "Listing closed." : data.status === "active" ? "Listing reopened!" : "Listing deleted.");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      showToast(d.error || "Action failed.", "error");
    }
  }

  async function remove() {
    if (!confirm("Delete this listing permanently?")) return;
    const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Listing deleted.");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      showToast(d.error || "Could not delete.", "error");
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => patch({ status: status === "active" ? "closed" : "active" })}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        {status === "active" ? "Close" : "Reopen"}
      </button>
      <button
        onClick={remove}
        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
      >
        Delete
      </button>
    </div>
  );
}
