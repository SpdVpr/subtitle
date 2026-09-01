import 'server-only'

import { randomUUID } from 'crypto'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  TranslationModel,
  getTranslationCredits,
} from '@/lib/credit-policy'

export interface TranslationPaymentReservation {
  kind: 'free' | 'credits'
  claimId?: string
  creditsCharged: number
}

export async function reserveTranslationPayment(options: {
  userId: string
  subtitleCount: number
  model: TranslationModel
  description: string
}): Promise<TranslationPaymentReservation> {
  const { userId, subtitleCount, model, description } = options
  const db = getAdminDb()
  const userRef = db.collection('users').doc(userId)
  const claimId = randomUUID()
  const creditsRequired = getTranslationCredits(subtitleCount, model)
  const creditTransactionRef = db.collection('credit_transactions').doc()

  return db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef)
    if (!userSnap.exists) throw new Error('USER_NOT_FOUND')

    const user = userSnap.data() || {}
    const riskScore = Number(user.registrationTracking?.suspiciousScore || 0)
    const previousTranslations = Number(user.usage?.translationsUsed || 0)
    const freeAlreadyUsed = Boolean(user.freeTranslationUsed)
    const claimedAt = user.freeTranslationClaimedAt?.toDate?.() || null
    const freeAlreadyClaimed = Boolean(
      user.freeTranslationClaimId &&
      claimedAt &&
      Date.now() - claimedAt.getTime() < 15 * 60 * 1000
    )
    const canUseFreeTranslation =
      riskScore < 50 &&
      previousTranslations === 0 &&
      !freeAlreadyUsed &&
      !freeAlreadyClaimed &&
      subtitleCount > 0

    if (canUseFreeTranslation) {
      tx.update(userRef, {
        freeTranslationClaimId: claimId,
        freeTranslationClaimedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      return { kind: 'free', claimId, creditsCharged: 0 }
    }

    const currentBalance = Number(user.creditsBalance || 0)
    if (currentBalance < creditsRequired) {
      throw new Error(`INSUFFICIENT_CREDITS:${creditsRequired}:${currentBalance}`)
    }

    tx.update(userRef, {
      creditsBalance: currentBalance - creditsRequired,
      updatedAt: FieldValue.serverTimestamp(),
    })
    tx.set(creditTransactionRef, {
      userId,
      type: 'debit',
      credits: creditsRequired,
      description,
      createdAt: FieldValue.serverTimestamp(),
    })

    return { kind: 'credits', creditsCharged: creditsRequired }
  })
}

export async function completeFreeTranslation(userId: string, claimId: string): Promise<void> {
  const db = getAdminDb()
  const userRef = db.collection('users').doc(userId)
  await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef)
    if (!userSnap.exists || userSnap.get('freeTranslationClaimId') !== claimId) return
    tx.update(userRef, {
      freeTranslationUsed: true,
      freeTranslationCompletedAt: FieldValue.serverTimestamp(),
      freeTranslationClaimId: FieldValue.delete(),
      freeTranslationClaimedAt: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  })

  try {
    await db.collection('notifications').doc(`free_translation_complete_${userId}`).set({
      userId,
      type: 'first_translation_completed',
      title: 'Your first translation is ready',
      message: 'Keep your result. If SubtitleBot worked for you, continue with pay-as-you-go credits that never expire.',
      url: '/buy-credits',
      read: false,
      createdAt: new Date().toISOString(),
    }, { merge: true })
  } catch (error) {
    console.warn('Failed to create free-translation lifecycle notification:', error)
  }
}

export async function releaseFreeTranslation(userId: string, claimId: string): Promise<void> {
  const db = getAdminDb()
  const userRef = db.collection('users').doc(userId)
  await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef)
    if (!userSnap.exists || userSnap.get('freeTranslationClaimId') !== claimId) return
    tx.update(userRef, {
      freeTranslationClaimId: FieldValue.delete(),
      freeTranslationClaimedAt: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  })
}
