import { NextRequest, NextResponse } from 'next/server'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { PremiumTranslationService } from '@/lib/premium-translation-service'
import { verifyUser } from '@/lib/user-auth-server'
import {
  completeFreeTranslation,
  releaseFreeTranslation,
  reserveTranslationPayment,
  type TranslationPaymentReservation,
} from '@/lib/free-translation-server'
import type { TranslationModel } from '@/lib/credit-policy'

export async function GET() {
  return NextResponse.json({ message: 'Simple translate endpoint is working' })
}

export async function POST(request: NextRequest) {
  let reservation: TranslationPaymentReservation | null = null
  let userId = ''
  let fileName = 'subtitle file'

  try {
    const authUser = await verifyUser(request)
    if (!authUser) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    if (!authUser.emailVerified) {
      return NextResponse.json({ error: 'Email verification required.', code: 'EMAIL_NOT_VERIFIED' }, { status: 403 })
    }
    userId = authUser.uid

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const targetLanguage = (formData.get('targetLanguage') as string) || 'cs'
    const sourceLanguage = (formData.get('sourceLanguage') as string) || 'en'
    const model: TranslationModel = formData.get('translationModel') === 'premium' ? 'premium' : 'standard'
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    fileName = file.name

    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) return NextResponse.json({ error: 'Translation service is not configured.' }, { status: 500 })

    const entries = SubtitleProcessor.parseSRT(await file.text())
    if (!entries.length) return NextResponse.json({ error: 'No valid subtitles found in file' }, { status: 400 })

    try {
      reservation = await reserveTranslationPayment({
        userId,
        subtitleCount: entries.length,
        model,
        description: `${model} translation: ${entries.length} subtitles`,
      })
    } catch (error) {
      const [code, required = '0', available = '0'] = (error instanceof Error ? error.message : '').split(':')
      const message = code === 'INSUFFICIENT_CREDITS'
          ? `Insufficient credits. Required: ${Number(required).toFixed(1)}, available: ${Number(available).toFixed(1)}.`
          : 'Failed to reserve translation payment.'
      return NextResponse.json({ error: message, code }, { status: 402 })
    }

    const startTime = Date.now()
    const translator = new PremiumTranslationService(geminiKey, model)
    const translatedEntries = await translator.translateSubtitles(
      entries,
      targetLanguage,
      sourceLanguage || 'en',
      file.name,
      () => undefined
    )
    const translatedContent = SubtitleProcessor.generateSRT(translatedEntries, targetLanguage)
    const translatedFileName = file.name.replace(/\.[^.]+$/, `_${targetLanguage}.srt`)

    const { TranslationJobService, UserService } = await import('@/lib/database-admin')
    const jobId = await TranslationJobService.createJob({
      userId,
      type: 'single',
      status: 'completed',
      originalFileName: file.name,
      originalFileSize: file.size,
      sourceLanguage: sourceLanguage || undefined,
      targetLanguage,
      aiService: 'google',
      translatedFileName,
      translatedContent,
      subtitleCount: translatedEntries.length,
      characterCount: translatedContent.length,
      processingTimeMs: Date.now() - startTime,
      completedAt: new Date() as any,
    })
    await UserService.updateUsage(userId, { translationsUsed: 1, lastActive: new Date() })
    if (reservation.kind === 'free' && reservation.claimId) {
      await completeFreeTranslation(userId, reservation.claimId)
    }

    return NextResponse.json({
      type: 'result',
      status: 'completed',
      translatedContent,
      translatedFileName,
      subtitleCount: entries.length,
      creditsUsed: reservation.creditsCharged,
      paymentKind: reservation.kind,
      jobId,
      processingTimeMs: Date.now() - startTime,
    })
  } catch (error) {
    try {
      if (reservation?.kind === 'free' && reservation.claimId) {
        await releaseFreeTranslation(userId, reservation.claimId)
      } else if (reservation?.creditsCharged) {
        const { UserService } = await import('@/lib/database-admin')
        await UserService.adjustCredits(userId, reservation.creditsCharged, `Full refund for failed translation: ${fileName}`)
      }
    } catch (refundError) {
      console.error('Failed to release/refund fallback translation:', refundError)
    }
    console.error('Simple translation failed:', error)
    return NextResponse.json({ error: 'Translation failed. Your payment reservation was released.' }, { status: 500 })
  }
}
