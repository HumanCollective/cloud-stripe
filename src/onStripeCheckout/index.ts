import * as yup from 'yup'
import Stripe from 'stripe'
import { config } from 'firebase-functions'
import { customAlphabet } from 'nanoid'
import { auth } from 'firebase-admin'
import { chunk } from 'lodash'
import { callable } from '@humancollective/cloud-firebase'

import { Quanitifed, Sellable } from '../types'
import { setCheckout } from '../checkoutOperations'

const stripe = new Stripe(config().stripe.secret, {
  apiVersion: config().stripe.version,
})

interface OnStripeCheckoutBody {
  cart: {
    id: string
    quantity: number
  }[]
}

interface OnStripeCheckoutArgs {
  itemsCollection: FirebaseFirestore.CollectionReference
  successUrl: (orderReference: string) => string | string
  cancelUrl: string
}

export const onStripeCheckout = ({
  itemsCollection,
  successUrl,
  cancelUrl,
}: OnStripeCheckoutArgs) =>
  callable<OnStripeCheckoutBody, any>({
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
      const user = await auth().getUser(ctx.auth.uid)

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

      // https://zelark.github.io/nano-id-cc/
      const referenceCode = customAlphabet(
        '2345678ABCDEFGHJKMNPQRSTUVWXYZ',
        12,
      )()

      // turns XXXXXXXXXXXX into XXXX-XXXX-XXXX
      const chunkedReferenceCode = chunk(referenceCode.split(''), 4)
        .map(part => part.join(''))
        .join('-')

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: user?.email || undefined,
        phone_number_collection: { enabled: true },
        line_items: items.map(
          ({ quantity, name, description, images, price }) => ({
            quantity,
            name,
            description,
            images,
            amount: Math.floor(price.value * 100),
            currency: price.currency,
          }),
        ),
        success_url:
          typeof successUrl === 'function'
            ? successUrl(chunkedReferenceCode)
            : successUrl,
        cancel_url: cancelUrl,
      })

      await setCheckout(chunkedReferenceCode, {
        session: session.id,
        uid: ctx.auth.uid,
        status: 'created',
        items,
      })

      return { session }
    },
  })
