"use client";

import { useState } from "react";
import RequestModal from "@/components/request-modal";
import type { ListingWithOwner } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Handshake } from "lucide-react";

export default function RequestButton({
  listing,
  className = "",
}: {
  listing: ListingWithOwner;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const isOffer = listing.type === "offer";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition",
          isOffer
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-rose-600 hover:bg-rose-700",
          className
        )}
      >
        <Handshake className="h-3.5 w-3.5" />
        <span>{isOffer ? "Propose Exchange" : "Offer Help"}</span>
      </button>
      <RequestModal open={open} onClose={() => setOpen(false)} listing={listing} />
    </>
  );
}
