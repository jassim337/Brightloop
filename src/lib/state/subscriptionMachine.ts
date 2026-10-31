export const SUBSCRIPTION_STATES = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'] as const;
export type SubscriptionState = typeof SUBSCRIPTION_STATES[number];

// Defines exactly where a subscription can go from its current state
const ALLOWED_TRANSITIONS: Record<SubscriptionState, SubscriptionState[]> = {
  Draft: ['Quotation', 'Closed'],
  Quotation: ['Confirmed', 'Closed'],
  Confirmed: ['Active', 'Closed'],
  Active: ['Closed'],
  Closed: []
};

export function canTransition(current: SubscriptionState, next: SubscriptionState): boolean {
  return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}

export function transition(current: SubscriptionState, next: SubscriptionState): SubscriptionState {
  if (!canTransition(current, next)) {
    throw new Error(`Invalid transition from ${current} to ${next}`);
  }
  return next;
}