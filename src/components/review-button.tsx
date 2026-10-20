"use client";
import { useState } from "react";
import ReviewModal from "@/components/review-modal";

export default function ReviewButton({
  collaborationId,
  revieweeName,
}: {
  collaborationId: number;
  revieweeName: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-semibold text-emerald-950 transition hover:bg-amber-300"
      >
        ⭐ Review
      </button>
      <ReviewModal
        open={open}
        onClose={() => setOpen(false)}
        collaborationId={collaborationId}
        revieweeName={revieweeName}
      />
    </>
  );
}
