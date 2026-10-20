"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/lib/toast";
import { CATEGORIES, KINDS, EXCHANGE_TYPES, KIND_LABEL, EXCHANGE_LABEL } from "@/lib/constants";
import { ClipboardList, ArrowLeft, PlusCircle } from "lucide-react";

export default function NewNeedPage() {
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
    whatWanted: "",
    whatProvided: "",
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
      showToast("Please fill in the title and description.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "need" }),
      });
      setLoading(false);
      if (res.ok) {
        showToast("Need posted successfully! Others can now view and offer help.", "success");
        router.push("/my-needs");
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || "Could not post need.", "error");
      }
    } catch {
      setLoading(false);
      showToast("Network error. Please try again.", "error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/my-needs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to My Needs</span>
      </Link>

      <div className="mt-4 rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-orange-50/40 to-white p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-sm">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Post a Need
            </h1>
            <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
              Tell the community what skills, resources, or assistance your business needs.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-6">
        {/* Section 1: Basic Information */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            1. Need Information
          </h2>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Need Title <span className="text-rose-500">*</span>
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Eco-Friendly Packaging Design or Tractor Logistics Support"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
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
                Need Type
              </label>
              <select
                value={form.kind}
                onChange={(e) => update("kind", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
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
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe what you are looking for, your goals, and requirements..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
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
                Tags (comma separated)
              </label>
              <input
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                placeholder="e.g. packaging, seo, photography, tractor"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
              />
            </div>
          </div>
        </div>

        {/* Section 2: What Can You Offer in Exchange */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              2. What Can You Offer in Exchange?
            </h2>
            <span className="text-[11px] font-medium text-slate-400">Optional</span>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Your Reciprocal Offer (Goods, Time, or Skill)
            </label>
            <input
              value={form.whatProvided}
              onChange={(e) => update("whatProvided", e.target.value)}
              placeholder="e.g. Fresh farm produce, organic honey, or 10 hours of electrical help..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              You are welcome to post even if you have nothing specific in mind.
            </p>
          </div>
        </div>

        {/* Section 3: Preferred Location & Timeframe */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            3. Location & Timeframe
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Preferred Location
              </label>
              <input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. Nashik, Remote, or Nearby Villages"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Preferred Timeframe
              </label>
              <input
                value={form.availability}
                onChange={(e) => update("availability", e.target.value)}
                placeholder="e.g. Needed before harvest next month"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/my-needs"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{loading ? "Publishing..." : "Publish Need"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
