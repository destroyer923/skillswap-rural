"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/lib/toast";
import { CATEGORIES, KINDS, EXCHANGE_TYPES, KIND_LABEL, EXCHANGE_LABEL } from "@/lib/constants";
import { PlusCircle, ArrowLeft, Image as ImageIcon, Sparkles, HelpCircle } from "lucide-react";

export default function NewOfferPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    kind: KINDS[0],
    exchangeType: EXCHANGE_TYPES[0],
    tags: "",
    whatProvided: "",
    whatWanted: "",
    location: "",
    availability: "",
    imageUrl: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      showToast("Please fill in title and description.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "offer" }),
      });
      setLoading(false);
      if (res.ok) {
        showToast("Offer published successfully! Community members can now find it.", "success");
        router.push("/my-offers");
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || "Could not publish offer.", "error");
      }
    } catch {
      setLoading(false);
      showToast("Network error. Please try again.", "error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/my-offers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to My Offers</span>
      </Link>

      <div className="mt-4 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <PlusCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Post an Offer
            </h1>
            <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
              Share your skills, services, or harvest produce with fellow rural entrepreneurs.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-6">
        {/* Section A: Basic Info */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            1. Basic Information
          </h2>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Offer Title <span className="text-rose-500">*</span>
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Organic Produce Supply or Packaging & Label Design"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Classification Type
              </label>
              <select
                value={form.kind}
                onChange={(e) => update("kind", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Explain the skill, service, or resource you are offering in detail..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Exchange Settlement
              </label>
              <select
                value={form.exchangeType}
                onChange={(e) => update("exchangeType", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                {EXCHANGE_TYPES.map((x) => (
                  <option key={x} value={x}>
                    {EXCHANGE_LABEL[x]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Tags (comma separated keywords)
              </label>
              <input
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                placeholder="e.g. organic, packaging, design, produce"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>
        </div>

        {/* Section B: What Can You Provide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            2. Scope & What You Can Provide
          </h2>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Deliverables & Capacity Details
            </label>
            <textarea
              rows={3}
              value={form.whatProvided}
              onChange={(e) => update("whatProvided", e.target.value)}
              placeholder="e.g. Weekly supply of up to 20kg vegetables, or 2 logo concepts with 3 revision rounds..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Section C: What Would You Like in Return (Optional) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              3. What Would You Like in Return?
            </h2>
            <span className="text-[11px] font-medium text-slate-400">Optional</span>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Desired Exchange Preference
            </label>
            <input
              value={form.whatWanted}
              onChange={(e) => update("whatWanted", e.target.value)}
              placeholder="e.g. I would appreciate help with product photography or bookkeeping..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              You can still publish without specifying. This helps the Smart Matching engine find two-way matches.
            </p>
          </div>
        </div>

        {/* Section D: Photo & Availability */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            4. Photos & Availability
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Service Area / Location
              </label>
              <input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. Nashik District or Remote"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Availability / Timeframe
              </label>
              <input
                value={form.availability}
                onChange={(e) => update("availability", e.target.value)}
                placeholder="e.g. Weekends only, or Within 7 days"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Photo or Portfolio Image URL (optional)
            </label>
            <input
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
            {form.imageUrl && (
              <div className="mt-2 h-32 w-48 overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/my-offers"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{loading ? "Publishing..." : "Publish Offer"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
