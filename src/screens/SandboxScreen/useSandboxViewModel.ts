import { useMemo, useState } from 'react'
import { invoiceModeParamName } from '../../data/invoiceLaunchMode'
import { normalizeInvoiceDraft } from '../../data/invoiceDraftNormalizer'
import { encodeInvoiceDraftForUrl, invoiceParamName } from '../../data/invoiceUrlCodec'
import { calculateInvoice } from '../../domain/invoice'
import { createDefaultInvoiceDraft } from '../../state/invoiceDraftDefaults'
import type { InvoiceDraft, InvoiceTotals, InvoiceUrlPayload } from '../../types'

type ParsedSandboxState =
  | { error: string, status: 'invalid' }
  | { draft: InvoiceDraft, status: 'loaded', totals: InvoiceTotals }

const sampleDraft = {
  invoiceNumber: 'INV-SANDBOX-001',
  customerDetails: 'Sandbox Customer\nExternal System',
  lineItems: [{
    id: 'line-sandbox',
    description: 'Linked invoice payload',
    rate: '150',
    quantity: '2',
    taxTypeIds: ['tax-gst']
  }],
  notes: 'Paste a partial draft or { "v": 1, "draft": { ... } }.'
} satisfies Partial<InvoiceDraft>

const defaultInput = JSON.stringify(sampleDraft, null, 2)

const candidateFromJson = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const payload = value as Partial<InvoiceUrlPayload>

  return payload.v === 1 && payload.draft && typeof payload.draft === 'object'
    ? payload.draft
    : value as Partial<InvoiceDraft>
}

const invoiceUrl = (mode: 'edit' | 'preview' | 'print', draft: InvoiceDraft) => {
  const url = new URL('/', window.location.origin)
  url.searchParams.set(invoiceModeParamName, mode)
  url.searchParams.set(invoiceParamName, encodeInvoiceDraftForUrl(draft))

  return url.toString()
}

export const useSandboxViewModel = () => {
  const defaultDraft = useMemo(() => createDefaultInvoiceDraft(), [])
  const defaultTotals = useMemo(() => calculateInvoice(defaultDraft), [defaultDraft])
  const [jsonInput, setJsonInput] = useState(defaultInput)
  const parsedState = useMemo<ParsedSandboxState>(() => {
    try {
      const candidate = candidateFromJson(JSON.parse(jsonInput))

      if (!candidate) {
        return { error: 'JSON must be an object or invoice URL payload.', status: 'invalid' }
      }

      const draft = normalizeInvoiceDraft(candidate, defaultDraft)

      return {
        draft,
        status: 'loaded',
        totals: calculateInvoice(draft)
      }
    } catch {
      return { error: 'JSON could not be parsed.', status: 'invalid' }
    }
  }, [defaultDraft, jsonInput])

  const draft = parsedState.status === 'loaded' ? parsedState.draft : defaultDraft
  const totals = parsedState.status === 'loaded' ? parsedState.totals : defaultTotals

  return {
    draft,
    editUrl: invoiceUrl('edit', draft),
    error: parsedState.status === 'invalid' ? parsedState.error : '',
    jsonInput,
    previewUrl: invoiceUrl('preview', draft),
    printUrl: invoiceUrl('print', draft),
    setJsonInput,
    totals
  }
}
