import { createMachine, StateFrom } from 'xstate';
import { SubscriptionStatus } from '../types';
import { SubscriptionWorkflow } from '../workflows';

export interface SubscriptionMachineContext {
    billing: {
        currentPeriod: number,
        history: [string, number][]; 
        total: number
    }
}

export type SubscriptionMachineEvents =
    | { type: 'CANCEL_SUBSCRIPTION' }
    // | { type: '' }
    | { type: 'UPDATE_SUBSCRIPTION_CHARGE_AMOUNT'; newAmount: number };

export const SubscriptionMachine = 
/** @xstate-layout N4IgpgJg5mDOIC5SwK4CNYGMBOBLADgC64D2AdgLICGmAFrmWAHSF5UA2AxAMICCActwCiAGQD6AZQCqAIQncASgEkACgBUlAeX6JQ+ErFzFyukAA9EAZgCcAdiYAGAEwA2ABwOAjC8ueALG5Obn4ANCAAnoieTp5MAKwOiX7Wfg5+cZYOwQC+2WGoGDgExpQ09IwsbFxmsIRUhMxUAGYN2AAUrLgcKmB4JBAAlJwFWHhEpKV0DMydHKb6hiWmFgg29s7uXj7+gcFhkQgBlkwup3HWccku6Z7Wufnoo8UT1FMVI0Xj5DwCwuLSckUqg02nmBiME2WiGsbjiTCcKVsfiRtk8sM8cX2iDinliCUSWxcDmsFxc9xAHzGJVe5WYlOe3ykKgAIrw1EJJLJ5Mp1Fp+GJuAAJXgKADiHN4FE0Un4ajBi0hSHMiBcTmOWTSljiMQRGNsWMOGMcBK111uTj8lnJ9K+k1pTBtJU4NTqDSYzVabTQuHY7AYUB6fUGw0en2pZWmDtDVMVenBSyVKzOTDc0TiRK1JP81gNMQcxsSGUtRMultyeRAZH6cFMjpeEYqs3Y3CoZEwYF9kHlEJMiZVqJTmVS0WcOJxBus+YJXmRMU8xIu1ujDLtkbr5BbbY77C7SoWPbIUIQ0W8TEsR1TDgyQT8oQiiACU+n11s5wSlitFfXq-ey9tQjMfBcGwXc4wVXtQBWPwnFzVwCyvNxz0yax51sJdChjcgaUjJtuwTSCojRJg-GuBEslsJwgnTHN72PBx1gJGIUh8JxbFsT8HgwldsN-LjbTw2NlQQdjjg8S8YW1Px-DvA4EjhEkSVsNw7FvFC7HQp5bR4sABIgoS0QNNFy2yIA */
createMachine<SubscriptionMachineContext, SubscriptionMachineEvents>({
  context: {
    billing: {
      currentPeriod: 0,
      history: [],
      total: 0,
    },
  },
  id: 'subscriptionMachine',
  initial: 'trial',
  states: {
    trialCancelled: {
      entry: 'trialCancelledNotification',
      type: 'final',
    },
    subscriptionCancelled: {
      entry: 'subscriptionCancelledNotification',
      type: 'final',
    },
    subscriptionExpired: {
      entry: 'subscriptionExpiredNotification',
      type: 'final',
    },
    trial: {
      entry: 'welcomeNotification',
      after: {
        trialPeriod: {
          actions: 'subscriptionNotification',
          target: 'subscription',
        },
      },
      on: {
        CANCEL_SUBSCRIPTION: {
          target: 'trialCancelled',
        },
      },
    },
    subscription: {
      after: {
        billingPeriod: [
          {
            actions: 'chargeForBillingPeriod',
            cond: 'withinMaxBillingPeriod',
          },
          {
            target: 'subscriptionExpired',
          },
        ],
      },
      on: {
        CANCEL_SUBSCRIPTION: {
          target: 'subscriptionCancelled',
        },
        UPDATE_SUBSCRIPTION_CHARGE_AMOUNT: {
          actions: 'billingChangedNotification',
        },
      },
    },
  },
});

export function publicState(state: StateFrom<typeof SubscriptionMachine>): SubscriptionStatus {
    if (state.matches('trialCancelled') || state.matches('subscriptionCancelled')) return 'CANCELLED'
    else if (state.matches('trial')) return 'TRIAL'
    else if (state.matches('subscription')) return 'SUBSCRIPTION'
    else if (state.matches('subscriptionExpired')) return 'EXPIRED';

    throw new Error(`A new or renamed state of ${ typeof(SubscriptionWorkflow).name } is not recognised`);
}