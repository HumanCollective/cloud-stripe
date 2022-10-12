import * as yup from 'yup'
import Stripe from 'stripe'
import { firestore } from 'firebase-admin'
import { config } from 'firebase-functions'
import { sumBy } from 'lodash'
import { callable } from '@humancollective/cloud-firebase'

import { Quanitifed, Sellable } from '../types'
import { setCheckout } from '../checkoutOperations'

const stripe = new Stripe(config().stripe.secret, {
  apiVersion: config().stripe.version,
})

interface OnStripePaymentIntentBody {
  cart: {
    id: string
    quantity: number
  }[]
}

interface OnStripePaymentIntentArgs {
  itemsCollection: firestore.CollectionReference
}

export const onStripePaymentIntent = ({
  itemsCollection,
}: OnStripePaymentIntentArgs) =>
  callable<OnStripePaymentIntentBody, any>({
    validation: yup.object({
      cart: yup.array(
        yup.object({
          id: yup.string().required(),
          quantity: yup
            .number()
            .integer()
            .required(),
        }),
      ),
    }),
    action: async ({ cart }, ctx) => {
      const getSellableItem = async ({
        id,
        quantity,
      }: {
        id: string
        quantity: number
      }) => {
        const doc = await itemsCollection.doc(id).get()
        return { ...doc.data(), quantity, id } as Sellable & Quanitifed
      }

      const items = await Promise.all(cart.map(getSellableItem))

      const paymentIntent = await stripe.paymentIntents.create({
        amount: sumBy(items, ({ price, quantity }) =>
          Math.floor(price.value * quantity * 100),
        ),
        currency: 'cad',
      })

      await setCheckout(paymentIntent.id, {
        payment: paymentIntent.id,
        uid: ctx.auth.uid,
        status: 'created',
        items,
      })

      return { clientSecret: paymentIntent.client_secret }
    },
  })
