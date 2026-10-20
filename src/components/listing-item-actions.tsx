"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import { Edit2, Power, Trash2, Eye } from "lucide-react";
import Link from "next/link";

export default function ListingItemActions({
  listingId,
  currentStatus,
  editUrl,
}: {
  listingId: number;
  currentStatus: "active" | "closed";
  editUrl: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    const nextStatus = currentStatus === "active" ? "closed" : "active";
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast(
          nextStatus === "active"
            ? "Listing activated and now visible."
            : "Listing deactivated and hidden from public discovery.",
          "success"
        );
        router.refresh();
      } else {
        showToast("Failed to update listing status.", "error");
      }
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Listing deleted successfully.", "success");
        router.refresh();
      } else {
        showToast("Failed to delete listing.", "error");
      }
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/listings/${listingId}`}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        title="View public listing"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <Link
        href={editUrl}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-700"
        title="Edit listing"
      >
        <Edit2 className="h-4 w-4" />
      </Link>
      <button
        onClick={toggleStatus}
        disabled={loading}
        className={`rounded-lg p-1.5 transition ${
          currentStatus === "active"
            ? "text-amber-600 hover:bg-amber-50"
            : "text-emerald-600 hover:bg-emerald-50"
        }`}
        title={currentStatus === "active" ? "Deactivate listing" : "Activate listing"}
      >
        <Power className="h-4 w-4" />
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
        title="Delete listing"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
