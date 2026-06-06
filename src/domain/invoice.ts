import type { InvoiceDraft, InvoiceTotals } from '../types'

export const toMoneyNumber = (value: string | number) => {
  const amount = typeof value === 'number' ? value : Number(value.trim())

  return Number.isFinite(amount) ? amount : 0
}

export const calculateInvoice = (draft: InvoiceDraft): InvoiceTotals => {
  const taxTypesById = new Map(draft.taxTypes.map((taxType) => [taxType.id, taxType]))
  const taxTotalsById = new Map<string, { name: string; rate: number; amount: number }>()

  const lines = draft.lineItems.map((lineItem) => {
    const amount = toMoneyNumber(lineItem.rate) * toMoneyNumber(lineItem.quantity)
    const taxes = (lineItem.taxTypeIds ?? []).flatMap((taxTypeId) => {
      const taxType = taxTypesById.get(taxTypeId)

      if (!taxType) {
        return []
      }

      const rate = toMoneyNumber(taxType.rate)
      const taxAmount = amount * rate
      const current = taxTotalsById.get(taxType.id) ?? {
        name: taxType.name,
        rate,
        amount: 0
      }
      taxTotalsById.set(taxType.id, { ...current, amount: current.amount + taxAmount })

      return [{
        id: taxType.id,
        name: taxType.name || 'Untitled tax',
        rate,
        taxAmount
      }]
    })
    const totalTax = taxes.reduce((sum, tax) => sum + tax.taxAmount, 0)

    return {
      ...lineItem,
      amount,
      taxes,
      totalTax,
      total: amount + totalTax
    }
  })

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0)
  const taxTotals = [...taxTotalsById.entries()].map(([id, tax]) => ({
    id,
    name: tax.name || 'Untitled tax',
    rate: tax.rate,
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

export const formatTaxRate = (rate: number, locale = 'en-AU') => {
  const formattedRate = (rate * 100).toLocaleString(locale, {
    maximumFractionDigits: 4
  })

  return `${formattedRate}%`
}
