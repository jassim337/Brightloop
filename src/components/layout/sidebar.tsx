"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAVIGATION_BY_ROLE, type UserRole } from "@/lib/navigation";

export interface DashboardSidebarContentProps {
  role?: UserRole;
  onNavigate?: () => void;
}

export function DashboardSidebarContent({
  role = "ADMIN",
  onNavigate,
}: DashboardSidebarContentProps) {
  const pathname = usePathname();
  const navItems = NAVIGATION_BY_ROLE[role] ?? NAVIGATION_BY_ROLE.ADMIN;

  return (
    <div className="flex h-full flex-col">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6 dark:border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-500/25">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold tracking-tight text-slate-900 dark:text-white">
            Brightloop
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Subscription OS
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Platform
        </div>
        <nav aria-label="Primary navigation" className="space-y-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const route = item.href.split("#")[0];
            const isActive =
              pathname === route ||
              (route !== "/dashboard" && pathname.startsWith(route));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <IconComponent
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300"
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge ? (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="h-4 w-4 text-indigo-500 opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200/60 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
          <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
          <div className="text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Brightloop v0.1.0
            </p>
            <p className="text-[11px] text-slate-500">Billing Sync: Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface DashboardSidebarProps {
  role?: UserRole;
}

export function DashboardSidebar({ role = "ADMIN" }: DashboardSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white/95 backdrop-blur-md md:flex print:hidden dark:border-slate-800 dark:bg-slate-900/95">
      <DashboardSidebarContent role={role} />
    </aside>
  );
}
