export const invoiceModeParamName = 'mode'

export type InvoiceLaunchMode = 'edit' | 'preview' | 'print'

export const invoiceLaunchModes: InvoiceLaunchMode[] = ['edit', 'preview', 'print']

export const parseInvoiceLaunchMode = (value: null | string): InvoiceLaunchMode => {
  if (value && invoiceLaunchModes.includes(value as InvoiceLaunchMode)) {
    return value as InvoiceLaunchMode
  }

  return 'edit'
}
