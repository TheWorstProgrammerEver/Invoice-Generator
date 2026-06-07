import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  decodeInvoiceDraftFromUrl,
  encodeInvoiceDraftForUrl
} from '../../../src/data/invoiceUrlCodec'
import type { InvoiceDraft } from '../../../src/types'

const invoiceUrlPayloadSchema = JSON.parse(
  readFileSync('public/invoice-url-payload.schema.json', 'utf8')
) as {
  title: string
  properties: Record<string, unknown>
  $defs: Record<string, unknown>
}

const decodeEncodedPayloadForTest = (encodedDraft: string) => {
  const normalizedValue = encodedDraft.replace(/-/g, '+').replace(/_/g, '/')
  const paddedValue = normalizedValue.padEnd(Math.ceil(normalizedValue.length / 4) * 4, '=')

  return JSON.parse(Buffer.from(paddedValue, 'base64').toString('utf8'))
}

const fallbackDraft: InvoiceDraft = {
  sellerDetails: 'Fallback Seller',
  invoiceNumber: 'INV-FALLBACK',
  currency: 'AUD',
  dateIssued: '2026-06-06',
  dateDue: '2026-07-06',
  customerDetails: 'Fallback Customer',
  taxTypes: [
    { id: 'tax-no', name: 'No Tax', rate: 0, locked: true },
    { id: 'tax-gst', name: 'GST', rate: 0.1, locked: true }
  ],
  lineItems: [],
  notes: '',
  paymentInstructions: ''
}

const draft: InvoiceDraft = {
  ...fallbackDraft,
  sellerDetails: 'Ryan\nABN: 12 345 678 901',
  invoiceNumber: 'INV-URL-001',
  customerDetails: 'Café Customer',
  taxTypes: [
    ...fallbackDraft.taxTypes,
    { id: 'tax-levy', name: 'Service levy', rate: 0.05 }
  ],
  lineItems: [{
    id: 'line-1',
    description: 'Programmatic invoice\nUnicode ✓',
    rate: '120',
    quantity: '2',
    taxTypeIds: ['tax-gst', 'tax-levy']
  }],
  notes: 'Generated elsewhere',
  paymentInstructions: 'Pay the link'
}

describe('invoice URL codec', () => {
  it('publishes the generated URL payload schema', () => {
    expect(invoiceUrlPayloadSchema.title).toBe('InvoiceUrlPayload')
    expect(invoiceUrlPayloadSchema.properties).toHaveProperty('v')
    expect(invoiceUrlPayloadSchema.properties).toHaveProperty('draft')
    expect(invoiceUrlPayloadSchema.$defs).toHaveProperty('InvoiceDraft')
    expect(invoiceUrlPayloadSchema.$defs).toHaveProperty('LineItem')
    expect(invoiceUrlPayloadSchema.$defs).toHaveProperty('TaxType')
  })

  it('encodes drafts with the published payload wrapper', () => {
    expect(decodeEncodedPayloadForTest(encodeInvoiceDraftForUrl(draft))).toEqual({
      v: 1,
      draft
    })
  })

  it('round-trips a complete invoice draft through the URL payload', () => {
    expect(decodeInvoiceDraftFromUrl(encodeInvoiceDraftForUrl(draft))).toEqual({
      draft,
      status: 'loaded'
    })
  })

  it('accepts raw JSON payloads for programmatic callers', () => {
    const encodedDraft = JSON.stringify({ v: 1, draft })

    expect(decodeInvoiceDraftFromUrl(encodedDraft)).toEqual({
      draft,
      status: 'loaded'
    })
  })

  it('reports missing URL payloads', () => {
    expect(decodeInvoiceDraftFromUrl(null)).toEqual({ status: 'empty' })
  })

  it('reports invalid URL payloads', () => {
    expect(decodeInvoiceDraftFromUrl('not-json-or-base64')).toEqual({
      status: 'invalid'
    })
  })
})
