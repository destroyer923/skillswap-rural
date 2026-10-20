"use client";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import type { PublicUser } from "@/lib/data";
import { CATEGORIES } from "@/lib/constants";

export default function ProfileForm({ user }: { user: PublicUser }) {
  const router = useRouter();
  const { showToast } = useToast();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      business: form.get("business"),
      location: form.get("location"),
      category: form.get("category"),
    };
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      showToast("Profile updated! ✅");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      showToast(d.error || "Could not update profile.", "error");
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Full name</label>
        <input
          name="name"
          defaultValue={user.name}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Business name</label>
        <input
          name="business"
          defaultValue={user.business}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Location</label>
        <input
          name="location"
          defaultValue={user.location}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Category</label>
        <select
          name="category"
          defaultValue={user.category}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Save changes
        </button>
      </div>
    </form>
  );
}
