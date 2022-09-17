import * as wf from '@temporalio/workflow';
import { interpret } from 'xstate';
import { publicState, SubscriptionMachine } from './machines/subscription.machine';
import { Subscription, SubscriptionStatus } from './types';
import temporalClock from './machines/temporalClock';
import type * as activityTypes from './activities';

const activities = wf.proxyActivities<typeof activityTypes>({
  startToCloseTimeout: '1 minute',
});

export const SubscriptionWorkflowStatus = wf.defineQuery<SubscriptionStatus>('STATUS');
export const CancelSubscription = wf.defineSignal('CANCEL');

export async function SubscriptionWorkflow(subscription: Subscription): Promise<string> {

  const machine = SubscriptionMachine.withConfig({
    actions: {
      billingChangedNotification: (ctx) => activities.billingChangedNotification(subscription, ctx.billing.currentPeriod),
      chargeForBillingPeriod: (ctx) => activities.billingChargedNotification(subscription, ctx.billing.currentPeriod),
      subscriptionCancelledNotification: (ctx) => activities.subscriptionCancelledNotification(subscription, ctx.billing.currentPeriod),
      subscriptionExpiredNotification: (ctx) => activities.subscriptionExpiredNotification(subscription),
      subscriptionNotification: (ctx) => activities.subscriptionNotification(subscription),
      trialCancelledNotification: (ctx) => activities.trialCancelledNotification(subscription),
      welcomeNotification: (ctx) => activities.welcomeNotification(subscription)
    },
    delays: {
      trialPeriod: (ctx) => subscription.trialPeriod,
      billingPeriod: (ctx) => subscription.billingPeriod,
    },
    guards: {
      withinMaxBillingPeriod: () => true,
    },
    // services: { }
  });
  
  let state = machine.initialState;

  const service = interpret(machine, temporalClock)
    .onTransition( updatedState => state = updatedState)
    .start();

  const send = service.send.bind(service);

  wf.setHandler(SubscriptionWorkflowStatus, () => publicState(state) );
  wf.setHandler(CancelSubscription, () => { send('CANCEL_SUBSCRIPTION') });

  await new Promise( resolve => service.onDone(resolve) );
  service.stop();
  return publicState(state);
}
