"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/lib/toast";

async function patchJson(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || "Action failed.");
  }
}

export function UserRowActions({
  userId,
  role,
  isActive,
  isSelf,
}: {
  userId: number;
  role: string;
  isActive: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<void>, successMsg: string) {
    setBusy(true);
    try {
      await fn();
      showToast(successMsg);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Action failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={() =>
          run(
            () => patchJson(`/api/admin/users/${userId}`, { role: role === "admin" ? "user" : "admin" }),
            role === "admin" ? "User demoted." : "User promoted to admin."
          )
        }
        disabled={isSelf || busy}
        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
      >
        {role === "admin" ? "Demote" : "Make admin"}
      </button>
      <button
        onClick={() =>
          run(
            () => patchJson(`/api/admin/users/${userId}`, { isActive: !isActive }),
            isActive ? "User deactivated." : "User reactivated."
          )
        }
        disabled={isSelf || busy}
        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition disabled:opacity-40 ${
          isActive
            ? "border-rose-200 text-rose-600 hover:bg-rose-50"
            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        }`}
      >
        {isActive ? "Deactivate" : "Reactivate"}
      </button>
    </div>
  );
}

export function ListingRowActions({
  listingId,
  status,
}: {
  listingId: number;
  status: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<void>, successMsg: string) {
    setBusy(true);
    try {
      await fn();
      showToast(successMsg);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Action failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={() =>
          run(
            () => patchJson(`/api/admin/listings/${listingId}`, { status: status === "active" ? "closed" : "active" }),
            status === "active" ? "Listing closed." : "Listing reopened."
          )
        }
        disabled={busy}
        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
      >
        {status === "active" ? "Close" : "Reopen"}
      </button>
      <button
        onClick={() =>
          run(async () => {
            if (!confirm("Delete this listing permanently?")) return;
            const res = await fetch(`/api/admin/listings/${listingId}`, { method: "DELETE" });
            if (!res.ok) {
              const d = await res.json().catch(() => ({}));
              throw new Error(d.error || "Could not delete.");
            }
          }, "Listing deleted.")
        }
        disabled={busy}
        className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-40"
      >
        Delete
      </button>
    </div>
  );
}
