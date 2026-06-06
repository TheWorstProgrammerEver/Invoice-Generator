import type { InvoiceDraft, LineItem, TaxType } from '../types'

const stringValue = (value: unknown, fallback: string) =>
  typeof value === 'string' ? value : fallback

const numberValue = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const booleanValue = (value: unknown, fallback?: boolean) =>
  typeof value === 'boolean' ? value : fallback

const normalizeTaxTypes = (value: unknown, fallback: TaxType[]) => {
  if (!Array.isArray(value)) {
    return fallback
  }

  return value.map((taxType, index) => {
    const fallbackTaxType = fallback[index] ?? { id: `tax-${index}`, name: '', rate: 0 }
    const candidate = taxType && typeof taxType === 'object' ? taxType as Partial<TaxType> : {}

    return {
      id: stringValue(candidate.id, fallbackTaxType.id),
      name: stringValue(candidate.name, fallbackTaxType.name),
      rate: numberValue(candidate.rate, fallbackTaxType.rate),
      locked: booleanValue(candidate.locked, fallbackTaxType.locked)
    }
  })
}

const normalizeLineItems = (value: unknown, fallback: LineItem[]) => {
  if (!Array.isArray(value)) {
    return fallback
  }

  return value.map((lineItem, index) => {
    const fallbackLineItem = fallback[index] ?? {
      id: `line-${index}`,
      description: '',
      rate: '',
      quantity: '1',
      taxTypeIds: []
    }
    const candidate = lineItem && typeof lineItem === 'object' ? lineItem as Partial<LineItem> : {}

    return {
      id: stringValue(candidate.id, fallbackLineItem.id),
      description: stringValue(candidate.description, fallbackLineItem.description),
      rate: stringValue(candidate.rate, fallbackLineItem.rate),
      quantity: stringValue(candidate.quantity, fallbackLineItem.quantity),
      taxTypeIds: Array.isArray(candidate.taxTypeIds)
        ? candidate.taxTypeIds.filter((taxTypeId): taxTypeId is string => typeof taxTypeId === 'string')
        : fallbackLineItem.taxTypeIds
    }
  })
}

export const normalizeInvoiceDraft = (
  candidate: Partial<InvoiceDraft>,
  fallbackDraft: InvoiceDraft
): InvoiceDraft => ({
  sellerDetails: stringValue(candidate.sellerDetails, fallbackDraft.sellerDetails),
  invoiceNumber: stringValue(candidate.invoiceNumber, fallbackDraft.invoiceNumber),
  currency: stringValue(candidate.currency, fallbackDraft.currency),
  dateIssued: stringValue(candidate.dateIssued, fallbackDraft.dateIssued),
  dateDue: stringValue(candidate.dateDue, fallbackDraft.dateDue),
  customerDetails: stringValue(candidate.customerDetails, fallbackDraft.customerDetails),
  taxTypes: normalizeTaxTypes(candidate.taxTypes, fallbackDraft.taxTypes),
  lineItems: normalizeLineItems(candidate.lineItems, fallbackDraft.lineItems),
  notes: stringValue(candidate.notes, fallbackDraft.notes),
  paymentInstructions: stringValue(candidate.paymentInstructions, fallbackDraft.paymentInstructions)
})
