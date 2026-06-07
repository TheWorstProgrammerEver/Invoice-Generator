import type { LineItem } from './types/invoiceDraft'

export type {
  InvoiceDraft,
  InvoiceUrlPayload,
  LineItem,
  TaxType
} from './types/invoiceDraft'

export type InvoiceTaxAmount = {
  id: string
  name: string
  rate: number
  taxAmount: number
}

export type InvoiceLineTotal = LineItem & {
  amount: number
  taxes: InvoiceTaxAmount[]
  totalTax: number
  total: number
}

export type TaxTotal = {
  id: string
  name: string
  rate: number
  amount: number
}

export type InvoiceTotals = {
  lines: InvoiceLineTotal[]
  subtotal: number
  taxTotals: TaxTotal[]
  totalTax: number
  total: number
}
