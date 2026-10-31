 import { SubscriptionState } from '@/lib/state/subscriptionMachine';

interface PlanFlags {
  allowPause: boolean;
  allowEarlyClose: boolean;
}

export function SubscriptionActions({ 
  status, 
  plan 
}: { 
  status: SubscriptionState, 
  plan: PlanFlags 
}) {
  if (status !== 'Active') return null;

  return (
    <div className="flex gap-3">
      {plan.allowPause && (
        <button className="px-4 py-2 border border-amber-500/20 bg-amber-500/10 text-amber-500 rounded-md hover:bg-amber-500/20 transition-colors text-sm font-medium">
          Pause Subscription
        </button>
      )}
      {plan.allowEarlyClose && (
        <button className="px-4 py-2 border border-red-500/20 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 transition-colors text-sm font-medium">
          Close Early
        </button>
      )}
    </div>
  );
}