import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PREVIEW_PLANS = [
  {
    name: "Starter",
    price: 49,
    description: "For emerging products testing subscription models.",
    features: ["Up to 500 active subscriptions", "Standard analytics", "Email support", "1 Webhook endpoint"],
  },
  {
    name: "Growth",
    price: 199,
    popular: true,
    description: "For scaling SaaS applications needing retention tools.",
    features: ["Up to 5,000 active subscriptions", "Advanced MRR cohort analytics", "Priority support", "Dunning management"],
  },
  {
    name: "Enterprise",
    price: 699,
    description: "High-volume subscription platform with custom SLA.",
    features: ["Unlimited subscriptions", "Dedicated database shard", "24/7 dedicated support", "Custom billing cycles"],
  },
];

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pricing Plans & Tiers
          </h1>
          <p className="text-sm text-slate-500">
            Define recurring billing models, pricing tiers, and entitlement features.
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>New Plan</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PREVIEW_PLANS.map((plan) => (
          <Card key={plan.name} className={plan.popular ? "border-indigo-500 ring-2 ring-indigo-500/20" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.popular && <Badge variant="default">Popular</Badge>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">${plan.price}</span>
                <span className="text-xs text-slate-500">/month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-indigo-600" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant={plan.popular ? "default" : "outline"} className="w-full text-xs">
                Configure Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
