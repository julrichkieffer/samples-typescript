import * as wf from '@temporalio/workflow';
import { Subscription } from './types';
import type * as activityTypes from './activities';

const activities = wf.proxyActivities<typeof activityTypes>({
  startToCloseTimeout: '1 minute',
});

export const CancelSubscription = wf.defineSignal('CANCEL_SUBSCRIPTION');
export const UpdateBillingAmount = wf.defineSignal<[number]>('UPDATE_BILLING_AMOUNT');
export const AmountChargedToDate = wf.defineQuery<[number]>('BILLED_AMOUNT_TO_DATE');

export async function SubscriptionsWorkflow(subscription: Subscription): Promise<string> {
  let subscriptionCancelled = false;
  let totalCharged = 0;
  
  wf.setHandler(CancelSubscription, () => void(subscriptionCancelled = true));
  wf.setHandler(UpdateBillingAmount, (newAmount) => void(subscription.billingChargeAmount = newAmount));
  wf.setHandler(AmountChargedToDate, () => [totalCharged]);
  
  await activities.welcomeNotification(subscription);
  if (await wf.condition(() => subscriptionCancelled, subscription.trialPeriod)) {
    await activities.trialCancelledNotification(subscription);
    return `Trial Cancelled`;
  }

  await activities.subscriptionNotification(subscription);

  for (let currentPeriod = 1; currentPeriod <= subscription.maxBillingPeriods; currentPeriod++) {
    await activities.billingChargedNotification(subscription, currentPeriod);
    totalCharged += subscription.billingChargeAmount;
    
    if (await wf.condition(() => subscriptionCancelled, subscription.billingPeriod)) {
      await activities.subscriptionCancelledNotification(subscription, currentPeriod);
      return `Subscription Cancelled`;
    }
  }

  if (!subscriptionCancelled) await activities.subscriptionExpiredNotification(subscription);
  return `Subscription Lapsed`;
}
