import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from "lucide-react";

export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const adminStaffNavigation: readonly NavigationItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Invoices", href: "/invoices", icon: FileText },
  { title: "Payments", href: "/payments", icon: CreditCard },
  {
    title: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
    badge: "Active",
  },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Plans & Tiers", href: "/plans", icon: Package },
  {
    title: "Invoice activity",
    href: "/subscriptions#invoices",
    icon: FileText,
  },
  { title: "Settings", href: "/settings", icon: Settings },
];

export const NAVIGATION_BY_ROLE: Record<
  UserRole,
  readonly NavigationItem[]
> = {
  ADMIN: adminStaffNavigation,
  STAFF: adminStaffNavigation,
  CUSTOMER: [
    { title: "My Invoices", href: "/invoices", icon: FileText },
    { title: "Payments", href: "/payments", icon: CreditCard },
    { title: "Profile", href: "/profile", icon: Users },
  ],
};