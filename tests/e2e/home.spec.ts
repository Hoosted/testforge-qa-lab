import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('homepage exposes the TestForge landing and primary start action', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: /treine ui, api, auth e acessibilidade em um sandbox previsivel/i,
    }),
  ).toBeVisible();

  await expect(page.getByRole('link', { name: /^iniciar$/i }).first()).toBeVisible();
});

test('homepage start action takes the user to the lab catalog', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /^iniciar$/i }).first().click();

  await expect(page).toHaveURL(/\/labs$/);
  await expect(page.getByRole('heading', { name: /escolha um lab/i })).toBeVisible();
});

test('homepage stays free of serious accessibility violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page }).analyze();
  const seriousViolations = results.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );

  expect(seriousViolations).toEqual([]);
});
