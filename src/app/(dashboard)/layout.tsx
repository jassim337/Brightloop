 import { Suspense } from 'react';
import { DashboardSidebar } from '@/components/layout/sidebar';
import { DashboardHeader } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<aside className="hidden w-64 border-r border-slate-800 bg-slate-900/95 md:flex fixed inset-y-0 left-0" />}>
        <DashboardSidebar />
      </Suspense>
      
      {/* ADDED md:pl-64 HERE to offset the fixed sidebar */}
      <div className="flex flex-1 flex-col md:pl-64 w-full">
        <DashboardHeader />
        <main className="flex-1 bg-[#0f111a]">
          {children}
        </main>
      </div>
    </div>
  );
}