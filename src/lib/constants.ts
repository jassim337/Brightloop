export const APP_CONFIG = {
  name: "Brightloop",
  companyName: "Brightloop Software",
  tagline: "Modern Subscription & Revenue Operations",
  description: "End-to-end subscription lifecycle, customer retention metrics, and recurring billing intelligence for SaaS teams.",
};

export interface NavItem {
  title: string;
  href: string;
  iconName: "LayoutDashboard" | "CreditCard" | "Users" | "Package" | "BarChart3" | "Settings" | "FileText";
  badge?: string;
}

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    iconName: "LayoutDashboard",
  },
  {
    title: "Subscriptions",
    href: "/subscriptions",
    iconName: "CreditCard",
    badge: "Active",
  },
  {
    title: "Customers",
    href: "/customers",
    iconName: "Users",
  },
  {
    title: "Plans & Tiers",
    href: "/plans",
    iconName: "Package",
  },
  {
    title: "Invoices",
    href: "/subscriptions#invoices",
    iconName: "FileText",
  },
  {
    title: "Settings",
    href: "/settings",
    iconName: "Settings",
  },
];
