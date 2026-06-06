import { expect, test } from '@playwright/test'

test('invoice generator renders and updates the preview', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Invoice Generator' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'INV-001' })).toBeVisible()

  const firstItem = page.locator('article').filter({ hasText: 'Item 1' })
  await firstItem.getByLabel('Description').fill('Design system audit\nInvoice preview polish')
  await firstItem.getByLabel('Rate').fill('120')
  await firstItem.getByLabel('Qty').fill('2')
  await firstItem.getByLabel('Tax').selectOption('tax-gst')

  const preview = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'INV-001' })
  })

  await expect(preview.getByText('Design system audit')).toBeVisible()
  await expect(preview.getByText('Invoice preview polish')).toBeVisible()
  await expect(preview.getByText('AUD 264.00').first()).toBeVisible()
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
