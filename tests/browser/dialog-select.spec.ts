import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/tests/browser/dialog-select.html');
	await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
});

test('modal exposes its title, description and explicit ID, traps focus and restores its opener', async ({
	page
}) => {
	const trigger = page.getByRole('button', { name: 'Open modal', exact: true });
	await trigger.click();
	const dialog = page.getByRole('dialog', { name: 'Test dialog', exact: true });
	await expect(dialog).toHaveAttribute('id', 'explicit-modal');
	await expect(dialog).toHaveAttribute('aria-modal', 'true');
	await expect(dialog).toHaveAccessibleDescription('Test dialog description');
	const close = dialog.getByRole('button', { name: 'Close', exact: true });
	await expect(close).toBeFocused();
	await page.keyboard.press('Shift+Tab');
	await expect(dialog.getByRole('button', { name: 'Save and close' })).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(close).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
	await expect(trigger).toBeFocused();
	await expect
		.poll(() => page.locator('body').evaluate((element) => getComputedStyle(element).overflow))
		.not.toBe('hidden');
	await expect(page.getByRole('status', { name: 'Modal open' })).toHaveText('false');
	await expect(page.getByRole('status', { name: 'Close events' })).toHaveText('1');
	await expect(page.getByRole('status', { name: 'Close event type' })).toHaveText('close');
	await expect(page.getByRole('status', { name: 'Cancel event type' })).toHaveText('cancel');
});

test('close button and external state changes each notify once, retaining draft content', async ({
	page
}) => {
	const trigger = page.getByRole('button', { name: 'Open modal', exact: true });
	await trigger.click();
	const dialog = page.getByRole('dialog', { name: 'Test dialog', exact: true });
	await dialog.getByRole('textbox', { name: 'Draft' }).fill('Unsubmitted draft');
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(page.getByRole('status', { name: 'Close events' })).toHaveText('1');
	await trigger.click();
	await expect(dialog.getByRole('textbox', { name: 'Draft' })).toHaveValue('Unsubmitted draft');
	await dialog.getByRole('button', { name: 'Save and close' }).click();
	await expect(dialog).toBeHidden();
	await expect(page.getByRole('status', { name: 'Close events' })).toHaveText('2');
	await expect(trigger).toBeFocused();
});

test('backdrop covers application chrome but clicks in the content padding do not close', async ({
	page
}) => {
	await page.getByRole('button', { name: 'Open modal', exact: true }).click();
	const dialog = page.getByRole('dialog', { name: 'Test dialog', exact: true });
	await dialog.locator('.sh-modal__body').click({ position: { x: 2, y: 2 } });
	await expect(dialog).toBeVisible();
	await page.mouse.click(2, 2);
	await expect(dialog).toBeHidden();
	await expect(page.getByRole('status', { name: 'Close events' })).toHaveText('1');
});

test('onBeforeClose guards Escape, the close button and backdrop without blocking programmatic close', async ({
	page
}) => {
	await page.getByRole('button', { name: 'Open modal', exact: true }).click();
	const dialog = page.getByRole('dialog', { name: 'Test dialog', exact: true });
	await dialog.getByRole('checkbox', { name: 'Block dismissal' }).check();
	await page.keyboard.press('Escape');
	await expect(dialog).toBeVisible();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(dialog).toBeVisible();
	await page.mouse.click(2, 2);
	await expect(dialog).toBeVisible();
	await expect(page.getByRole('status', { name: 'Close events' })).toHaveText('0');
	await dialog.getByRole('button', { name: 'Save and close' }).click();
	await expect(dialog).toBeHidden();
	await expect(page.getByRole('status', { name: 'Close events' })).toHaveText('1');
});

test('backdrop dismissal and cancel-event prevention can be controlled independently', async ({
	page
}) => {
	await page.getByRole('button', { name: 'Open modal', exact: true }).click();
	const dialog = page.getByRole('dialog', { name: 'Test dialog', exact: true });
	await dialog.getByRole('checkbox', { name: 'Close on backdrop' }).uncheck();
	await page.mouse.click(2, 2);
	await expect(dialog).toBeVisible();
	await dialog.getByRole('checkbox', { name: 'Prevent cancel event' }).check();
	await page.keyboard.press('Escape');
	await expect(dialog).toBeVisible();
	await dialog.getByRole('checkbox', { name: 'Prevent cancel event' }).uncheck();
	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
});

test('nested dialogs dismiss only the topmost dialog and return focus to their own opener', async ({
	page
}) => {
	await page.getByRole('button', { name: 'Open modal', exact: true }).click();
	const parent = page.getByRole('dialog', { name: 'Test dialog', exact: true });
	const trigger = parent.getByRole('button', { name: 'Open nested dialog' });
	await trigger.click();
	const nested = page.getByRole('dialog', { name: 'Nested dialog', exact: true });
	await expect(nested.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(nested).toBeHidden();
	await expect(parent).toBeVisible();
	await expect(trigger).toBeFocused();
	await expect(page.getByRole('status', { name: 'Close events' })).toHaveText('0');
	await trigger.click();
	await page.mouse.click(2, 2);
	await expect(nested).toBeHidden();
	await expect(parent).toBeVisible();
});

test('conditionally mounted dialogs restore focus when removed', async ({ page }) => {
	const trigger = page.getByRole('button', { name: 'Open conditional modal' });
	await trigger.click();
	const dialog = page.getByRole('dialog', { name: 'Conditional dialog' });
	await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
	await expect(trigger).toBeFocused();
	await expect
		.poll(() => page.locator('body').evaluate((element) => getComputedStyle(element).overflow))
		.not.toBe('hidden');
});

for (const kind of ['string', 'snippet']) {
	test(`${kind} headers give the dialog an accessible name`, async ({ page }) => {
		await page.getByRole('button', { name: `Use ${kind} header` }).click();
		await page.getByRole('button', { name: 'Open modal', exact: true }).click();
		const title = kind === 'string' ? 'String dialog' : 'Snippet dialog';
		await expect(page.getByRole('dialog', { name: title })).toBeVisible();
		await expect(page.getByRole('heading', { name: title })).toHaveCount(1);
	});
}

test('an explicit aria-labelledby takes precedence over the generated title relationship', async ({
	page
}) => {
	await page.getByRole('button', { name: 'Use explicit label' }).click();
	await page.getByRole('button', { name: 'Open modal', exact: true }).click();
	await expect(page.getByRole('dialog', { name: 'External dialog label' })).toBeVisible();
});

test('non-modal dialogs do not lock scrolling, trap focus or block outside interaction', async ({
	page
}) => {
	await page.getByRole('button', { name: 'Open non-modal' }).click();
	const dialog = page.getByRole('dialog', { name: 'Non-modal dialog' });
	await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
	await expect(dialog).not.toHaveAttribute('aria-modal');
	await page.getByRole('button', { name: 'Toggle theme' }).click();
	await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeFocused();
	await expect(dialog).toBeVisible();
	await expect
		.poll(() => page.locator('body').evaluate((element) => getComputedStyle(element).overflow))
		.not.toBe('hidden');
});

test('modal portals preserve scoped themes and release the scroll lock on close', async ({
	page
}) => {
	const trigger = page.getByRole('button', { name: 'Open modal', exact: true });
	await trigger.click();
	const dialog = page.getByRole('dialog', { name: 'Test dialog', exact: true });
	const light = await dialog.evaluate((element) => getComputedStyle(element).backgroundColor);
	await expect
		.poll(() => page.locator('body').evaluate((element) => getComputedStyle(element).overflow))
		.toBe('hidden');
	await page.keyboard.press('Escape');
	await expect
		.poll(() => page.locator('body').evaluate((element) => getComputedStyle(element).overflow))
		.not.toBe('hidden');
	await page.getByRole('button', { name: 'Toggle theme' }).click();
	await trigger.click();
	expect(await dialog.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(
		light
	);
});

test('mobile dialogs stay in the viewport with custom widths and scroll long content', async ({
	page
}) => {
	await page.setViewportSize({ width: 375, height: 500 });
	await page.getByRole('button', { name: 'Use long content' }).click();
	await page.getByRole('button', { name: 'Use top placement' }).click();
	await page.getByRole('button', { name: 'Open modal', exact: true }).click();
	const dialog = page.getByRole('dialog', { name: 'Test dialog', exact: true });
	const bounds = await dialog.boundingBox();
	if (!bounds) throw new Error('Dialog has no bounding box');
	expect(bounds.x).toBeGreaterThanOrEqual(0);
	expect(bounds.y).toBeGreaterThan(0);
	expect(bounds.x + bounds.width).toBeLessThanOrEqual(375);
	expect(bounds.y + bounds.height).toBeLessThanOrEqual(500);
	await expect
		.poll(() => dialog.evaluate((element) => element.scrollHeight > element.clientHeight))
		.toBe(true);
});

test('mobile filter drawer stays right-aligned, retains selections and restores focus', async ({
	page
}) => {
	await page.setViewportSize({ width: 375, height: 812 });
	const trigger = page.getByRole('button', { name: 'Open filters' });
	await trigger.click();
	const drawer = page.getByRole('dialog', { name: 'Filters' });
	await expect(drawer.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
	await expect
		.poll(async () => {
			const bounds = await drawer.boundingBox();
			return bounds ? bounds.x + bounds.width : 0;
		})
		.toBeCloseTo(375, 0);
	const bounds = await drawer.boundingBox();
	if (!bounds) throw new Error('Drawer has no bounding box');
	expect(bounds.x).toBeGreaterThanOrEqual(0);
	expect(bounds.x + bounds.width).toBeCloseTo(375, 0);
	expect(bounds.height).toBeCloseTo(812, 0);
	await expect(drawer.getByText('Sidebar extras')).toHaveCount(0);
	await drawer.getByRole('combobox', { name: 'Filter environment' }).selectOption('prod');
	await page.keyboard.press('Escape');
	await expect(drawer).toBeHidden();
	await expect(trigger).toBeFocused();
	await expect(page.getByRole('status', { name: 'Selected filter' })).toHaveText('prod');
	await trigger.click();
	await expect(drawer.getByRole('combobox', { name: 'Filter environment' })).toHaveValue('prod');
});

test('drawer closes at the desktop breakpoint and releases its scroll lock', async ({ page }) => {
	await page.setViewportSize({ width: 900, height: 800 });
	await page.getByRole('button', { name: 'Open filters' }).click();
	await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
	await page.setViewportSize({ width: 1280, height: 800 });
	await expect(page.getByRole('dialog', { name: 'Filters' })).toBeHidden();
	await expect(page.getByRole('status', { name: 'Drawer open' })).toHaveText('false');
	await expect
		.poll(() => page.locator('body').evaluate((element) => getComputedStyle(element).overflow))
		.not.toBe('hidden');
});

test('native Select preserves labels, explicit IDs, descriptions and validation', async ({
	page
}) => {
	const select = page.getByRole('combobox', { name: 'Test selection', exact: true });
	await expect(select).toHaveAttribute('id', 'explicit-selection');
	await expect(select).toHaveAttribute('aria-invalid', 'true');
	await expect(select).toHaveAccessibleDescription(
		'External selection description Select description Select error'
	);
	await page.getByRole('button', { name: 'Clear select error' }).click();
	await expect(select).not.toHaveAttribute('aria-invalid');
	await expect(select).toHaveAccessibleDescription(
		'External selection description Select description'
	);
	await page.getByRole('button', { name: 'Change selection ID' }).click();
	await expect(select).toHaveAttribute('id', 'updated-selection');
	await expect(select).toHaveAccessibleDescription(
		'External selection description Select description'
	);
});

test('native Select supports keyboard typeahead, native callbacks and external updates', async ({
	page
}) => {
	const select = page.getByRole('combobox', { name: 'Test selection', exact: true });
	await select.focus();
	await page.keyboard.type('tw');
	await page.keyboard.press('Tab');
	await expect(select).toHaveValue('two');
	await expect(page.getByRole('status', { name: 'Selection', exact: true })).toHaveText('two');
	await expect(page.getByRole('status', { name: 'Change event' })).toHaveText('SELECT:two');
	await select.selectOption('one');
	await page.getByRole('button', { name: 'Set selection externally' }).click();
	await expect(select).toHaveValue('two');
	await expect(select.getByRole('option', { name: 'Disabled option' })).toBeDisabled();
	await page.getByRole('button', { name: 'Add option' }).click();
	await select.selectOption('three');
	await expect(page.getByRole('status', { name: 'Selection', exact: true })).toHaveText('three');
});

test('native Select preserves numeric, object and multiple value bindings', async ({ page }) => {
	await page.getByRole('combobox', { name: 'Number selection' }).selectOption('2');
	await expect(page.getByRole('status', { name: 'Number value' })).toHaveText('number:2');
	await page
		.getByRole('combobox', { name: 'Object selection' })
		.selectOption({ label: 'Second object' });
	await expect(page.getByRole('status', { name: 'Object value' })).toHaveText('Second object');
	await page.getByRole('listbox', { name: 'Multiple selection' }).selectOption(['one', 'two']);
	await expect(page.getByRole('status', { name: 'Multiple values' })).toHaveText('one,two');
});

test('native Select submits named values, omits disabled fields and supports form reset', async ({
	page
}) => {
	const select = page.getByRole('combobox', { name: 'Test selection', exact: true });
	await select.selectOption('two');
	await page.getByRole('combobox', { name: 'Number selection' }).selectOption('2');
	await page.getByRole('button', { name: 'Submit selections' }).click();
	await expect(page.getByRole('status', { name: 'Form result' })).toHaveText(
		JSON.stringify([
			['selection', 'two'],
			['number', '2'],
			['multiple', 'one']
		])
	);
	await expect(page.getByRole('combobox', { name: 'Disabled selection' })).toBeDisabled();
	await expect(page.getByRole('combobox', { name: 'Read-only selection' })).toBeDisabled();
	await expect(page.getByRole('combobox', { name: 'Hidden selection label' })).toBeVisible();
	await page.getByRole('button', { name: 'Reset selections' }).click();
	await expect(select).toHaveValue('one');
	await expect(page.getByRole('status', { name: 'Selection', exact: true })).toHaveText('one');
});

test.describe('touch input', () => {
	test.use({ hasTouch: true, viewport: { width: 375, height: 812 } });

	test('mobile drawer supports touch dismissal and native select controls', async ({ page }) => {
		await page.getByRole('button', { name: 'Open filters' }).tap();
		const drawer = page.getByRole('dialog', { name: 'Filters' });
		await expect(drawer).toBeVisible();
		await drawer.getByRole('combobox', { name: 'Filter environment' }).selectOption('prod');
		await page.touchscreen.tap(2, 2);
		await expect(drawer).toBeHidden();
		await expect(page.getByRole('status', { name: 'Selected filter' })).toHaveText('prod');
	});
});
