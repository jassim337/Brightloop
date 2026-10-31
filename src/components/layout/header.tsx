"use client";

import React from "react";
import Link from "next/link";
import { Bell, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      {/* Search Input Bar */}
      <div className="flex items-center gap-3 md:w-80">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search subscriptions, customers..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:bg-slate-900"
          />
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-3">
        <Link href="/" target="_blank">
          <Button variant="ghost" size="sm" className="hidden gap-1.5 text-xs sm:flex">
            <span>View Landing</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </Button>
        </Link>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Workspace Avatar */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 font-semibold text-xs text-white">
            BL
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Brightloop Admin
            </p>
            <p className="text-[11px] text-slate-400">Owner Workspace</p>
          </div>
        </div>
      </div>
    </header>
  );
}
