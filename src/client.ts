import Stripe from 'stripe'
import { config } from 'firebase-functions'

export const stripe = new Stripe(config().stripe.secret, {
  apiVersion: config().stripe.version,
})
