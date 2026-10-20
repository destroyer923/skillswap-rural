"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import {
  Check,
  X,
  Truck,
  CheckCircle2,
  Clock,
  MessageCircle,
  Star,
  ChevronRight,
  Package,
  AlertCircle,
} from "lucide-react";
import type { CollaborationWithPeople } from "@/lib/data";
import ReviewButton from "@/components/review-button";
import Link from "next/link";

export default function ExchangeManager({
  collab,
  currentUserId,
  hasReviewed = false,
}: {
  collab: CollaborationWithPeople;
  currentUserId: number;
  hasReviewed?: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState(collab.deliveryStatus || "pending");
  const [deliveryMethod, setDeliveryMethod] = useState(collab.deliveryMethod || "handover");

  const isRequester = collab.requesterId === currentUserId;
  const isProvider = collab.providerId === currentUserId;
  const partner = isRequester ? collab.provider : collab.requester;

  const myConfirmed = isRequester ? collab.requesterConfirmed : collab.providerConfirmed;
  const partnerConfirmed = isRequester ? collab.providerConfirmed : collab.requesterConfirmed;

  const handleAction = async (action: string, payload: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/collaborations/${collab.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Exchange status updated successfully.", "success");
        router.refresh();
      } else {
        showToast(data.error || "Action failed.", "error");
      }
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-200 sm:p-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                collab.status === "completed"
                  ? "bg-emerald-100 text-emerald-800"
                  : collab.status === "accepted"
                  ? "bg-teal-100 text-teal-800"
                  : collab.status === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {collab.status.replace("_", " ")}
            </span>
            <span className="text-xs text-slate-400">
              ID #{collab.id} · {new Date(collab.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
            {collab.listingTitle}
          </h3>
        </div>

        {/* Partner Info */}
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-800">{partner.name}</p>
            <p className="text-[10px] text-slate-400">{partner.business}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
            {partner.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Proposal Message */}
      {collab.message && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Proposal note: </span>
          &ldquo;{collab.message}&rdquo;
        </div>
      )}

      {/* Reciprocal Commitments */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
          <p className="font-bold text-emerald-900">
            {isRequester ? "Your Commitment (Requester)" : `${collab.requester.name}'s Commitment`}
          </p>
          <p className="mt-1 text-slate-600">
            {collab.requesterCommitment ||
              "Agreed goods or skill exchange as per initial proposal."}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            {collab.requesterConfirmed ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Clock className="h-3.5 w-3.5" /> In progress
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3.5">
          <p className="font-bold text-teal-900">
            {isProvider ? "Your Commitment (Provider)" : `${collab.provider.name}'s Commitment`}
          </p>
          <p className="mt-1 text-slate-600">
            {collab.providerCommitment ||
              "Deliverable service or resource as requested in listing."}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            {collab.providerConfirmed ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Clock className="h-3.5 w-3.5" /> In progress
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Physical Delivery / Handover Tracking (for accepted & active exchanges) */}
      {collab.status === "accepted" && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-700" />
              <span className="font-semibold text-slate-800">Resource Delivery / Handover:</span>
              <span className="rounded-md bg-white px-2 py-0.5 font-bold uppercase text-slate-700 shadow-2xs">
                {deliveryStatus}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={loading}
                onClick={() => {
                  setDeliveryStatus("dispatched");
                  handleAction("update_delivery", { deliveryStatus: "dispatched" });
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  deliveryStatus === "dispatched"
                    ? "bg-amber-500 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Dispatched
              </button>
              <button
                disabled={loading}
                onClick={() => {
                  setDeliveryStatus("received");
                  handleAction("update_delivery", { deliveryStatus: "received" });
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  deliveryStatus === "received"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Received
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        {/* Chat Link */}
        <Link
          href={`/messages?partnerId=${partner.id}&collabId=${collab.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-emerald-800"
        >
          <MessageCircle className="h-3.5 w-3.5 text-emerald-700" />
          <span>Message Partner</span>
        </Link>

        {/* Contextual State Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {collab.status === "pending" && (
            <>
              {isProvider ? (
                <>
                  <button
                    disabled={loading}
                    onClick={() => handleAction("accept")}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Accept Proposal</span>
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleAction("decline")}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-300 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Decline</span>
                  </button>
                </>
              ) : (
                <button
                  disabled={loading}
                  onClick={() => handleAction("withdraw")}
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Withdraw Proposal
                </button>
              )}
            </>
          )}

          {collab.status === "accepted" && (
            <>
              {!myConfirmed ? (
                <button
                  disabled={loading}
                  onClick={() => handleAction("confirm_completion")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Confirm My Part Fulfilled</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>You confirmed · Waiting for partner</span>
                </span>
              )}
            </>
          )}

          {collab.status === "completed" && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <span>Exchange Completed</span>
              </span>
              {!hasReviewed && (
                <ReviewButton
                  collaborationId={collab.id}
                  revieweeName={partner.name}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
