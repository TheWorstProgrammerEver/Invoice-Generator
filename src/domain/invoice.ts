import type { InvoiceDraft, InvoiceTotals, TaxType } from '../types'

const fallbackTax: TaxType = {
  id: 'tax-no',
  name: 'No Tax',
  rate: 0
}

export const toMoneyNumber = (value: string | number) => {
  const amount = typeof value === 'number' ? value : Number(value.trim())

  return Number.isFinite(amount) ? amount : 0
}

export const calculateInvoice = (draft: InvoiceDraft): InvoiceTotals => {
  const taxTypesById = new Map(draft.taxTypes.map((taxType) => [taxType.id, taxType]))
  const taxTotalsById = new Map<string, { name: string; amount: number }>()

  const lines = draft.lineItems.map((lineItem) => {
    const taxType = taxTypesById.get(lineItem.taxTypeId) ?? fallbackTax
    const amount = toMoneyNumber(lineItem.rate) * toMoneyNumber(lineItem.quantity)
    const taxAmount = amount * toMoneyNumber(taxType.rate)

    if (taxAmount !== 0) {
      const current = taxTotalsById.get(taxType.id) ?? { name: taxType.name, amount: 0 }
      taxTotalsById.set(taxType.id, { ...current, amount: current.amount + taxAmount })
    }

    return {
      ...lineItem,
      amount,
      taxAmount,
      total: amount + taxAmount,
      taxName: taxType.name || 'Untitled tax'
    }
  })

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0)
  const taxTotals = [...taxTotalsById.entries()].map(([id, tax]) => ({
    id,
    name: tax.name || 'Untitled tax',
    amount: tax.amount
  }))
  const totalTax = taxTotals.reduce((sum, tax) => sum + tax.amount, 0)

  return {
    lines,
    subtotal,
    taxTotals,
    totalTax,
    total: subtotal + totalTax
  }
}

export const formatMoney = (amount: number, currency: string, locale = 'en-AU') => {
  const currencyCode = currency.trim().toUpperCase() || 'AUD'
  const formattedAmount = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  return `${currencyCode} ${formattedAmount}`
}
