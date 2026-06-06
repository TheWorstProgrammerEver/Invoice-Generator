import { useMemo } from 'react'
import { calculateInvoice } from '../../domain/invoice'
import { useInvoiceDraft } from '../../state/useInvoiceDraft'

export const useInvoiceGeneratorViewModel = () => {
  const draftState = useInvoiceDraft()
  const totals = useMemo(() => calculateInvoice(draftState.draft), [draftState.draft])

  const printInvoice = () => {
    window.print()
  }

  return {
    ...draftState,
    totals,
    appName: window.config?.appName ?? 'Invoice Generator',
    environment: window.config?.environment ?? 'local',
    printInvoice
  }
}
