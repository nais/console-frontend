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
}
