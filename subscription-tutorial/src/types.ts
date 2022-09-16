export type Subscription = {
    id: string,
    email: string,
    trialPeriod: string | number,
    billingPeriod: string | number,
    maxBillingPeriods: number,
    billingChargeAmount: number,
  }