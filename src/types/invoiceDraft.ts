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

export type InvoiceUrlPayload = {
  v: 1
  draft: InvoiceDraft
}
