import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('homepage exposes the reboot messaging', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: /pratique testes onde os estados importam/i,
    }),
  ).toBeVisible();

  await expect(page.getByRole('link', { name: /explorar labs/i })).toBeVisible();
});

test('homepage stays free of serious accessibility violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page }).analyze();
  const seriousViolations = results.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );

  expect(seriousViolations).toEqual([]);
});
