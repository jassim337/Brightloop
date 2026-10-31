"use client";

import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive = false,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!loading) onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <div className="space-y-2">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </DialogDescription>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Working...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
