import { requireUser } from "@/lib/auth";
import DashboardShell from "@/components/dashboard-shell";
import SettingsPanel from "@/components/settings-panel";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
              <Settings className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Account Settings
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal profile, language, privacy, and account preferences.
          </p>
        </div>

        <SettingsPanel user={user} />
      </div>
    </DashboardShell>
  );
}
