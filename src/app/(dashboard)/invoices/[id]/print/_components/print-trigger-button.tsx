"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintTriggerButton() {
  return (
    <Button
      type="button"
      size="sm"
      onClick={() => window.print()}
      className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
    >
      <Printer className="h-4 w-4" />
      <span>Print / Save as PDF</span>
    </Button>
  );
}

