import { expect, test } from '@playwright/test'
import {
  decodeInvoiceDraftFromUrl,
  encodeInvoiceDraftForUrl,
  invoiceParamName
} from '../../src/data/invoiceUrlCodec'
import type { InvoiceDraft } from '../../src/types'

const linkedDraft: InvoiceDraft = {
  sellerDetails: 'URL Seller\nABN: 12 345 678 901',
  invoiceNumber: 'INV-LINK-042',
  currency: 'AUD',
  dateIssued: '2026-06-06',
  dateDue: '2026-07-06',
  customerDetails: 'URL Customer',
  taxTypes: [
    { id: 'tax-no', name: 'No Tax', rate: 0, locked: true },
    { id: 'tax-gst', name: 'GST', rate: 0.1, locked: true },
    { id: 'tax-levy', name: 'Service levy', rate: 0.05 }
  ],
  lineItems: [{
    id: 'line-url',
    description: 'URL-created work',
    rate: '200',
    quantity: '3',
    taxTypeIds: ['tax-gst', 'tax-levy']
  }],
  notes: 'Loaded from the address bar',
  paymentInstructions: 'Pay from URL'
}

test('invoice generator renders and updates the preview', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Invoice Generator' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'INV-001' })).toBeVisible()

  const taxTypes = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Tax Types' })
  })
  await taxTypes.getByRole('button', { name: 'Add Tax Type' }).click()
  await taxTypes.getByLabel('Name').last().fill('Service levy')
  await taxTypes.getByLabel('Rate').last().fill('0.05')

  const firstItem = page.locator('article').filter({ hasText: 'Item 1' })
  await firstItem.getByLabel('Description').fill('Design system audit\nInvoice preview polish')
  await firstItem.getByLabel('Rate').fill('120')
  await firstItem.getByLabel('Qty').fill('2')
  await firstItem.getByRole('checkbox', { name: 'GST 10%' }).check()
  await firstItem.getByRole('checkbox', { name: 'Service levy 5%' }).check()

  const preview = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'INV-001' })
  })

  await expect(preview.getByText('Design system audit')).toBeVisible()
  await expect(preview.getByText('Invoice preview polish')).toBeVisible()
  await expect(preview.getByRole('rowheader', { name: 'GST', exact: true })).toBeVisible()
  await expect(preview.getByRole('rowheader', { name: 'Service levy', exact: true })).toBeVisible()
  await expect(preview.getByText('AUD 276.00').first()).toBeVisible()
})

test('invoice generator follows system dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Invoice Generator' })).toBeVisible()

  const pageBackground = await page.locator('body').evaluate((body) => {
    return getComputedStyle(body).backgroundColor
  })
  const fieldBackground = await page.getByLabel('Invoice Number', { exact: true }).evaluate((input) => {
    return getComputedStyle(input).backgroundColor
  })

  expect(pageBackground).toBe('rgb(18, 23, 25)')
  expect(fieldBackground).toBe('rgb(21, 27, 30)')
})

test('invoice generator loads from the URL and shares on demand', async ({ page }) => {
  await page.goto(`/?${invoiceParamName}=${encodeInvoiceDraftForUrl(linkedDraft)}`)

  await expect(page.getByRole('heading', { name: 'INV-LINK-042' })).toBeVisible()
  await expect.poll(() => new URL(page.url()).searchParams.has(invoiceParamName)).toBe(false)

  const preview = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'INV-LINK-042' })
  })
  await expect(preview.getByText('URL-created work')).toBeVisible()
  await expect(preview.getByRole('rowheader', { name: 'GST', exact: true })).toBeVisible()
  await expect(preview.getByRole('rowheader', { name: 'Service levy', exact: true })).toBeVisible()
  await expect(preview.getByText('AUD 690.00').first()).toBeVisible()

  await page.getByLabel('Invoice Number', { exact: true }).fill('INV-LINK-043')
  await expect.poll(() => new URL(page.url()).searchParams.has(invoiceParamName)).toBe(false)
  await page.getByRole('button', { name: 'Share Draft' }).click()

  const shareUrl = await page.getByLabel('Draft URL').inputValue()
  const draft = decodeInvoiceDraftFromUrl(
    new URL(shareUrl).searchParams.get(invoiceParamName),
    linkedDraft
  )

  expect(draft.invoiceNumber).toBe('INV-LINK-043')
})

test('compact layouts avoid overlap and horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 821, height: 1180 })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Invoice Generator' })).toBeVisible()

  const mediumLayout = await page.evaluate(() => {
    const details = document.querySelector('[aria-labelledby="invoice-details-title"]')
    const preview = document.querySelector('[aria-labelledby="preview-title"]')
    const detailsRect = details?.getBoundingClientRect()
    const previewRect = preview?.getBoundingClientRect()

    return {
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      previewBelowDetails: Boolean(detailsRect && previewRect && previewRect.top > detailsRect.bottom)
    }
  })

  expect(mediumLayout).toEqual({
    hasHorizontalOverflow: false,
    previewBelowDetails: true
  })

  await page.setViewportSize({ width: 800, height: 1180 })

  const narrowLayout = await page.evaluate(() => {
    const actions = document.querySelector('[class*="actions"]')
    const titleBlock = document.querySelector('[class*="titleBlock"]')
    const workspace = document.querySelector('[class*="workspace"]')
    const actionsRect = actions?.getBoundingClientRect()
    const titleRect = titleBlock?.getBoundingClientRect()
    const workspaceRect = workspace?.getBoundingClientRect()

    return {
      actionsInsideWorkspace: Boolean(
        actionsRect &&
        workspaceRect &&
        actionsRect.left >= workspaceRect.left &&
        actionsRect.right <= workspaceRect.right
      ),
      actionsBesideTitle: Boolean(
        actionsRect &&
        titleRect &&
        actionsRect.top < titleRect.bottom &&
        actionsRect.bottom > titleRect.top
      ),
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
    }
  })

  expect(narrowLayout).toEqual({
    actionsBesideTitle: true,
    actionsInsideWorkspace: true,
    hasHorizontalOverflow: false
  })
})

test('invoice preview stays visible on wide layouts only', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/')

  const lineItems = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Line Items' })
  })

  for (let count = 0; count < 10; count += 1) {
    await lineItems.getByRole('button', { name: 'Add Item' }).click()
  }

  const wideLayout = await page.evaluate(() => {
    window.scrollTo(0, 0)

    const previewPane = document.querySelector('[class*="previewPane"]')
    const before = previewPane?.getBoundingClientRect().top ?? 0

    window.scrollTo(0, 900)

    const after = previewPane?.getBoundingClientRect().top ?? 0

    return {
      topBeforeScroll: Math.round(before),
      topAfterScroll: Math.round(after),
      position: previewPane ? getComputedStyle(previewPane).position : ''
    }
  })

  expect(wideLayout.position).toBe('sticky')
  expect(wideLayout.topBeforeScroll).toBeGreaterThan(50)
  expect(wideLayout.topAfterScroll).toBe(16)

  await page.setViewportSize({ width: 900, height: 720 })

  const compactLayout = await page.evaluate(() => {
    const previewPane = document.querySelector('[class*="previewPane"]')

    return {
      position: previewPane ? getComputedStyle(previewPane).position : '',
      maxHeight: previewPane ? getComputedStyle(previewPane).maxHeight : ''
    }
  })

  expect(compactLayout).toEqual({
    position: 'static',
    maxHeight: 'none'
  })
})
