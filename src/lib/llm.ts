/**
 * The one place that calls a language model.
 *
 * By default requests go through Vercel AI Gateway, billed to the Vercel team. On a
 * Vercel deployment it authenticates with the deployment's OIDC token; elsewhere it
 * needs AI_GATEWAY_API_KEY (or a VERCEL_OIDC_TOKEN from `vercel env pull`).
 * Set TRANSLATION_PROVIDER=gemini to call Google's Gemini API directly with
 * GEMINI_API_KEY instead.
 *
 * Why: the direct Gemini account ran out of prepaid credits on 2026-11-24 and every
 * translation failed with 402 until requests were moved to the gateway.
 */

export type LlmModel = 'flash' | 'pro'
export type LlmThinkingLevel = 'minimal' | 'low'

export interface LlmResult {
  text: string
  /** Provider finish reason, e.g. 'stop', 'content-filter', 'PROHIBITED_CONTENT'. */
  finishReason?: string
}

const MODELS = {
  gateway: { flash: 'google/gemini-3-flash', pro: 'google/gemini-3.1-pro-preview' },
  gemini: { flash: 'gemini-3-flash-preview', pro: 'gemini-3.1-pro-preview' },
} as const

type Provider = keyof typeof MODELS

function provider(): Provider {
  return process.env.TRANSLATION_PROVIDER === 'gemini' ? 'gemini' : 'gateway'
}

/** Whether the selected provider has credentials to work with. */
export function isLlmConfigured(): boolean {
  if (provider() === 'gemini') return Boolean(process.env.GEMINI_API_KEY)
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL)
}

/**
 * The provider refused the request for a reason no retry will fix: out of credits,
 * a bad key, access denied. The message is shown to the user as is.
 */
export class LlmUnavailableError extends Error {
  constructor(cause: unknown) {
    super('The translation service is temporarily unavailable. You were not charged. Please try again later.', { cause })
    this.name = 'LlmUnavailableError'
  }
}

const FATAL_STATUS = new Set([401, 402, 403])
const FATAL_MESSAGE = /prepayment credits|insufficient (funds|credit)|no positive credit|api key not valid|invalid api key/i

function isProviderUnavailable(err: unknown): boolean {
  // The AI SDK wraps the provider error in RetryError.lastError or Error.cause.
  let current: any = err
  for (let depth = 0; current && depth < 5; depth++) {
    if (FATAL_STATUS.has(Number(current.statusCode ?? current.status))) return true
    if (typeof current.message === 'string' && FATAL_MESSAGE.test(current.message)) return true
    current = current.lastError ?? current.cause
  }
  return false
}

export async function generate(options: {
  model: LlmModel
  prompt: string
  thinkingLevel: LlmThinkingLevel
}): Promise<LlmResult> {
  try {
    return provider() === 'gemini' ? await viaGemini(options) : await viaGateway(options)
  } catch (err) {
    if (isProviderUnavailable(err)) {
      console.error(`🚨 LLM provider "${provider()}" is unavailable (billing or credentials):`, err instanceof Error ? err.message : err)
      throw new LlmUnavailableError(err)
    }
    throw err
  }
}

async function viaGateway({ model, prompt, thinkingLevel }: Parameters<typeof generate>[0]): Promise<LlmResult> {
  const { generateText } = await import('ai')
  const result = await generateText({
    model: MODELS.gateway[model],
    prompt,
    providerOptions: {
      google: { thinkingConfig: { thinkingLevel } },
    },
  })
  return { text: result.text, finishReason: result.finishReason }
}

async function viaGemini({ model, prompt, thinkingLevel }: Parameters<typeof generate>[0]): Promise<LlmResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new LlmUnavailableError(new Error('GEMINI_API_KEY is not set'))

  const { GoogleGenAI, ThinkingLevel } = await import('@google/genai')
  const ai = new GoogleGenAI({ apiKey })
  const result = await ai.models.generateContent({
    model: MODELS.gemini[model],
    contents: prompt,
    config: {
      thinkingConfig: {
        thinkingLevel: thinkingLevel === 'low' ? ThinkingLevel.LOW : ThinkingLevel.MINIMAL,
      },
    },
  })
  return {
    text: result.text || '',
    finishReason: result.candidates?.[0]?.finishReason ?? result.promptFeedback?.blockReason,
  }
}
