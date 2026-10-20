import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { searchListings, getPlatformStats } from "@/lib/data";
import ListingCard from "@/components/listing-card";
import PublicLayout from "@/components/public-layout";

const CATEGORY_EMOJI: Record<string, string> = {
  Agriculture: "🌱",
  "Food & Beverage": "🍯",
  "Design & Creative": "🎨",
  Marketing: "📣",
  "Web & Tech": "💻",
  Handicrafts: "🧶",
  Photography: "📸",
  "Education & Training": "📚",
  "Finance & Accounting": "🧾",
  Other: "🛠️",
};

const STEPS = [
  {
    emoji: "1️⃣",
    title: "Create your account",
    text: "Sign up in a minute. Tell the community who you are, what business you run, and where you are based.",
  },
  {
    emoji: "2️⃣",
    title: "Post what you offer & what you need",
    text: "List the skills, services, or products you can share — and the things you're looking for from others.",
  },
  {
    emoji: "3️⃣",
    title: "Find a match & collaborate",
    text: "Search offers by skill, category, or location. Send a collaboration request, work together, and grow.",
  },
];

const ECOSYSTEM = [
  {
    emoji: "👨‍🌾",
    name: "Raj",
    business: "Organic Farming",
    has: "Can offer organic farming knowledge",
    needs: "Needs packaging design",
  },
  {
    emoji: "👩‍🎨",
    name: "Priya",
    business: "Graphic Design",
    has: "Can offer packaging & logo design",
    needs: "Needs product photography",
  },
  {
    emoji: "📸",
    name: "Sameer",
    business: "Photography",
    has: "Can offer product photography",
    needs: "Needs organic products",
  },
];

export default async function Home() {
  const user = await getSessionUser();
  const [stats, featured] = await Promise.all([
    getPlatformStats(),
    searchListings({ limit: 6 }),
  ]);

  return (
    <PublicLayout user={user}>
      <div>
        {/* Hero */}
      <section className="relative overflow-hidden bg-emerald-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white" />
          <div className="absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-white" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600/60 px-4 py-1.5 text-sm font-medium text-emerald-50">
            🌾 Built for rural entrepreneurs
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            I have something you need.
            <br />
            <span className="text-amber-300">You have something I need.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-emerald-50/90">
            SkillSwap Rural connects entrepreneurs across the countryside so they can exchange skills,
            services, and resources — without working alone.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/find"
              className="rounded-xl bg-white px-6 py-3 text-base font-semibold text-emerald-800 shadow transition hover:bg-emerald-50"
            >
              🔍 Find Skills
            </Link>
            <Link
              href="/need/new"
              className="rounded-xl bg-amber-400 px-6 py-3 text-base font-semibold text-emerald-950 shadow transition hover:bg-amber-300"
            >
              I need help →
            </Link>
            {!user && (
              <Link
                href="/register"
                className="rounded-xl border border-white/40 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Create free account
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: stats.entrepreneurs, label: "Entrepreneurs" },
              { value: stats.listings, label: "Live listings" },
              { value: stats.completedCollabs, label: "Projects done" },
              { value: stats.reviews, label: "Reviews given" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 px-3 py-4 backdrop-blur">
                <p className="text-2xl font-extrabold text-white sm:text-3xl">{s.value}</p>
                <p className="text-xs font-medium text-emerald-100/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          How SkillSwap Rural works
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
          Three simple steps to turn isolation into collaboration.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">{s.emoji}</div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ecosystem example */}
      <section className="bg-slate-100 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            A small ecosystem, a big difference
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
            When three rural entrepreneurs connect, everyone grows. Here&apos;s how the circle closes:
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ECOSYSTEM.map((p) => (
              <div key={p.name} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{p.emoji}</span>
                  <div>
                    <p className="font-semibold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.business}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">
                    ✅ <span className="font-medium">Can offer:</span> {p.has}
                  </p>
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-rose-700">
                    🔴 <span className="font-medium">Needs:</span> {p.needs}
                  </p>
                </div>
                <div className="mt-3 text-center text-2xl text-emerald-500">🤝</div>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-slate-500">
            Raj needs packaging → Priya can design it. Priya needs photos → Sameer can shoot them.
            Sameer needs organic produce → Raj farms it. <span className="font-semibold text-slate-700">Nobody works alone.</span>
          </p>
          <p className="mt-4 text-center">
            <Link href="/matches" className="inline-block rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">
              🔄 See circles like this on my Matches page
            </Link>
          </p>
        </div>
      </section>

      {/* Matching system */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl bg-slate-900 p-8 text-white sm:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300">⚙️ THE MATCHING SYSTEM</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">
                You don&apos;t have to search. <span className="text-amber-300">The platform finds your partner.</span>
              </h2>
              <p className="mt-4 text-slate-300">
                SkillSwap Rural compares every offer against every need in the community and scores how well they fit —
                then it looks for loops where the trades come back around to you.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  { emoji: "🔥", t: "Two-way matches", d: "“I have what you need, and you have what I need.” The perfect swap." },
                  { emoji: "🎯", t: "They can help you", d: "Someone’s offer answers one of your needs — send a request in one click." },
                  { emoji: "🙌", t: "You can help them", d: "Your offer answers someone’s need. Grow your reputation by showing up." },
                  { emoji: "🔄", t: "Exchange circles", d: "3 or 4 entrepreneurs linked in a loop, where nobody pays money — everyone trades." },
                ].map((x) => (
                  <li key={x.t} className="flex gap-3">
                    <span className="text-lg">{x.emoji}</span>
                    <span>
                      <span className="font-semibold text-white">{x.t}:</span>{" "}
                      <span className="text-slate-300">{x.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href={user ? "/matches" : "/register"}
                className="mt-7 inline-block rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
              >
                {user ? "Open my matches →" : "Create an account to get matched →"}
              </Link>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">How a score is built</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Same category", pts: "+40", w: "80%" },
                  { label: "Shared keywords (tags, title, description)", pts: "+20 each", w: "60%" },
                  { label: "Same town or district", pts: "+12", w: "30%" },
                  { label: "Partner’s review rating", pts: "+1.5 × ★", w: "20%" },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{r.label}</span>
                      <span className="font-semibold text-amber-300">{r.pts}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: r.w }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-400">
                Anything scoring 36+ appears as a match. Exchange circles need every link to score 60+ and
                agree on category, so only believable loops are shown.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Fresh opportunities</h2>
            <p className="mt-2 text-slate-500">Latest skills offered and needs posted by the community.</p>
          </div>
          <Link href="/find" className="hidden text-sm font-semibold text-emerald-700 hover:text-emerald-800 sm:block">
            Browse all →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} currentUserId={user?.id} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-slate-500">No listings yet. Be the first to post one!</p>
            <Link href="/register" className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Get started
            </Link>
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link href="/find" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            Browse all →
          </Link>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-emerald-700 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Ready to swap skills?</h2>
          <p className="mx-auto mt-3 max-w-xl text-emerald-50/90">
            Join SkillSwap Rural today — it&apos;s free, and your next business partner could be just one search away.
          </p>
          <Link
            href={user ? "/dashboard" : "/register"}
            className="mt-6 inline-block rounded-xl bg-amber-400 px-6 py-3 text-base font-semibold text-emerald-950 transition hover:bg-amber-300"
          >
            {user ? "Go to my dashboard" : "Create your free account"}
          </Link>
        </div>
      </section>
    </div>
    </PublicLayout>
  );
}
