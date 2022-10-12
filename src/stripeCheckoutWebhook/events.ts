import { CheckoutStatus } from '../types'

export const checkoutStatusByEvent: {
  [event: string]: CheckoutStatus
} = Object.freeze({
  // Occurs when a payment intent using a delayed payment method fails.
  'checkout.session.async_payment_failed': 'failed',

  // Occurs when a payment intent using a delayed payment method finally succeeds.
  'checkout.session.async_payment_succeeded': 'succeeded',

  // Occurs when a Checkout Session has been successfully completed.
  'checkout.session.completed': 'completed',

  // Occurs when a Checkout Session is expired.
  'checkout.session.expired': 'expired',
})

export const acceptedCheckoutEvents = Object.keys(checkoutStatusByEvent)
export type AcceptedCheckoutEvent = keyof typeof checkoutStatusByEvent
