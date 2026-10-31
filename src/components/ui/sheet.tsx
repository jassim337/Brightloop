"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";

export const Sheet = Dialog;
export const SheetTrigger = DialogPrimitive.Trigger;

interface SheetContentProps
  extends ComponentProps<typeof DialogPrimitive.Content> {
  title: string;
  closeLabel?: string;
}

export function SheetContent({
  title,
  closeLabel = "Close menu",
  className,
  children,
  ...props
}: SheetContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        aria-describedby={undefined}
        className={cn(
          "sheet-content-left fixed inset-y-0 left-0 z-50 flex h-full w-[min(16rem,calc(100vw-2rem))] flex-col border-r border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
          className,
        )}
        {...props}
      >
        <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
        <DialogPrimitive.Close
          aria-label={closeLabel}
          className="absolute right-4 top-4 z-10 rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
