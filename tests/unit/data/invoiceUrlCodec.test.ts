import { describe, expect, it } from 'vitest'
import {
  decodeInvoiceDraftFromUrl,
  encodeInvoiceDraftForUrl
} from '../../../src/data/invoiceUrlCodec'
import type { InvoiceDraft } from '../../../src/types'

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
  it('round-trips a complete invoice draft through the URL payload', () => {
    expect(decodeInvoiceDraftFromUrl(encodeInvoiceDraftForUrl(draft), fallbackDraft)).toEqual(draft)
  })

  it('accepts raw JSON payloads for programmatic callers', () => {
    const encodedDraft = JSON.stringify({ v: 1, draft })

    expect(decodeInvoiceDraftFromUrl(encodedDraft, fallbackDraft)).toEqual(draft)
  })

  it('falls back safely when the payload is invalid', () => {
    expect(decodeInvoiceDraftFromUrl('not-json-or-base64', fallbackDraft)).toEqual(fallbackDraft)
  })
})
