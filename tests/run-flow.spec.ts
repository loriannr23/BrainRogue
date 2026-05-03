import { expect, Page, test } from '@playwright/test';

const saveKey = 'brainrogue.save.v1';

test.describe.configure({ mode: 'serial' });

declare global {
  interface Window {
    __BR_GAME__?: {
      scene: {
        getScenes(active?: boolean): Array<{ scene: { key: string } }>;
      };
    };
  }
}

const createSeedSave = () => ({
  version: 1,
  unlockedStarters: [
    'tungling',
    'patapim',
    'croclet',
    'trala_kid',
  ],
  bestWave: 0,
  runsPlayed: 1,
  metaUpgrades: {
    vitality: 2,
    power: 3,
    armor: 1,
    speed: 2,
  },
  lifetimeCurrency: 500,
  currentRun: {
    starterId: 'tungling',
    wave: 1,
    currency: 0,
    seed: 'playwright-smoke',
    party: [
      {
        instanceId: 'test-starter',
        definitionId: 'tung_tung_tung_sahur',
        name: 'Tung Tung Tung Sahur',
        level: 80,
        xp: 0,
        types: ['ancient', 'sound'],
        stats: {
          hp: 999,
          attack: 9999,
          defense: 999,
          specialAttack: 9999,
          specialDefense: 999,
          speed: 999,
        },
        currentHp: 999,
        moveIds: ['bonk', 'stone_thump', 'echo_slap', 'quick_yell'],
        moves: [
          { moveId: 'bonk', currentPp: 99, maxPp: 99 },
          { moveId: 'stone_thump', currentPp: 99, maxPp: 99 },
          { moveId: 'echo_slap', currentPp: 99, maxPp: 99 },
          { moveId: 'quick_yell', currentPp: 99, maxPp: 99 },
        ],
      },
    ],
  },
  discoveredCreatures: [],
  settings: {
    masterVolume: 1,
    musicVolume: 0.6,
    sfxVolume: 0.8,
    textSpeed: 'normal',
  },
  currency: 0,
});

const createWeakRunSave = () => ({
  ...createSeedSave(),
  bestWave: 4,
  currency: 0,
  currentRun: {
    starterId: 'tungling',
    wave: 20,
    currency: 25,
    seed: 'playwright-gameover',
    party: [
      {
        instanceId: 'weak-starter',
        definitionId: 'tungling',
        name: 'Tungling',
        level: 1,
        xp: 0,
        types: ['ancient', 'sound'],
        stats: {
          hp: 1,
          attack: 1,
          defense: 1,
          specialAttack: 1,
          specialDefense: 1,
          speed: 1,
        },
        currentHp: 1,
        moveIds: ['ancient_stare'],
        moves: [{ moveId: 'ancient_stare', currentPp: 10, maxPp: 10 }],
      },
    ],
  },
});

const installSeed = async (page: Page, save = createSeedSave()) => {
  await page.addInitScript(({ key, save }) => {
    window.localStorage.setItem(key, JSON.stringify(save));
  }, { key: saveKey, save });
};

const createDriver = (page: Page) => {
  const activeScene = async () => page.evaluate(() => {
    const game = window.__BR_GAME__;
    return game?.scene.getScenes(true).at(-1)?.scene.key;
  });
  const waitForScene = async (name: string, timeout = 10_000) => {
    await expect.poll(activeScene, { timeout }).toBe(name);
  };
  const moveCenters = async () => page.evaluate(() => {
    const scene = window.__BR_GAME__?.scene.getScenes(true).find((entry) => entry.scene.key === 'BattleScene') as unknown as {
      getDebugMoveButtonCenters?: () => Array<{ x: number; y: number }>;
    };
    return scene?.getDebugMoveButtonCenters?.() ?? [];
  });
  const battleSnapshot = async () => page.evaluate(() => {
    const scene = window.__BR_GAME__?.scene.getScenes(true).find((entry) => entry.scene.key === 'BattleScene') as unknown as {
      getDebugBattleSnapshot?: () => object;
    };
    return scene?.getDebugBattleSnapshot?.() ?? {};
  });
  const playBattleToReward = async () => {
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
      if (await activeScene() === 'RewardScene') return;
      await page.keyboard.press('Enter');
      await page.waitForTimeout(520);
    }
    throw new Error(`Battle did not reach reward: ${JSON.stringify(await battleSnapshot())}`);
  };
  return { activeScene, waitForScene, moveCenters, playBattleToReward };
};

test('main menu settings and battle placeholder actions are usable', async ({ page }) => {
  await installSeed(page);
  await page.goto('/?debugInput');
  await page.locator('canvas').waitFor();
  const { activeScene, waitForScene, moveCenters } = createDriver(page);

  await expect.poll(activeScene).toBe('MainMenuScene');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(100);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  await page.reload();
  await page.locator('canvas').waitFor();
  await expect.poll(activeScene).toBe('MainMenuScene');
  await page.keyboard.press('Enter');
  if (await activeScene() === 'StarterSelectScene') {
    await page.keyboard.press('Enter');
  }
  await waitForScene('BattleScene');

  await expect.poll(async () => (await moveCenters()).length, { timeout: 5_000 }).toBeGreaterThan(0);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(120);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(120);
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(120);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(120);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(120);
  await page.keyboard.press('Escape');
  await expect.poll(activeScene).toBe('BattleScene');
});

test('can play twenty waves with repeated battle and reward interactions', async ({ page }) => {
  await installSeed(page);
  await page.goto('/?debugInput');
  await page.locator('canvas').waitFor();
  const { activeScene, waitForScene, moveCenters, playBattleToReward } = createDriver(page);

  await expect.poll(activeScene).toBe('MainMenuScene');
  await page.keyboard.press('Enter');
  await waitForScene('BattleScene');

  for (let wave = 1; wave <= 20; wave += 1) {
    await waitForScene('BattleScene');
    await expect.poll(async () => (await moveCenters()).length, { timeout: 5_000 }).toBeGreaterThan(0);
    await playBattleToReward();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
  }

  const wave = await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw).currentRun?.wave : undefined;
  }, saveKey);

  expect(wave).toBeGreaterThanOrEqual(21);
});

test('game over preserves meta progress and allows a new run', async ({ page }) => {
  await installSeed(page, createWeakRunSave());
  await page.goto('/?debugInput');
  await page.locator('canvas').waitFor();
  const { activeScene, waitForScene, moveCenters } = createDriver(page);

  await expect.poll(activeScene).toBe('MainMenuScene');
  await page.keyboard.press('Enter');
  await waitForScene('BattleScene');
  await expect.poll(async () => (await moveCenters()).length, { timeout: 5_000 }).toBeGreaterThan(0);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (await activeScene() !== 'BattleScene') break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(180);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1050);
  }
  await expect.poll(async () => {
    const scene = await activeScene();
    return scene === 'GameOverScene' || scene === 'MainMenuScene';
  }, { timeout: 15_000 }).toBe(true);

  const afterGameOver = await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : undefined;
  }, saveKey);
  expect(afterGameOver.currentRun).toBeUndefined();
  expect(afterGameOver.bestWave).toBeGreaterThanOrEqual(20);
  expect(afterGameOver.currency).toBeGreaterThan(0);

  if (await activeScene() === 'GameOverScene') {
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await waitForScene('MainMenuScene');
  }
  await page.keyboard.press('Enter');
  await waitForScene('StarterSelectScene');
  await page.keyboard.press('Enter');
  await waitForScene('BattleScene');
});
