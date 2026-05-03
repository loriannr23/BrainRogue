import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    __BR_GAME__?: {
      scene: {
        getScenes(active?: boolean): Array<{ scene: { key: string } }>;
      };
    };
  }
}

test('production preview boots without runtime errors', async ({ page }) => {
  test.skip(process.env.PREVIEW_SMOKE !== '1', 'Set PREVIEW_SMOKE=1 and run npm run preview first.');

  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  await page.goto('http://localhost:4173');
  await page.locator('canvas').waitFor();
  await expect.poll(async () => page.evaluate(() => {
    const game = window.__BR_GAME__;
    return game?.scene.getScenes(true).at(-1)?.scene.key;
  }), { timeout: 10_000 }).toBe('MainMenuScene');

  expect(errors).toEqual([]);
});
