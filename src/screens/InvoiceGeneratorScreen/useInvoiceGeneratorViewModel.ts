import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  decodeInvoiceDraftFromUrl,
  encodeInvoiceDraftForUrl,
  invoiceParamName
} from '../../data/invoiceUrlCodec'
import { calculateInvoice } from '../../domain/invoice'
import { createDefaultInvoiceDraft } from '../../state/invoiceDraftDefaults'
import { useInvoiceDraft } from '../../state/useInvoiceDraft'

export const useInvoiceGeneratorViewModel = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialDraft = useRef(
    decodeInvoiceDraftFromUrl(searchParams.get(invoiceParamName), createDefaultInvoiceDraft())
  )
  const shouldClearUrlInvoice = useRef(searchParams.has(invoiceParamName))
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareStatus, setShareStatus] = useState<'copied' | 'idle' | 'ready'>('idle')
  const draftState = useInvoiceDraft(initialDraft.current)
  const totals = useMemo(() => calculateInvoice(draftState.draft), [draftState.draft])

  useEffect(() => {
    if (!shouldClearUrlInvoice.current) {
      return
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete(invoiceParamName)
    setSearchParams(nextParams, { replace: true })
    shouldClearUrlInvoice.current = false
  }, [searchParams, setSearchParams])

  const printInvoice = () => {
    window.print()
  }

  const shareInvoice = useCallback(async () => {
    const nextUrl = new URL(window.location.href)
    nextUrl.searchParams.set(invoiceParamName, encodeInvoiceDraftForUrl(draftState.draft))
    const url = nextUrl.toString()
    setShareUrl(url)
    setIsShareDialogOpen(true)

    try {
      await navigator.clipboard?.writeText(url)
      setShareStatus('copied')
    } catch {
      setShareStatus('ready')
    }
  }, [draftState.draft])

  const closeShareDialog = useCallback(() => {
    setIsShareDialogOpen(false)
  }, [])

  return {
    ...draftState,
    totals,
    appName: window.config?.appName ?? 'Invoice Generator',
    closeShareDialog,
    environment: window.config?.environment ?? 'local',
    isShareDialogOpen,
    printInvoice,
    shareInvoice,
    shareStatus,
    shareUrl
  }
}
