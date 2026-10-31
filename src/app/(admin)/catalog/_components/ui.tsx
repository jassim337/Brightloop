import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none";

export function FieldError({ messages }: { messages?: string[] | string | null }) {
  const msg = Array.isArray(messages) ? messages[0] : messages;
  if (!msg) return null;
  return <p className="mt-1 text-sm text-red-400">{msg}</p>;
}

const tones = {
  green: "bg-green-500/20 text-green-300",
  amber: "bg-amber-500/20 text-amber-300",
  blue: "bg-blue-500/20 text-blue-300",
  red: "bg-red-500/20 text-red-300",
  grey: "bg-slate-500/20 text-slate-300",
};

export function Badge({
  tone,
  children,
}: {
  tone: keyof typeof tones;
  children: ReactNode;
}) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-800" />
      ))}
    </div>
  );
}

export function Pager({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
}) {
  if (total === 0) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
      <span>
        Page {page} of {totalPages} - {total} total
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}