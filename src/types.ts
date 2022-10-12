import { firestore } from 'firebase-admin'

export type WithId<T> = T & { id: string }

export interface MonetaryAmount {
  currency: string
  value: number
}

export interface Quanitifed {
  quantity: number
}

export interface Sellable {
  id: string
  name: string
  price: MonetaryAmount
  description?: string
  images?: string[]
  url?: string
}

export type CheckoutStatus =
  | 'canceled' // Occurs when a PaymentIntent is canceled.
  | 'created' // Occurs when a new Checkout Session or PaymentIntent is created.
  | 'partial' // Occurs when funds are applied to a customer_balance PaymentIntent and the 'amount_remaining' changes.
  | 'failed' // Occurs when a PaymentIntent has failed the attempt to create a payment method or a payment.
  | 'processing' // Occurs when a PaymentIntent has started processing.
  | 'issue' // Occurs when a PaymentIntent transitions to requires_action state
  | 'succeeded' // Occurs when a Checkout Session or PaymentIntent has successfully completed payment.
  | 'completed' // Occurs when a Checkout Session has been successfully completed.
  | 'expired' // Occurs when a Checkout Session is expired.

export interface Checkout {
  session?: string
  payment?: string
  uid: string
  items: (Sellable & Quanitifed)[]
  status: CheckoutStatus
  meta?: any
  dateCreated: Date
  dateUpdated: Date
}

export type FirestoreTimestamp = firestore.Timestamp

export type TimestampDates<T, V extends string = 'date'> = Omit<T, V> &
  { [Property in V]: FirestoreTimestamp }

export interface Identified {
  id: string
}

export type WithCreationMetadata<T> = T & { createdAt: FirestoreTimestamp }
