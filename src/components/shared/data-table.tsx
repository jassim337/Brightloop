import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: keyof T;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  page,
  pageSize,
  total,
  onPageChange,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className={cn("px-4 py-3 font-semibold", column.className)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="text-slate-700 dark:text-slate-200"
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn("px-4 py-3", column.className)}
                    >
                      {column.render
                        ? column.render(row)
                        : String(row[column.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
        <p>{total} {total === 1 ? "record" : "records"}</p>
        <div className="flex items-center gap-3">
          <span aria-live="polite">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Go to previous page"
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Go to next page"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
