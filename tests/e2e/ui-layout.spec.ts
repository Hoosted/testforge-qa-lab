import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const publicPages = [
  {
    name: 'home',
    url: '/',
    heading: /pratique testes onde os estados importam/i,
  },
  {
    name: 'catalogo',
    url: '/labs',
    heading: /escolha um lab/i,
  },
  {
    name: 'login',
    url: '/entrar',
    heading: /entre com uma seed publica/i,
  },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 1200 },
  { name: 'tablet', width: 1024, height: 1366 },
  { name: 'mobile', width: 390, height: 844 },
];

for (const viewport of viewports) {
  for (const currentPage of publicPages) {
    test(`${currentPage.name} renders without horizontal overflow on ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(currentPage.url);

      await expect(page.getByRole('heading', { name: currentPage.heading })).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(() => {
        const root = document.documentElement;
        return root.scrollWidth - root.clientWidth > 1;
      });

      expect(hasHorizontalOverflow).toBeFalsy();
    });
  }
}

for (const viewport of viewports) {
  test(`advanced form stays accessible and aligned on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'testforge.session',
        JSON.stringify({
          token: 'seed-token-admin',
          role: 'ADMIN',
          name: 'TestForge Admin',
          email: 'admin@testforge.dev',
        }),
      );
    });

    await page.goto('/labs/formulario-avancado');

    await expect(page.getByRole('heading', { name: /o lab principal agora deixa o wizard/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /proxima etapa/i })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth > 1;
    });

    expect(hasHorizontalOverflow).toBeFalsy();
  });
}

test('login stays free of serious accessibility violations', async ({ page }) => {
  await page.goto('/entrar');

  const results = await new AxeBuilder({ page }).analyze();
  const seriousViolations = results.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );

  expect(seriousViolations).toEqual([]);
});

test('advanced form stays free of serious accessibility violations', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'testforge.session',
      JSON.stringify({
        token: 'seed-token-admin',
        role: 'ADMIN',
        name: 'TestForge Admin',
        email: 'admin@testforge.dev',
      }),
    );
  });

  await page.goto('/labs/formulario-avancado');

  const results = await new AxeBuilder({ page }).analyze();
  const seriousViolations = results.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );

  expect(seriousViolations).toEqual([]);
});
