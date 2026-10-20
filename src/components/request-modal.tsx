"use client";

import { useState } from "react";
import Modal from "@/components/modal";
import { useToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import type { ListingWithOwner } from "@/lib/data";
import { Handshake } from "lucide-react";

export default function RequestModal({
  open,
  onClose,
  listing,
}: {
  open: boolean;
  onClose: () => void;
  listing: ListingWithOwner;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const [offerInReturn, setOfferInReturn] = useState("");
  const [loading, setLoading] = useState(false);

  const isOffer = listing.type === "offer";

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/collaborations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: listing.id,
        message,
        requesterCommitment: offerInReturn,
      }),
    });
    setLoading(false);
    if (res.ok) {
      showToast(
        isOffer
          ? `Exchange proposal sent to ${listing.owner.name}!`
          : `Offer of help sent to ${listing.owner.name}!`
      );
      onClose();
      setMessage("");
      setOfferInReturn("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error || "Could not send proposal.", "error");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isOffer ? `Propose Exchange with ${listing.owner.name}` : `Offer Help to ${listing.owner.name}`}
    >
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs">
        <p className="font-bold text-slate-800">{listing.title}</p>
        <p className="text-slate-500">
          {listing.owner.business} · {listing.owner.location}
        </p>
      </div>

      <div className="mt-4 space-y-3 text-xs">
        <div>
          <label className="mb-1 block font-semibold text-slate-700">
            What Can You Provide in Return? (Optional)
          </label>
          <input
            value={offerInReturn}
            onChange={(e) => setOfferInReturn(e.target.value)}
            placeholder="e.g. 5 hours of website setup, 20kg organic wheat, packaging design..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div>
          <label className="mb-1 block font-semibold text-slate-700">
            Proposal Message & Introduction
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi ${listing.owner.name.split(" ")[0]}, I saw your ${listing.type} and would love to collaborate on...`}
            rows={4}
            maxLength={500}
            className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3">
        <button
          onClick={onClose}
          className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-60"
        >
          <Handshake className="h-4 w-4" />
          <span>{loading ? "Sending Proposal..." : "Send Proposal"}</span>
        </button>
      </div>
    </Modal>
  );
}
