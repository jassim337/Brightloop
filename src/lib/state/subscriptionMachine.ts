export const SUBSCRIPTION_LIFECYCLE_STEPS = [
  'Draft',
  'Quotation',
  'Confirmed',
  'Active',
  'Closed'
] as const;

export const SUBSCRIPTION_STATES = [
  'Draft',
  'Quotation',
  'Confirmed',
  'Active',
  'Paused',
  'Closed'
] as const;

export type SubscriptionState = typeof SUBSCRIPTION_STATES[number];

// Action types that can trigger state transitions
export type SubscriptionAction =
  | 'SUBMIT_QUOTATION' // Draft -> Quotation
  | 'CONFIRM'          // Quotation -> Confirmed
  | 'ACTIVATE'         // Confirmed -> Active
  | 'PAUSE'            // Active -> Paused
  | 'RESUME'           // Paused -> Active
  | 'CLOSE_EARLY'      // Active | Paused -> Closed
  | 'RENEW'            // Active | Closed -> Active | Quotation
  | 'CLOSE';           // Allowed open states -> Closed

export interface PlanActionFlags {
  allowPause?: boolean;
  allowEarlyClose?: boolean;
  allowRenewal?: boolean;
  allowAutoClose?: boolean;
}

export interface TransitionResult {
  success: boolean;
  previousState: SubscriptionState;
  newState: SubscriptionState;
  action?: SubscriptionAction;
  error?: string;
}

// Defines allowed transitions between states
const ALLOWED_TRANSITIONS: Record<SubscriptionState, readonly SubscriptionState[]> = {
  Draft: ['Quotation', 'Closed'],
  Quotation: ['Confirmed', 'Draft', 'Closed'],
  Confirmed: ['Active', 'Closed'],
  Active: ['Paused', 'Closed', 'Active'], // Active -> Active represents in-cycle renewal
  Paused: ['Active', 'Closed'],           // Active = resume, Closed = close early
  Closed: ['Draft', 'Quotation', 'Active'] // Renewing a closed subscription
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

export function canPause(state: SubscriptionState, plan?: PlanActionFlags): boolean {
  if (plan && plan.allowPause === false) return false;
  return state === 'Active';
}

export function canResume(state: SubscriptionState): boolean {
  return state === 'Paused';
}

export function canCloseEarly(state: SubscriptionState, plan?: PlanActionFlags): boolean {
  if (plan && plan.allowEarlyClose === false) return false;
  return state === 'Active' || state === 'Paused';
}

export function canRenew(state: SubscriptionState, plan?: PlanActionFlags): boolean {
  if (plan && plan.allowRenewal === false) return false;
  return state === 'Active' || state === 'Closed';
}

export function executeSubscriptionAction(
  current: SubscriptionState,
  action: SubscriptionAction,
  plan?: PlanActionFlags
): TransitionResult {
  switch (action) {
    case 'SUBMIT_QUOTATION':
      if (canTransition(current, 'Quotation')) {
        return { success: true, previousState: current, newState: 'Quotation', action };
      }
      break;

    case 'CONFIRM':
      if (canTransition(current, 'Confirmed')) {
        return { success: true, previousState: current, newState: 'Confirmed', action };
      }
      break;

    case 'ACTIVATE':
      if (canTransition(current, 'Active')) {
        return { success: true, previousState: current, newState: 'Active', action };
      }
      break;

    case 'PAUSE':
      if (!canPause(current, plan)) {
        return {
          success: false,
          previousState: current,
          newState: current,
          action,
          error: plan?.allowPause === false
            ? 'Plan settings do not allow pausing this subscription.'
            : `Cannot pause a subscription in '${current}' state (must be 'Active').`
        };
      }
      return { success: true, previousState: current, newState: 'Paused', action };

    case 'RESUME':
      if (!canResume(current)) {
        return {
          success: false,
          previousState: current,
          newState: current,
          action,
          error: `Cannot resume a subscription in '${current}' state (must be 'Paused').`
        };
      }
      return { success: true, previousState: current, newState: 'Active', action };

    case 'CLOSE_EARLY':
      if (!canCloseEarly(current, plan)) {
        return {
          success: false,
          previousState: current,
          newState: current,
          action,
          error: plan?.allowEarlyClose === false
            ? 'Plan settings do not allow closing early.'
            : `Cannot close early from '${current}' state (must be 'Active' or 'Paused').`
        };
      }
      return { success: true, previousState: current, newState: 'Closed', action };

    case 'CLOSE':
      if (canTransition(current, 'Closed')) {
        return { success: true, previousState: current, newState: 'Closed', action };
      }
      break;

    case 'RENEW':
      if (!canRenew(current, plan)) {
        return {
          success: false,
          previousState: current,
          newState: current,
          action,
          error: plan?.allowRenewal === false
            ? 'Plan settings do not allow renewal.'
            : `Cannot renew a subscription in '${current}' state (must be 'Active' or 'Closed').`
        };
      }
      const targetState: SubscriptionState = current === 'Closed' ? 'Quotation' : 'Active';
      return { success: true, previousState: current, newState: targetState, action };
  }

  return {
    success: false,
    previousState: current,
    newState: current,
    action,
    error: `Invalid action '${action}' from current state '${current}'.`
  };
}
