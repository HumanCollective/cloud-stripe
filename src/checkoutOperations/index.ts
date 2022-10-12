import { firestore } from 'firebase-admin'
import {
  firestoreSet,
  firestoreAdd,
  firestoreDelete,
  firestoreGet,
  firestoreUpdate,
  Log,
  readSnapshot,
} from '@humancollective/cloud-firebase'

import { TimestampDates, WithId, Checkout } from '../types'

const options = {
  debugName: 'checkout',
  collectionPath: 'checkouts',
}

export const getCheckout = firestoreGet<Checkout>(options)
export const addCheckout = firestoreAdd<Checkout>(options)
export const updateCheckout = firestoreUpdate<Checkout>(options)
export const setCheckout = firestoreSet<Checkout>(options)
export const deleteCheckout = firestoreDelete(options)

export const getCheckoutBySession = async (
  session: string,
): Promise<WithId<Checkout>> => {
  try {
    Log.breadcrumb(`getting checkout for session "${session}"`)

    const checkoutQuery = await firestore()
      .collection(options.collectionPath)
      .where('session', '==', session)
      .limit(1)
      .get()

    if (checkoutQuery.size > 0) {
      throw new Error('checkout not found')
    }
    const doc = checkoutQuery.docs[0]

    const checkout = readSnapshot<Checkout>(doc)
    if (!checkout) {
      throw new Error('checkout not found')
    }

    return checkout
  } catch (error) {
    Log.error(error)
    throw error
  }
}

export const getCheckouts = async ({
  sinceDate,
}: {
  sinceDate?: firestore.Timestamp
}): Promise<WithId<Checkout>[]> => {
  try {
    Log.breadcrumb('getting checkouts')

    let query = await firestore()
      .collection(options.collectionPath)
      .where('status', '==', 'completed')

    if (sinceDate) {
      query = query.where('dateCreated', '>=', sinceDate)
    }

    const snap = await query.get()

    const docs = snap.docs.map(a => {
      const data = a.data() as TimestampDates<
        Checkout,
        'dateCreated' | 'dateUpdated'
      >
      const dateCreated = data.dateCreated.toDate()
      const dateUpdated = data.dateUpdated.toDate()
      return { ...data, id: a.id, dateCreated, dateUpdated } as WithId<Checkout>
    })

    return docs
  } catch (error) {
    Log.error(error)
    throw error
  }
}
