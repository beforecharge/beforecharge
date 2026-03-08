import Head from "next/head";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>BeforeCharge – Track &amp; Manage Your Subscriptions</title>
        <meta
          name="description"
          content="The average person wastes $348/year on forgotten subscriptions. BeforeCharge helps you find and cancel them in under a minute."
        />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50">
        <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10 sm:py-16">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold">
                MR
              </div>
              <span className="text-lg font-semibold tracking-tight">
                BeforeCharge
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link href="/pricing" className="text-slate-300 hover:text-white">
                Pricing
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-100 hover:border-slate-500"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-3 py-1.5 font-medium text-slate-950 hover:bg-blue-500"
              >
                Get started free
              </Link>
            </div>
          </header>

          <section className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Find forgotten subscriptions in 60 seconds
            </p>
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              The average person wastes
              <span className="block text-blue-400">$348/year</span>
              on forgotten subscriptions.
            </h1>
            <p className="max-w-2xl text-balance text-base text-slate-300 sm:text-lg">
              BeforeCharge connects your subscriptions, surfaces sneaky renewals,
              and sends smart reminders before money leaves your account.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/20 hover:bg-blue-500"
              >
                Start tracking for free
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-slate-100 hover:border-slate-500"
              >
                View pricing
              </Link>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs font-semibold text-blue-300">
                1. Connect &amp; capture
              </p>
              <p className="mt-2 text-sm text-slate-200">
                Track subscriptions in any currency and see them in one place.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs font-semibold text-emerald-300">
                2. See what renews next
              </p>
              <p className="mt-2 text-sm text-slate-200">
                Calendar and alerts for upcoming renewals so you can cancel on
                time.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs font-semibold text-amber-300">
                3. Stay in control
              </p>
              <p className="mt-2 text-sm text-slate-200">
                Multi-currency analytics, smart reminders, and cancellation
                guides built-in.
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

