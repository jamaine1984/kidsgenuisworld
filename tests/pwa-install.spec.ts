import { expect, test } from '@playwright/test';
import { resetApp } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetApp(page);
});

test('installable web app assets and phone install guidance are available', async ({ page, request }) => {
  const manifestResponse = await request.get('/manifest.webmanifest');
  expect(manifestResponse.ok()).toBeTruthy();
  expect(manifestResponse.headers()['content-type']).toContain('application/manifest+json');

  const manifest = await manifestResponse.json();
  expect(manifest.name).toBe('Kid Genius World');
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBe('/?source=pwa');
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }),
      expect.objectContaining({ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }),
      expect.objectContaining({ src: '/icons/maskable-icon-512.png', purpose: 'maskable' }),
    ])
  );

  await expect((await request.get('/sw.js')).ok()).toBeTruthy();
  await expect((await request.get('/icons/apple-touch-icon.png')).ok()).toBeTruthy();
  await expect((await request.get('/icons/icon-512.png')).ok()).toBeTruthy();

  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icons/apple-touch-icon.png');
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');

  await page.getByRole('button', { name: 'Install App' }).click();
  await expect(page.getByText('iPhone or iPad: open Safari Share')).toBeVisible();
  await expect(page.getByText('Android: open Chrome menu')).toBeVisible();
});
