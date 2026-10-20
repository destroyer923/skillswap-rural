"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/lib/toast";
import { CATEGORIES, KINDS, EXCHANGE_TYPES, KIND_LABEL, EXCHANGE_LABEL } from "@/lib/constants";
import { ArrowLeft, Save } from "lucide-react";

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const id = Number(params.id);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    kind: KINDS[0],
    exchangeType: EXCHANGE_TYPES[0],
    tags: "",
    imageUrl: "",
    location: "",
    availability: "",
    whatProvided: "",
    whatWanted: "",
    status: "active",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) {
          showToast("Listing not found.", "error");
          router.push("/dashboard");
          return;
        }
        setForm({
          title: data.title || "",
          description: data.description || "",
          category: data.category || CATEGORIES[0],
          kind: data.kind || KINDS[0],
          exchangeType: data.exchangeType || EXCHANGE_TYPES[0],
          tags: data.tags || "",
          imageUrl: data.imageUrl || "",
          location: data.location || "",
          availability: data.availability || "",
          whatProvided: data.whatProvided || "",
          whatWanted: data.whatWanted || "",
          status: data.status || "active",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, router, showToast]);

  const update = (field: string, val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Listing updated successfully!", "success");
      router.push(`/listings/${id}`);
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      showToast(d.error || "Could not update listing.", "error");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-xs text-slate-500">
        Loading listing...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href={`/listings/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Listing</span>
      </Link>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Listing</h1>
        <p className="mt-1 text-xs text-slate-500">Update the details of your skill, service, or need.</p>

        <form onSubmit={submit} className="mt-6 space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Description</label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Category</label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none focus:border-emerald-600"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-700">Tags (comma separated)</label>
              <input
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-700">Kind</label>
              <select
                value={form.kind}
                onChange={(e) => update("kind", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none focus:border-emerald-600"
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-700">Exchange Settlement</label>
              <select
                value={form.exchangeType}
                onChange={(e) => update("exchangeType", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none focus:border-emerald-600"
              >
                {EXCHANGE_TYPES.map((x) => (
                  <option key={x} value={x}>
                    {EXCHANGE_LABEL[x]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Photo URL</label>
              <input
                value={form.imageUrl}
                onChange={(e) => update("imageUrl", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Publication Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none focus:border-emerald-600"
              >
                <option value="active">Active (Visible)</option>
                <option value="closed">Closed / Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
