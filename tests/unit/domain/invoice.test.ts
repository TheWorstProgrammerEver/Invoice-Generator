import { describe, expect, it } from 'vitest'
import { calculateInvoice, formatMoney } from '../../../src/domain/invoice'
import type { InvoiceDraft } from '../../../src/types'

const draft: InvoiceDraft = {
  sellerDetails: 'Seller',
  invoiceNumber: 'INV-001',
  currency: 'AUD',
  dateIssued: '2026-06-06',
  dateDue: '2026-07-06',
  customerDetails: 'Customer',
  taxTypes: [
    { id: 'no-tax', name: 'No Tax', rate: 0 },
    { id: 'gst', name: 'GST', rate: 0.1 },
    { id: 'other-gst', name: 'Other GST', rate: 0.1 }
  ],
  lineItems: [
    { id: 'line-1', description: 'Build app', rate: '100', quantity: '2', taxTypeId: 'gst' },
    { id: 'line-2', description: 'Hosting', rate: '50', quantity: '1', taxTypeId: 'no-tax' },
    { id: 'line-3', description: 'Support', rate: '25', quantity: '4', taxTypeId: 'other-gst' }
  ],
  notes: '',
  paymentInstructions: ''
}

describe('calculateInvoice', () => {
  it('calculates line totals and aggregates tax by selected tax id', () => {
    const totals = calculateInvoice(draft)

    expect(totals.subtotal).toBe(350)
    expect(totals.totalTax).toBe(30)
    expect(totals.total).toBe(380)
    expect(totals.taxTotals).toEqual([
      { id: 'gst', name: 'GST', amount: 20 },
      { id: 'other-gst', name: 'Other GST', amount: 10 }
    ])
  })

  it('falls back to no tax for removed tax types', () => {
    const totals = calculateInvoice({
      ...draft,
      lineItems: [{ id: 'line-1', description: 'Mystery', rate: '99', quantity: '1', taxTypeId: 'gone' }]
    })

    expect(totals.totalTax).toBe(0)
    expect(totals.total).toBe(99)
    expect(totals.lines[0].taxName).toBe('No Tax')
  })
})

describe('formatMoney', () => {
  it('formats with a currency prefix and two decimals', () => {
    expect(formatMoney(1234.5, 'aud')).toBe('AUD 1,234.50')
  })
})
