 import { SUBSCRIPTION_STATES, SubscriptionState } from '../lib/state/subscriptionMachine';
import { cn } from '../lib/utils';

export function SubscriptionStepper({ currentStatus }: { currentStatus: SubscriptionState }) {
  const currentIndex = SUBSCRIPTION_STATES.indexOf(currentStatus);

  return (
    <div className="flex items-center justify-between w-full p-6 mb-12 rounded-xl bg-slate-900/50 border border-slate-800 shadow-sm font-sans">
      {SUBSCRIPTION_STATES.map((state, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={state} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative z-10">
              <div 
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-colors duration-300 ring-4 ring-[#0f111a]",
                  isActive ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]" : 
                  isCompleted ? "bg-indigo-500/20 text-indigo-400" : 
                  "bg-slate-800 text-slate-500"
                )}
              >
                {index + 1}
              </div>
              <span className={cn(
                "absolute top-12 text-xs font-medium tracking-wide whitespace-nowrap",
                isActive || isCompleted ? "text-indigo-400" : "text-slate-500"
              )}>
                {state}
              </span>
            </div>
            {index < SUBSCRIPTION_STATES.length - 1 && (
              <div className={cn(
                "h-[2px] w-full mx-2 rounded-full",
                index < currentIndex ? "bg-indigo-500/40" : "bg-slate-800"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}