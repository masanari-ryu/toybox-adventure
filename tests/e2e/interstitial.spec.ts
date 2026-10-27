import {expect,test} from '@playwright/test';

test('stage transition waits five seconds before continuing', async ({page}) => {
  await page.setViewportSize({width: 844, height: 390});
  await page.route(/\.(a8\.net|rakuten\.co\.jp)\//, route => route.abort());
  await page.goto('/');
  await page.waitForFunction(() => !!document.querySelector('#intro-link'));
  await page.evaluate(async () => {
    const {game} = await import('/src/main.ts');
    await game.visuals.ready;
    game.state = 'playing';
    game.arriveTrain();
  });
  await page.locator('#card-close').click();
  const dialog = page.getByRole('dialog', {name:'こうこく'});
  await expect(dialog).toBeVisible();
  expect(await page.evaluate(async () => (await import('/src/main.ts')).game.state)).toBe('card');
  await expect(dialog.locator('iframe')).toHaveAttribute('title','こうこく');
  await expect(dialog.getByRole('button')).toBeDisabled();
  await expect(dialog.getByRole('button')).toContainText('びょう');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCount(0, {timeout: 15000});
  expect(await page.evaluate(async () => (await import('/src/main.ts')).game.stageIndex)).toBe(1);
});

test('page navigation proceeds after the advertisement', async ({page}) => {
  await page.route(/\.(a8\.net|rakuten\.co\.jp)\//, route => route.abort());
  await page.goto('/');
  await page.locator('#intro-link').click();
  const dialog = page.getByRole('dialog',{name:'こうこく'});
  await expect(dialog.getByRole('button')).toBeDisabled();
  await expect(page).toHaveURL(/\/adventure\/index\.html$/, {timeout:15000});
});
