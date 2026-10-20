"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import type { PublicUser } from "@/lib/data";
import { CATEGORIES } from "@/lib/constants";
import { X, UserRound, Save, Sparkles } from "lucide-react";

export default function ProfileEditModal({
  user,
  isOpen,
  onClose,
}: {
  user: PublicUser;
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: user.name || "",
    business: user.business || "",
    username: user.username || "",
    occupation: user.occupation || "",
    bio: user.bio || "",
    location: user.location || "",
    category: user.category || CATEGORIES[0],
    languages: user.languages || "English, Hindi",
    skills: user.skills || "",
    avatarUrl: user.avatarUrl || "",
    phone: user.phone || "",
    publicEmail: user.publicEmail ?? false,
    publicLocation: user.publicLocation ?? true,
    publicSkills: user.publicSkills ?? true,
  });

  if (!isOpen) return null;

  const update = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        showToast("Profile updated successfully!", "success");
        onClose();
        router.refresh();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update profile.", "error");
      }
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Edit Your Profile</h2>
              <p className="text-xs text-slate-500">Update your public identity on SkillSwap Rural</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Full Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Username *</label>
              <input
                required
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                placeholder="e.g. rahul_farms"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Business / Farm Name</label>
              <input
                value={form.business}
                onChange={(e) => update("business", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Primary Occupation / Role</label>
              <input
                value={form.occupation}
                onChange={(e) => update("occupation", e.target.value)}
                placeholder="e.g. Organic Farmer & Seed Conservator"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Short Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Tell other entrepreneurs about your background, journey, and community goals..."
              className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Location</label>
              <input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. Nashik, Maharashtra"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Languages Spoken</label>
              <input
                value={form.languages}
                onChange={(e) => update("languages", e.target.value)}
                placeholder="e.g. Marathi, Hindi, English"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">
              Skills & Expertise (comma separated)
            </label>
            <input
              value={form.skills}
              onChange={(e) => update("skills", e.target.value)}
              placeholder="e.g. Organic Compost, Drip Irrigation, Crop Rotation, Natural Pesticides"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Avatar Photo URL</label>
            <input
              value={form.avatarUrl}
              onChange={(e) => update("avatarUrl", e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Privacy controls */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2">
            <p className="font-bold text-slate-800">Public Visibility Preferences</p>
            <div className="grid gap-2 sm:grid-cols-3 text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.publicLocation}
                  onChange={(e) => update("publicLocation", e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Show location publicly</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.publicSkills}
                  onChange={(e) => update("publicSkills", e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Show skills list</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.publicEmail}
                  onChange={(e) => update("publicEmail", e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Show email publicly</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
