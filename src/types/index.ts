export type SubscriptionStatus = "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "PAUSED";

export type BillingCycle = "MONTHLY" | "QUARTERLY" | "ANNUAL";

export interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  isPopular?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  cycle: BillingCycle;
  renewsAt: string;
  createdAt: string;
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  changePeriod: string;
  icon: string;
}
