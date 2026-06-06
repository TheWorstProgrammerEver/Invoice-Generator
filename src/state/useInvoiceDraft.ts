import { useCallback, useState } from 'react'
import type { InvoiceDraft, LineItem, TaxType } from '../types'
import {
  createBlankLineItem,
  createBlankTaxType,
  createDefaultInvoiceDraft
} from './invoiceDraftDefaults'

export const useInvoiceDraft = (initialDraft?: InvoiceDraft) => {
  const [draft, setDraft] = useState(() => initialDraft ?? createDefaultInvoiceDraft())

  const updateField = useCallback(
    <Key extends keyof InvoiceDraft>(field: Key, value: InvoiceDraft[Key]) => {
      setDraft((current) => ({ ...current, [field]: value }))
    },
    []
  )

  const addTaxType = useCallback(() => {
    setDraft((current) => ({
      ...current,
      taxTypes: [...current.taxTypes, createBlankTaxType()]
    }))
  }, [])

  const updateTaxType = useCallback((id: string, changes: Partial<TaxType>) => {
    setDraft((current) => ({
      ...current,
      taxTypes: current.taxTypes.map((taxType) =>
        taxType.id === id && !taxType.locked ? { ...taxType, ...changes } : taxType
      )
    }))
  }, [])

  const removeTaxType = useCallback((id: string) => {
    setDraft((current) => ({
      ...current,
      taxTypes: current.taxTypes.filter((taxType) => taxType.id !== id || taxType.locked),
      lineItems: current.lineItems.map((lineItem) =>
        (lineItem.taxTypeIds ?? []).includes(id)
          ? { ...lineItem, taxTypeIds: lineItem.taxTypeIds.filter((taxTypeId) => taxTypeId !== id) }
          : lineItem
      )
    }))
  }, [])

  const addLineItem = useCallback(() => {
    setDraft((current) => ({
      ...current,
      lineItems: [...current.lineItems, createBlankLineItem()]
    }))
  }, [])

  const updateLineItem = useCallback((id: string, changes: Partial<LineItem>) => {
    setDraft((current) => ({
      ...current,
      lineItems: current.lineItems.map((lineItem) =>
        lineItem.id === id ? { ...lineItem, ...changes } : lineItem
      )
    }))
  }, [])

  const removeLineItem = useCallback((id: string) => {
    setDraft((current) => ({
      ...current,
      lineItems: current.lineItems.filter((lineItem) => lineItem.id !== id)
    }))
  }, [])

  return {
    draft,
    updateField,
    addTaxType,
    updateTaxType,
    removeTaxType,
    addLineItem,
    updateLineItem,
    removeLineItem
  }
}
