import React from "react";
import Link from "next/link";
import {
  Layers,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Zap,
  ArrowRight,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-md md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">
              Brightloop
            </span>
            <span className="hidden text-[11px] font-medium text-slate-400 sm:inline-block sm:ml-2">
              Subscription Management System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500">
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 md:px-12 lg:px-16">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[420px] w-[640px] rounded-full bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-cyan-500/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/50 px-3.5 py-1 text-xs text-indigo-300 backdrop-blur-md">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <span>Brightloop Software Platform • Phase 0 Setup</span>
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
            Subscription Intelligence for{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Modern SaaS
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg">
            Manage recurring subscriptions, automated dunning, customer lifecycle analytics, and multi-tier plans with complete reliability.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 bg-indigo-600 px-6 py-6 text-base font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/25">
                <span>Explore Live Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/plans">
              <Button size="lg" variant="outline" className="border-slate-800 bg-slate-900/60 px-6 py-6 text-base font-semibold text-slate-200 hover:bg-slate-800">
                <span>View Pricing Models</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">MRR & ARR Analytics</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Track cohort retention, churn acceleration, and expansion revenue in real time.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">Lifecycle Management</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Handle upgrades, downgrades, cancellations, grace periods, and pause states smoothly.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">Enterprise Ready</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Architected with PostgreSQL, Prisma ORM, TypeScript, and robust audit logging.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 px-6 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Brightloop Software. All rights reserved. Subscription Management System.</p>
      </footer>
    </div>
  );
}
