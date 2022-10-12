import { CheckoutStatus } from '../types'

export const checkoutStatusByEvent: {
  [event: string]: CheckoutStatus
} = Object.freeze({
  // Occurs when a PaymentIntent is canceled.
  'payment_intent.canceled': 'canceled',

  // Occurs when a new PaymentIntent is created.
  'payment_intent.created': 'created',

  // Occurs when funds are applied to a customer_balance PaymentIntent and the 'amount_remaining' changes.
  'payment_intent.partially_funded': 'partial',

  // Occurs when a PaymentIntent has failed the attempt to create a payment method or a payment.
  'payment_intent.payment_failed': 'failed',

  // Occurs when a PaymentIntent has started processing.
  'payment_intent.processing': 'processing',

  // Occurs when a PaymentIntent transitions to requires_action state
  'payment_intent.requires_action': 'issue',

  // Occurs when a PaymentIntent has successfully completed payment.
  'payment_intent.succeeded': 'succeeded',
})

export const acceptedPaymentIntentEvents = Object.keys(checkoutStatusByEvent)
export type AcceptedPaymentIntentEvent = keyof typeof checkoutStatusByEvent
