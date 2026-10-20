"use client";
import { useState } from "react";
import Modal from "@/components/modal";
import { InteractiveStars } from "@/components/star-rating";
import { useToast } from "@/lib/toast";
import { useRouter } from "next/navigation";

export default function ReviewModal({
  open,
  onClose,
  collaborationId,
  revieweeName,
}: {
  open: boolean;
  onClose: () => void;
  collaborationId: number;
  revieweeName: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collaborationId, rating, comment }),
    });
    setLoading(false);
    if (res.ok) {
      showToast(`Thanks for reviewing ${revieweeName}! ⭐`);
      onClose();
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error || "Could not submit review.", "error");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Review ${revieweeName}`}>
      <p className="text-sm text-slate-600">
        How was your collaboration with <span className="font-semibold text-slate-800">{revieweeName}</span>?
      </p>
      <div className="mt-3">
        <InteractiveStars value={rating} onChange={setRating} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share a few words about the collaboration (optional)"
        rows={3}
        maxLength={500}
        className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit review"}
        </button>
      </div>
    </Modal>
  );
}
