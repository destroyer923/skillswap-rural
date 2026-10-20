"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Suspense } from "react";
import { useToast } from "@/lib/toast";
import PublicLayout from "@/components/public-layout";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const redirectTo = searchParams.get("redirect") || "/dashboard";

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      router.push(redirectTo);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error || "Login failed.", "error");
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Password</label>
        <input
          required
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="Your password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}

function DemoAccounts() {
  const accounts = [
    { label: "Rahul (farmer)", email: "demo@rahul.in" },
    { label: "Amit (designer)", email: "demo@amit.in" },
    { label: "Priya (designer)", email: "demo@priya.in" },
    { label: "Sameer (photographer)", email: "demo@sameer.in" },
    { label: "Sunita (food)", email: "demo@sunita.in" },
    { label: "Kavya (web dev)", email: "demo@kavya.in" },
    { label: "Admin", email: "admin@skillswap.in" },
  ];
  return (
    <div className="mt-6 rounded-xl bg-amber-50 p-4">
      <p className="text-xs font-semibold text-amber-800">🔑 Demo accounts — password for all: demo1234</p>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-amber-700">
        {accounts.map((a) => (
          <p key={a.email}>
            <span className="font-medium">{a.label}:</span> {a.email}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PublicLayout user={null}>
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-center">
              <span className="text-4xl">🤝</span>
              <h1 className="mt-3 text-2xl font-bold text-slate-900">Welcome back</h1>
              <p className="mt-1 text-sm text-slate-500">Log in to your SkillSwap Rural account.</p>
            </div>

            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>

            <DemoAccounts />

            <p className="mt-6 text-center text-sm text-slate-500">
              New here?{" "}
              <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
