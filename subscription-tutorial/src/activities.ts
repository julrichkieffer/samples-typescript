import { Subscription } from "./types"

export async function welcomeNotification(subscription: Subscription) {
  console.log('welcomeNotification', subscription)
}

export async function trialCancelledNotification(subscription: Subscription) {
  console.log('trialCancelledNotification', subscription)
}

export async function subscriptionNotification(subscription: Subscription) {
  console.log('subscriptionNotification', subscription)
}

export async function subscriptionCancelledNotification(subscription: Subscription, currentBillingPeriod: number) {
  console.log(`${currentBillingPeriod}: subscriptionCancelledNotification`, subscription)
}

export async function subscriptionExpiredNotification(subscription: Subscription) {
  console.log('subscriptionExpiredNotification', subscription)
}

export async function billingChangedNotification(subscription: Subscription, currentBillingPeriod: number) {
  console.log(`${currentBillingPeriod}: billingChangedNotification`, subscription)
}

export async function billingChargedNotification(subscription: Subscription, currentBillingPeriod: number) {
  console.log(`${currentBillingPeriod}: billingChargedNotification`, subscription)
}