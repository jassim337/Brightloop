export const SUBSCRIPTION_STATES = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'] as const;
export type SubscriptionState = typeof SUBSCRIPTION_STATES[number];

export const ALLOWED_TRANSITIONS: Record<SubscriptionState, SubscriptionState[]> = {
    Draft: ['Quotation', 'Closed'],
    Quotation: ['Confirmed', 'Draft', 'Closed'],
    Confirmed: ['Active', 'Quotation', 'Closed'],
    Active: ['Closed'],
    Closed: []
};

export function canTransition(current: SubscriptionState, target: SubscriptionState): boolean {
    return ALLOWED_TRANSITIONS[current]?.includes(target) ?? false;
}