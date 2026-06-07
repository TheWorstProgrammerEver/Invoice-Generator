import { describe, expect, it } from 'vitest'
import { parseInvoiceLaunchMode } from '../../../src/data/invoiceLaunchMode'

describe('invoice launch mode', () => {
  it('accepts supported launch modes', () => {
    expect(parseInvoiceLaunchMode('edit')).toBe('edit')
    expect(parseInvoiceLaunchMode('preview')).toBe('preview')
    expect(parseInvoiceLaunchMode('print')).toBe('print')
  })

  it('defaults unsupported launch modes to edit', () => {
    expect(parseInvoiceLaunchMode(null)).toBe('edit')
    expect(parseInvoiceLaunchMode('share')).toBe('edit')
  })
})
