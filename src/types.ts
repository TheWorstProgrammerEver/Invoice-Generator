export type TaxType = {
  id: string
  name: string
  rate: number
  locked?: boolean
}

export type LineItem = {
  id: string
  description: string
  rate: string
  quantity: string
  taxTypeIds: string[]
}

export type InvoiceDraft = {
  sellerDetails: string
  invoiceNumber: string
  currency: string
  dateIssued: string
  dateDue: string
  customerDetails: string
  taxTypes: TaxType[]
  lineItems: LineItem[]
  notes: string
  paymentInstructions: string
}

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
