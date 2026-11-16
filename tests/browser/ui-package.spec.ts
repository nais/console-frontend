import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/tests/browser/ui-package.html');
	await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
});

test('standalone buttons retain callbacks, refs, aliases, loading, disabled and form behavior', async ({
	page
}) => {
	const button = page.getByRole('button', { name: 'Count clicks' });
	await expect(button).toHaveClass(/variant-outline/);
	await button.focus();
	await page.keyboard.press('Enter');
	await page.keyboard.press('Space');
	await expect(page.getByRole('status', { name: 'Clicks', exact: true })).toHaveText('2');
	await expect(page.getByRole('status', { name: 'Button ref' })).toHaveText('BUTTON');
	await expect(page.getByRole('button', { name: 'Disabled button' })).toBeDisabled();
	await expect(page.getByRole('button', { name: 'Loading button' })).toBeDisabled();
	await expect(page.getByRole('status', { name: 'Loading...' })).toHaveCSS('width', '16px');
	await expect(page.getByRole('link', { name: 'Link button', exact: true })).toHaveAttribute(
		'href',
		'#destination'
	);
	await expect(page.getByText('Disabled link', { exact: true }).locator('..')).not.toHaveAttribute(
		'href'
	);
	await page.getByRole('button', { name: 'Submit button' }).click();
	await expect(page.getByRole('status', { name: 'Submissions' })).toHaveText('1');
});

for (const { content, initial } of [
	{ content: 'Bound tooltip', initial: 'false' },
	{ content: 'Initially undefined tooltip', initial: 'undefined' }
]) {
	test(`${initial}-initialized tooltip binding follows hover, focus, Escape and external changes`, async ({
		page
	}) => {
		const trigger = page.getByRole('button', { name: `${content} target`, exact: true });
		const tooltip = page.getByRole('tooltip', { name: content, exact: true });
		const state = page.getByRole('status', { name: `${content} open` });
		await expect(state).toHaveText(initial);
		await trigger.hover();
		await expect(tooltip).toBeVisible();
		await expect(state).toHaveText('true');
		await page.mouse.move(0, 0);
		await expect(tooltip).toBeHidden();
		await expect(state).toHaveText('false');

		await trigger.focus();
		await expect(tooltip).toBeVisible();
		await expect(state).toHaveText('true');
		await trigger.hover();
		await page.mouse.move(0, 0);
		await expect(tooltip).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(tooltip).toBeHidden();
		await expect(state).toHaveText('false');

		const toggle = page.getByRole('button', { name: `Toggle ${content}` });
		await toggle.click();
		await expect(tooltip).toBeVisible();
		await expect(state).toHaveText('true');
		await toggle.click();
		await expect(tooltip).toBeHidden();
		await expect(state).toHaveText('false');
	});
}

test('standalone native fields retain typed bindings, labels, validation and disabled states', async ({
	page
}) => {
	const delay = page.getByRole('spinbutton', { name: 'Upgrade delay' });
	await expect(delay).toHaveAttribute('id', 'package-delay');
	await expect(delay).toHaveAttribute('aria-invalid', 'true');
	await expect(delay).toHaveAccessibleDescription(
		'External delay help Days before upgrade Choose a valid delay'
	);
	await delay.fill('7');
	await expect(page.getByRole('status', { name: 'Delay value' })).toHaveText('number:7');
	await delay.fill('');
	await expect(page.getByRole('status', { name: 'Delay value' })).toHaveText('null:empty');
	await page.getByLabel('Start time', { exact: true }).fill('13:30');
	await expect(page.getByRole('status', { name: 'Start time value' })).toHaveText('13:30');
	await page
		.getByRole('combobox', { name: 'Target version' })
		.selectOption({ label: 'Version two' });
	await expect(page.getByRole('status', { name: 'Version value' })).toHaveText('number:2');
	await expect(page.getByRole('option', { name: 'Unavailable version' })).toBeDisabled();
	await expect(page.getByRole('textbox', { name: 'Disabled field' })).toBeDisabled();
	await expect(page.getByLabel('Visually hidden label', { exact: true })).toBeVisible();
	const hiddenLabel = page.locator('label').filter({ hasText: 'Visually hidden label' });
	await expect(hiddenLabel).toHaveCSS('position', 'absolute');
	await expect(hiddenLabel).toHaveCSS('width', '1px');
});

test('standalone tables share sort context and provide compact, striped and sticky styling', async ({
	page
}) => {
	const table = page.getByRole('table');
	const name = table.getByRole('columnheader', { name: 'Environment' });
	await expect(name).toHaveAttribute('scope', 'col');
	await expect(name).toHaveAttribute('aria-sort', 'ascending');
	await name.getByRole('button').click();
	await expect(name).toHaveAttribute('aria-sort', 'descending');
	await expect(table.locator('thead')).toHaveCSS('position', 'sticky');
	await expect(table.getByRole('cell', { name: 'Development' })).toHaveCSS('padding-top', '8px');
	await expect(table.locator('tbody tr').nth(1)).toHaveCSS(
		'background-color',
		'rgb(241, 245, 249)'
	);
	await expect(table.getByRole('cell', { name: 'No other upgrades' })).toHaveAttribute(
		'colspan',
		'2'
	);
	const stripedRow = table.locator('tbody tr').nth(1);
	await stripedRow.hover();
	await expect(stripedRow).not.toHaveCSS('background-color', 'rgb(241, 245, 249)');
	await page.getByRole('button', { name: 'Toggle row hover' }).click();
	await stripedRow.hover();
	await expect(stripedRow).toHaveCSS('background-color', 'rgb(241, 245, 249)');
});

test('standalone disclosures, feedback and loading indicators work without Console styles', async ({
	page
}) => {
	await expect(page.getByRole('heading', { name: 'Upgrade history' })).toHaveJSProperty(
		'tagName',
		'H2'
	);
	await expect(page.getByRole('alert')).toHaveText('Upgrade failed');
	await expect(page.getByText('Done', { exact: true })).toHaveCSS('color', 'rgb(22, 101, 52)');
	const initial = page.getByRole('button', { name: 'Initially expanded' });
	await expect(initial).toHaveAttribute('aria-expanded', 'true');
	await expect(page.getByText('Initial operation details', { exact: true })).toBeVisible();
	await initial.click();
	await expect(page.getByText('Initial operation details', { exact: true })).toBeHidden();
	const details = page.getByRole('button', { name: 'Operation details', exact: true });
	await details.focus();
	await page.keyboard.press('Enter');
	await expect(details).toHaveAttribute('aria-expanded', 'true');
	await expect(page.getByRole('status', { name: 'Details open' })).toHaveText('true');
	await page.keyboard.press('Space');
	await expect(page.getByRole('status', { name: 'Details open' })).toHaveText('false');
	await expect(page.getByText('Bound operation details')).toBeHidden();
	const skeleton = page.getByTestId('package-skeleton');
	await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
	await expect(skeleton).toHaveCSS('height', '20px');
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await expect(skeleton).toHaveCSS('animation-name', 'none');
});

for (const viewport of [
	{ width: 375, height: 812 },
	{ width: 1280, height: 900 }
]) {
	test(`standalone themes and portaled modal work without Console CSS at ${viewport.width}px`, async ({
		page
	}) => {
		await page.setViewportSize(viewport);
		await expect(page.getByTestId('outer-dark')).toHaveCSS('background-color', 'rgb(9, 13, 22)');
		await expect(page.getByTestId('inner-light')).toHaveCSS(
			'background-color',
			'rgb(248, 250, 252)'
		);
		await expect(page.getByTestId('inner-dark')).toHaveCSS('background-color', 'rgb(9, 13, 22)');
		await expect(page.getByTestId('inner-light')).toHaveCSS('color-scheme', 'light');
		await expect(page.getByTestId('inner-dark')).toHaveCSS('color-scheme', 'dark');
		await expect(page.getByRole('button', { name: 'Dark button', exact: true })).toHaveCSS(
			'background-color',
			'rgb(248, 250, 252)'
		);
		await expect(page.getByRole('button', { name: 'Nested dark button' })).toHaveCSS(
			'background-color',
			'rgb(248, 250, 252)'
		);
		const trigger = page.getByRole('button', { name: 'Open package dialog' });
		await trigger.focus();
		await page.keyboard.press('Enter');
		const dialog = page.getByRole('dialog', { name: 'Package dialog' });
		await expect(dialog).toHaveCSS('background-color', 'rgb(255, 255, 255)');
		expect(
			await dialog.evaluate((element) =>
				element.closest('.sh-theme-root')?.getAttribute('data-testid')
			)
		).toBe('inner-light');
		const close = dialog.getByRole('button', { name: 'Close', exact: true });
		await expect(close).toBeFocused();
		const iconSize = await close.locator('svg').evaluate((element) => {
			const style = getComputedStyle(element);
			return {
				width: Number.parseFloat(style.width),
				height: Number.parseFloat(style.height),
				fontSize: Number.parseFloat(style.fontSize)
			};
		});
		expect(iconSize.width / iconSize.fontSize).toBeCloseTo(1, 2);
		expect(iconSize.height / iconSize.fontSize).toBeCloseTo(1, 2);
		await page.keyboard.press('Shift+Tab');
		await expect(dialog.getByRole('button', { name: 'Finish' })).toBeFocused();
		await page.keyboard.press('Tab');
		await expect(close).toBeFocused();
		const bounds = await dialog.boundingBox();
		if (!bounds) throw new Error('Dialog has no bounding box');
		expect(bounds.x).toBeGreaterThanOrEqual(0);
		expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
		await dialog.getByRole('textbox', { name: 'Package draft' }).fill('Preserved draft');
		await page.keyboard.press('Escape');
		await expect(dialog).toBeHidden();
		await expect(trigger).toBeFocused();
		await trigger.click();
		await expect(dialog.getByRole('textbox', { name: 'Package draft' })).toHaveValue(
			'Preserved draft'
		);
		await page.mouse.click(2, 2);
		await expect(dialog).toBeHidden();
		await expect(trigger).toBeFocused();
	});

	test(`standalone help and tooltips preserve dialog focus, theme and bounds at ${viewport.width}px`, async ({
		page
	}) => {
		await page.setViewportSize(viewport);
		const darkTrigger = page.getByRole('button', { name: 'Dark help', exact: true });
		await darkTrigger.click();
		const darkHelp = page.getByRole('dialog', { name: 'Dark help', exact: true });
		await expect(darkHelp).toHaveCSS('background-color', 'rgb(15, 23, 42)');
		expect(
			await darkHelp.evaluate((element) =>
				element.closest('.sh-theme-root')?.getAttribute('data-testid')
			)
		).toBe('inner-dark');
		await page.keyboard.press('Escape');
		await expect(darkHelp).toBeHidden();
		await expect(darkTrigger).toBeFocused();

		await page.getByRole('button', { name: 'Open package dialog' }).click();
		const dialog = page.getByRole('dialog', { name: 'Package dialog', exact: true });
		const trigger = dialog.getByRole('button', { name: 'Maintenance help', exact: true });
		await trigger.focus();
		await page.keyboard.press('Enter');
		const help = page.getByRole('dialog', { name: 'Maintenance help', exact: true });
		await expect(help).toHaveText('Maintenance times are UTC.');
		expect(
			await help.evaluate((element) =>
				element.closest('[data-dialog-content]')?.getAttribute('role')
			)
		).toBe('dialog');
		const bounds = await help.boundingBox();
		if (!bounds) throw new Error('Help popover has no bounding box');
		expect(bounds.x).toBeGreaterThanOrEqual(0);
		expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
		await page.keyboard.press('Escape');
		await expect(help).toBeHidden();
		await expect(dialog).toBeVisible();
		await expect(trigger).toBeFocused();
		await trigger.click();
		await dialog.getByRole('heading', { name: 'Package dialog', exact: true }).click();
		await expect(help).toBeHidden();
		await expect(dialog).toBeVisible();

		const tooltipTrigger = dialog.getByRole('button', { name: 'Local maintenance time' });
		await tooltipTrigger.focus();
		const tooltip = page.getByRole('tooltip', { name: 'Local maintenance time' });
		await expect(tooltip).toBeVisible();
		await expect(tooltipTrigger).toHaveAttribute(
			'aria-describedby',
			(await tooltip.getAttribute('id')) ?? ''
		);
		await page.keyboard.press('Escape');
		await expect(tooltip).toBeHidden();
		await expect(dialog).toBeVisible();
	});
}
