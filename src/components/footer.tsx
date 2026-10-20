import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">🌾</span>
            <span className="font-bold text-slate-900">SkillSwap Rural</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            Connecting rural entrepreneurs so they can exchange skills, services, and resources — no one has to build alone.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/find" className="hover:text-emerald-700">Find Skills</Link></li>
            <li><Link href="/offer/new" className="hover:text-emerald-700">Post an Offer</Link></li>
            <li><Link href="/need/new" className="hover:text-emerald-700">Post a Need</Link></li>
            <li><Link href="/collaborations" className="hover:text-emerald-700">Collaborations</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/register" className="hover:text-emerald-700">Sign up</Link></li>
            <li><Link href="/login" className="hover:text-emerald-700">Log in</Link></li>
            <li><Link href="/dashboard" className="hover:text-emerald-700">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Project</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/#how" className="hover:text-emerald-700">How it works</Link></li>
            <li><Link href="/admin" className="hover:text-emerald-700">Admin panel</Link></li>
            <li><a href="https://github.com" className="hover:text-emerald-700">Source code</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} SkillSwap Rural · Built for rural entrepreneurs, by entrepreneurs.
      </div>
    </footer>
  );
}
