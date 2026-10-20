"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import type { PublicUser } from "@/lib/data";
import { useI18n, type Language } from "@/lib/i18n";
import {
  User,
  Globe,
  Eye,
  Bell,
  Sun,
  Shield,
  MapPin,
  Download,
  HelpCircle,
  Save,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export default function SettingsPanel({ user }: { user: PublicUser }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { language, setLanguage, t } = useI18n();
  const [activeSection, setActiveSection] = useState("account");
  const [loading, setLoading] = useState(false);

  // Form states
  const [form, setForm] = useState({
    name: user.name || "",
    business: user.business || "",
    location: user.location || "",
    category: user.category || "Agriculture",
    preferredLanguage: (user.preferredLanguage as Language) || language,
    publicEmail: user.publicEmail ?? false,
    publicLocation: user.publicLocation ?? true,
    publicSkills: user.publicSkills ?? true,
    notifyMessages: user.notifyMessages ?? true,
    notifyExchanges: user.notifyExchanges ?? true,
    notifyMilestones: user.notifyMilestones ?? true,
    notifyReviews: user.notifyReviews ?? true,
    theme: user.theme || "light",
  });

  const update = (field: string, val: any) => {
    setForm((f) => ({ ...f, [field]: val }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        showToast("Settings saved successfully!", "success");
        if (form.preferredLanguage !== language) {
          setLanguage(form.preferredLanguage as Language);
        }
        router.refresh();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to save settings.", "error");
      }
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `skillswap_user_data_${user.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("User data archive exported as JSON.", "success");
  };

  const sections = [
    { id: "account", label: "Account & Personal Info", icon: User },
    { id: "language", label: "Language & Localization", icon: Globe },
    { id: "privacy", label: "Privacy & Visibility", icon: Eye },
    { id: "notifications", label: "Notification Preferences", icon: Bell },
    { id: "appearance", label: "Appearance & Accessibility", icon: Sun },
    { id: "security", label: "Security & Sessions", icon: Shield },
    { id: "regional", label: "Regional Preferences", icon: MapPin },
    { id: "data", label: "Data & Account Management", icon: Download },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Sections Navigation */}
      <div className="space-y-1 lg:col-span-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xs">
          {sections.map((s) => {
            const Icon = s.icon;
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                  active
                    ? "bg-emerald-50 text-emerald-900 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    active ? "text-emerald-700" : "text-slate-400"
                  }`}
                />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Content Panel */}
      <div className="lg:col-span-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          {/* Section 1: Account Info */}
          {activeSection === "account" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Account & Personal Information
                </h3>
                <p className="text-xs text-slate-500">
                  Manage your personal details and business identity.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Full Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Business / Farm</label>
                  <input
                    value={form.business}
                    onChange={(e) => update("business", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Email Address</label>
                  <input
                    disabled
                    value={user.email}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 outline-none cursor-not-allowed"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Primary login email. Contact support if you need to transfer accounts.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Language & Localization */}
          {activeSection === "language" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Language & Localization
                </h3>
                <p className="text-xs text-slate-500">
                  Choose your preferred language across the entire platform.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { code: "en", label: "English", desc: "Default interface language" },
                  { code: "hi", label: "हिन्दी (Hindi)", desc: "सम्पूर्ण इंटरफ़ेस हिन्दी में" },
                  { code: "mr", label: "मराठी (Marathi)", desc: "संपूर्ण इंटरफेस मराठीत" },
                ].map((l) => (
                  <label
                    key={l.code}
                    className={`flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition ${
                      form.preferredLanguage === l.code
                        ? "border-emerald-500 bg-emerald-50/60"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{l.label}</p>
                      <p className="text-xs text-slate-500">{l.desc}</p>
                    </div>
                    <input
                      type="radio"
                      name="preferredLanguage"
                      checked={form.preferredLanguage === l.code}
                      onChange={() => {
                        update("preferredLanguage", l.code);
                        setLanguage(l.code as Language);
                      }}
                      className="h-4 w-4 text-emerald-600"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Privacy & Visibility */}
          {activeSection === "privacy" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Privacy & Visibility
                </h3>
                <p className="text-xs text-slate-500">
                  Control what information other community members can see.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-800">Public Location</p>
                    <p className="text-slate-500">Display your town or district on your public profile</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.publicLocation}
                    onChange={(e) => update("publicLocation", e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-800">Public Skills List</p>
                    <p className="text-slate-500">Showcase your skill keywords in the community directory</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.publicSkills}
                    onChange={(e) => update("publicSkills", e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-800">Public Contact Email</p>
                    <p className="text-slate-500">Allow other logged-in members to view your email directly</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.publicEmail}
                    onChange={(e) => update("publicEmail", e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Section 4: Notification Preferences */}
          {activeSection === "notifications" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Notification Preferences
                </h3>
                <p className="text-xs text-slate-500">
                  Choose which activity alerts you wish to receive.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-800">Private Messages</p>
                    <p className="text-slate-500">In-app notifications when a partner sends you a message</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.notifyMessages}
                    onChange={(e) => update("notifyMessages", e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-800">Exchange Proposals</p>
                    <p className="text-slate-500">Alerts when someone proposes or updates an exchange</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.notifyExchanges}
                    onChange={(e) => update("notifyExchanges", e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-800">Reviews & Reputation</p>
                    <p className="text-slate-500">Notifications when a completed partner leaves you a review</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.notifyReviews}
                    onChange={(e) => update("notifyReviews", e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Section 5: Appearance */}
          {activeSection === "appearance" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Appearance & Theme
                </h3>
                <p className="text-xs text-slate-500">
                  Personalize the interface design and readability.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                {[
                  { id: "light", label: "Clean White & Green (Default)" },
                  { id: "dark", label: "High Contrast Theme" },
                  { id: "system", label: "System Sync" },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => update("theme", th.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      form.theme === th.id
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <p>{th.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Security */}
          {activeSection === "security" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Security & Active Sessions
                </h3>
                <p className="text-xs text-slate-500">
                  Your active session is protected with secure HTTP cookies and bcrypt hashing.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Current Session Active</span>
                </div>
                <p className="text-slate-600">
                  Logged in as <span className="font-semibold">{user.email}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Passwords are encrypted using industry standard bcrypt. Never share your password with anyone.
                </p>
              </div>
            </div>
          )}

          {/* Section 7: Regional */}
          {activeSection === "regional" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Regional Preferences
                </h3>
                <p className="text-xs text-slate-500">
                  Default format for dates, calendars, and barter terms.
                </p>
              </div>
              <div className="space-y-3 text-xs">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-bold text-slate-800">Date Format: DD/MM/YYYY</p>
                  <p className="text-slate-500">Formatted according to Indian regional standard.</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 8: Data & Account */}
          {activeSection === "data" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Data & Account Management
                </h3>
                <p className="text-xs text-slate-500">
                  Export your data or manage your platform identity.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 text-xs">
                  <div>
                    <p className="font-bold text-slate-800">Export Your Account Data</p>
                    <p className="text-slate-500">Download a full JSON archive of your profile records.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 9: Help & Support */}
          {activeSection === "help" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Help & Community Guidelines
                </h3>
                <p className="text-xs text-slate-500">
                  Learn how to make the most of SkillSwap Rural.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <p className="font-bold text-emerald-950">1. Clear agreements make strong swaps</p>
                  <p className="mt-1 text-slate-600">
                    Always discuss the scope, quantity, and timeframe in messages before starting work.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="font-bold text-slate-900">2. Leave honest reviews</p>
                  <p className="mt-1 text-slate-600">
                    Mutual reviews build trust for the entire rural entrepreneur network.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Save Bar */}
          <div className="mt-8 flex justify-end border-t border-slate-100 pt-4">
            <button
              onClick={() => handleSave()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? "Saving Settings..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
