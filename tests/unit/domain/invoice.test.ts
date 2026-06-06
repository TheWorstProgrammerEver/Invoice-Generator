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
    { id: 'levy', name: 'Service Levy', rate: 0.05 }
  ],
  lineItems: [
    { id: 'line-1', description: 'Build app', rate: '100', quantity: '2', taxTypeIds: ['gst', 'levy'] },
    { id: 'line-2', description: 'Hosting', rate: '50', quantity: '1', taxTypeIds: [] },
    { id: 'line-3', description: 'Support', rate: '25', quantity: '4', taxTypeIds: ['levy'] }
  ],
  notes: '',
  paymentInstructions: ''
}

describe('calculateInvoice', () => {
  it('calculates line totals and aggregates tax by selected tax ids', () => {
    const totals = calculateInvoice(draft)

    expect(totals.subtotal).toBe(350)
    expect(totals.totalTax).toBe(35)
    expect(totals.total).toBe(385)
    expect(totals.lines[0].taxes).toEqual([
      { id: 'gst', name: 'GST', rate: 0.1, taxAmount: 20 },
      { id: 'levy', name: 'Service Levy', rate: 0.05, taxAmount: 10 }
    ])
    expect(totals.taxTotals).toEqual([
      { id: 'gst', name: 'GST', rate: 0.1, amount: 20 },
      { id: 'levy', name: 'Service Levy', rate: 0.05, amount: 15 }
    ])
  })

  it('ignores removed tax types', () => {
    const totals = calculateInvoice({
      ...draft,
      lineItems: [{ id: 'line-1', description: 'Mystery', rate: '99', quantity: '1', taxTypeIds: ['gone'] }]
    })

    expect(totals.totalTax).toBe(0)
    expect(totals.total).toBe(99)
    expect(totals.lines[0].taxes).toEqual([])
  })
})

describe('formatMoney', () => {
  it('formats with a currency prefix and two decimals', () => {
    expect(formatMoney(1234.5, 'aud')).toBe('AUD 1,234.50')
  })
})
