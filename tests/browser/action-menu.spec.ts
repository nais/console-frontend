import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/tests/browser/action-menu.html');
	await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
});

test('supports arrow navigation, disabled-item skipping, Home/End, typeahead and Escape', async ({
	page
}) => {
	const trigger = page.getByRole('button', { name: 'Test actions', exact: true });
	await trigger.focus();
	await page.keyboard.press('ArrowDown');
	await expect(page.getByRole('menuitem', { name: 'First action' })).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(page.getByRole('menuitem', { name: 'Last action' })).toBeFocused();
	await page.keyboard.press('End');
	await expect(page.getByRole('menuitemradio', { name: 'Risk', exact: true })).toBeFocused();
	await page.keyboard.press('Home');
	await expect(page.getByRole('menuitem', { name: 'First action' })).toBeFocused();
	await page.keyboard.type('ri');
	await expect(page.getByRole('menuitemradio', { name: 'Risk', exact: true })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('menu')).toBeHidden();
	await expect(trigger).toBeFocused();
	await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('ArrowUp opens at the last enabled item', async ({ page }) => {
	await page.getByRole('button', { name: 'Test actions', exact: true }).focus();
	await page.keyboard.press('ArrowUp');
	await expect(page.getByRole('menuitemradio', { name: 'Risk', exact: true })).toBeFocused();
});

test('activates native buttons with Enter and Space and updates controlled state', async ({
	page
}) => {
	const trigger = page.getByRole('button', { name: 'Test actions', exact: true });
	await trigger.focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('status', { name: 'Menu open' })).toHaveText('true');
	await expect(page.getByRole('menuitem', { name: 'First action' })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('status', { name: 'Selected action' })).toHaveText('first:BUTTON');
	await expect(page.getByRole('menu')).toBeHidden();
	await expect(trigger).toBeFocused();
	await page.keyboard.press('Space');
	await expect(page.getByRole('menuitem', { name: 'First action' })).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(page.getByRole('menuitem', { name: 'Last action' })).toBeFocused();
	await page.keyboard.press('Space');
	await expect(page.getByRole('status', { name: 'Selected action' })).toHaveText('last');
	await expect(page.getByRole('status', { name: 'Menu open' })).toHaveText('false');
});

test('Tab and Shift+Tab close the menu and move relative to its trigger', async ({ page }) => {
	const trigger = page.getByRole('button', { name: 'Test actions', exact: true });
	await trigger.focus();
	await page.keyboard.press('ArrowDown');
	await expect(page.getByRole('menuitem', { name: 'First action' })).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(page.getByRole('button', { name: 'After menu' })).toBeFocused();
	await expect(page.getByRole('menu')).toBeHidden();
	await trigger.focus();
	await page.keyboard.press('ArrowDown');
	await expect(page.getByRole('menuitem', { name: 'First action' })).toBeFocused();
	await page.keyboard.press('Shift+Tab');
	await expect(page.getByRole('button', { name: 'Toggle controlled menu' })).toBeFocused();
	await expect(page.getByRole('menu')).toBeHidden();
});

test('outside clicks close the menu without stealing focus', async ({ page }) => {
	await page.getByRole('button', { name: 'Test actions', exact: true }).click();
	const outside = page.getByRole('button', { name: 'After menu' });
	await outside.click();
	await expect(page.getByRole('menu')).toBeHidden();
	await expect(outside).toBeFocused();
	await expect(page.getByRole('status', { name: 'Selected action' })).toHaveText('outside');
});

test('preserves native anchor navigation', async ({ page }) => {
	await page.getByRole('button', { name: 'Test actions', exact: true }).click();
	const link = page.getByRole('menuitem', { name: 'Native link', exact: true });
	await expect(link).toHaveAttribute('href', '#destination');
	await link.focus();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/#destination$/);
	await expect(page.getByRole('menu')).toBeHidden();
});

test('disabled anchors cannot navigate or invoke callbacks', async ({ page }) => {
	await page.getByRole('button', { name: 'Test actions', exact: true }).click();
	const link = page.getByRole('menuitem', { name: 'Disabled link', exact: true });
	await expect(link).toHaveAttribute('aria-disabled', 'true');
	await expect(link).not.toHaveAttribute('href');
	await link.click({ force: true });
	await expect(page).not.toHaveURL(/#disabled$/);
	await expect(page.getByRole('status', { name: 'Selected action' })).toBeEmpty();
	await expect(page.getByRole('menu')).toBeVisible();
});

test('radio groups expose labels and retain selection after closing', async ({ page }) => {
	const trigger = page.getByRole('button', { name: 'Test actions', exact: true });
	await trigger.click();
	await expect(page.getByRole('group', { name: 'Order by' })).toBeVisible();
	await expect(page.getByRole('menuitemradio', { name: 'Name', exact: true })).toBeChecked();
	await page.getByRole('menuitemradio', { name: 'Risk', exact: true }).click();
	await expect(page.getByRole('status', { name: 'Selected order' })).toHaveText('risk');
	await expect(page.getByRole('status', { name: 'Radio callback' })).toHaveText('risk');
	await expect(page.getByRole('menu')).toBeHidden();
	await trigger.click();
	await expect(page.getByRole('menuitemradio', { name: 'Risk', exact: true })).toBeChecked();
	await expect(page.getByRole('menuitemradio', { name: 'Disabled order' })).toBeDisabled();
});

test('native link callbacks can prevent navigation and open a dialog without losing focus', async ({
	page
}) => {
	await page.getByRole('button', { name: 'Test actions', exact: true }).click();
	await page.getByRole('menuitem', { name: 'Open dialog', exact: true }).click();
	await expect(page.getByRole('status', { name: 'Link event' })).toHaveText('A:#dialog');
	await expect(page).not.toHaveURL(/#dialog$/);
	const dialog = page.getByRole('dialog', { name: 'Action dialog' });
	await expect(dialog).toBeVisible();
	await expect(page.getByRole('menu')).toBeHidden();
	await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
});

test('modified link activation preserves native new-tab behavior', async ({ page, context }) => {
	await page.getByRole('button', { name: 'Test actions', exact: true }).click();
	const [newPage] = await Promise.all([
		context.waitForEvent('page'),
		page.getByRole('menuitem', { name: 'Open dialog', exact: true }).click({
			modifiers: ['ControlOrMeta']
		})
	]);
	await expect(newPage).toHaveURL(/#dialog$/);
	await expect(page.getByRole('status', { name: 'Link event' })).toHaveText('A:#dialog');
	await expect(page.getByRole('dialog')).toBeHidden();
	await expect(page).not.toHaveURL(/#dialog$/);
	await newPage.close();
});

test('menus inside dialogs stay above the overlay and preserve dialog focus', async ({ page }) => {
	await page.getByRole('button', { name: 'Test actions', exact: true }).click();
	await page.getByRole('menuitem', { name: 'Open dialog', exact: true }).click();
	const dialog = page.getByRole('dialog', { name: 'Action dialog' });
	const trigger = dialog.getByRole('button', { name: 'Dialog actions' });
	await trigger.click();
	await expect(dialog.getByRole('menu')).toBeVisible();
	await dialog.getByRole('menuitem', { name: 'Nested action' }).click();
	await expect(page.getByRole('status', { name: 'Selected action' })).toHaveText('nested');
	await expect(dialog).toBeVisible();
	await expect(trigger).toBeFocused();
});

test('portals escape clipping and preserve scoped dark theme', async ({ page }) => {
	const trigger = page.getByRole('button', { name: 'Test actions', exact: true });
	await trigger.click();
	const menu = page.getByRole('menu');
	const light = await menu.evaluate((element) => getComputedStyle(element).backgroundColor);
	await expect(menu.getByRole('menuitemradio', { name: 'Risk', exact: true })).toBeInViewport();
	await page.getByRole('button', { name: 'Toggle theme' }).click();
	await trigger.click();
	const dark = await menu.evaluate((element) => getComputedStyle(element).backgroundColor);
	expect(dark).not.toBe(light);
});

test('constrains and scrolls the menu on narrow, short viewports', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 320 });
	await page.getByRole('button', { name: 'Test actions', exact: true }).click();
	const menu = page.getByRole('menu');
	await expect(menu).toBeVisible();
	const bounds = await menu.boundingBox();
	if (!bounds) throw new Error('Menu has no bounding box');
	expect(bounds.x).toBeGreaterThanOrEqual(0);
	expect(bounds.x + bounds.width).toBeLessThanOrEqual(375);
	expect(bounds.height).toBeLessThanOrEqual(320);
	await expect
		.poll(() => menu.evaluate((element) => element.scrollHeight > element.clientHeight))
		.toBe(true);
});

test('supports externally controlled open state', async ({ page }) => {
	await page.getByRole('button', { name: 'Toggle controlled menu' }).click();
	await expect(page.getByRole('menu')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Test actions', exact: true })).toHaveAttribute(
		'aria-expanded',
		'true'
	);
	await page.keyboard.press('Escape');
	await expect(page.getByRole('status', { name: 'Menu open' })).toHaveText('false');
});

test.describe('touch input', () => {
	test.use({ hasTouch: true, viewport: { width: 375, height: 812 } });

	test('opens and selects an action on mobile', async ({ page }) => {
		await page.getByRole('button', { name: 'Test actions', exact: true }).tap();
		await expect(page.getByRole('menu')).toBeVisible();
		await page.getByRole('menuitem', { name: 'First action' }).tap();
		await expect(page.getByRole('status', { name: 'Selected action' })).toHaveText('first:BUTTON');
		await expect(page.getByRole('menu')).toBeHidden();
	});
});
