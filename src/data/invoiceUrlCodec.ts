import type { InvoiceDraft } from '../types'
import { normalizeInvoiceDraft } from './invoiceDraftNormalizer'

export const invoiceParamName = 'invoice'

type InvoiceUrlPayload = {
  draft: unknown
  v: 1
}

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const encodeBase64Url = (value: string) => {
  const bytes = textEncoder.encode(value)
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const decodeBase64Url = (value: string) => {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/')
  const paddedValue = normalizedValue.padEnd(Math.ceil(normalizedValue.length / 4) * 4, '=')
  const binary = atob(paddedValue)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))

  return textDecoder.decode(bytes)
}

const parseJson = (value: string) => {
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

const parsePayload = (encodedDraft: string) => {
  try {
    return parseJson(decodeBase64Url(encodedDraft)) ?? parseJson(encodedDraft)
  } catch {
    return parseJson(encodedDraft)
  }
}

export const encodeInvoiceDraftForUrl = (draft: InvoiceDraft) =>
  encodeBase64Url(JSON.stringify({ v: 1, draft }))

export const decodeInvoiceDraftFromUrl = (
  encodedDraft: null | string,
  fallbackDraft: InvoiceDraft
): InvoiceDraft => {
  if (!encodedDraft) {
    return fallbackDraft
  }

  const payload = parsePayload(encodedDraft) as Partial<InvoiceUrlPayload> | undefined
  const candidate = (payload?.v === 1 ? payload.draft : payload) as Partial<InvoiceDraft> | undefined

  if (!candidate || typeof candidate !== 'object') {
    return fallbackDraft
  }

  return normalizeInvoiceDraft(candidate, fallbackDraft)
}
