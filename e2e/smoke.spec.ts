import { test, expect } from '@playwright/test'

test.describe('AnKor smoke', () => {
  test('главная открывается', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/Добро пожаловать в AnKor/i)).toBeVisible()
  })
})
