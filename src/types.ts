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
  taxTypeId: string
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

export type InvoiceLineTotal = LineItem & {
  amount: number
  taxAmount: number
  total: number
  taxName: string
}

export type TaxTotal = {
  id: string
  name: string
  amount: number
}

export type InvoiceTotals = {
  lines: InvoiceLineTotal[]
  subtotal: number
  taxTotals: TaxTotal[]
  totalTax: number
  total: number
}
