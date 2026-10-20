"use client";

import React, { useState } from "react";
import { Bookmark } from "lucide-react";
import { useToast } from "@/lib/toast";

export default function BookmarkButton({
  listingId,
  initialSaved = false,
  className = "",
}: {
  listingId: number;
  initialSaved?: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
        showToast(
          data.saved ? "Listing saved to your bookmarks." : "Listing removed from bookmarks.",
          "success"
        );
      } else if (res.status === 401) {
        showToast("Please log in to save listings.", "error");
      } else {
        showToast("Failed to update bookmark.", "error");
      }
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={saved ? "Remove from saved listings" : "Save listing"}
      title={saved ? "Saved" : "Save listing"}
      className={`inline-flex items-center justify-center rounded-xl p-2 transition ${
        saved
          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
      } ${className}`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-emerald-800 text-emerald-800" : ""}`} />
    </button>
  );
}
