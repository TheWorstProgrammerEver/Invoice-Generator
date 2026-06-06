import type { InvoiceDraft, LineItem, TaxType } from '../types'

export const noTaxId = 'tax-no'
const gstTaxId = 'tax-gst'

const dateInputValue = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)

  return localDate.toISOString().slice(0, 10)
}

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const defaultTaxTypes: TaxType[] = [
  { id: noTaxId, name: 'No Tax', rate: 0, locked: true },
  { id: gstTaxId, name: 'GST', rate: 0.1, locked: true }
]

export const createBlankLineItem = (): LineItem => ({
  id: createId('line'),
  description: '',
  rate: '',
  quantity: '1',
  taxTypeIds: []
})

export const createBlankTaxType = (): TaxType => ({
  id: createId('tax'),
  name: '',
  rate: 0
})

export const createDefaultInvoiceDraft = (): InvoiceDraft => {
  const today = new Date()

  return {
    sellerDetails: 'Your Name\nYour Address\nABN: 12 345 678 901\nEmail: you@example.com',
    invoiceNumber: 'INV-001',
    currency: 'AUD',
    dateIssued: dateInputValue(today),
    dateDue: dateInputValue(addDays(today, 30)),
    customerDetails: 'Customer Name\nCustomer Address',
    taxTypes: defaultTaxTypes,
    lineItems: [createBlankLineItem()],
    notes: '',
    paymentInstructions: 'BSB: 123-456\nAccount: 12345678\nReference: Invoice Number'
  }
}
