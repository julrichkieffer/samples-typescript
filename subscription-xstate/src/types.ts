export type Subscription = {
    id: string,
    email: string,
    trialPeriod: number,
    billingPeriod: number,
    maxBillingPeriods: number,
    billingChargeAmount: number,
  }

export type SubscriptionStatus = 
  | 'TRIAL'
  | 'SUBSCRIPTION'
  | 'CANCELLED'
  | 'EXPIRED';