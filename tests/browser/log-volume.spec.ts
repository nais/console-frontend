import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/tests/browser/log-volume.html');
	await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
});

test('renders proportional bars, real time widths, axes and a tooltip', async ({ page }) => {
	const chart = page.getByRole('region', { name: 'Log volume' });
	const bars = chart.locator('.log-volume-bar');
	await expect(bars).toHaveCount(4);
	const geometry = await bars.evaluateAll((elements) =>
		elements.map((element) => {
			const bounds = element.getBoundingClientRect();
			return { width: bounds.width, height: bounds.height };
		})
	);
	expect(geometry[0].height).toBe(0);
	expect(geometry[1].height / geometry[2].height).toBeCloseTo(0.25, 2);
	expect(geometry[3].width / geometry[2].width).toBeCloseTo(0.5, 2);
	await expect(chart.locator('.lc-axis')).toHaveCount(2);
	const firstTick = await chart.locator('.lc-axis').nth(1).locator('text').first().boundingBox();
	const firstInterval = await chart
		.getByRole('button', { name: /0 log lines/ })
		.first()
		.boundingBox();
	expect(firstTick).not.toBeNull();
	expect(firstInterval).not.toBeNull();
	expect(firstTick!.x + firstTick!.width / 2).toBeCloseTo(firstInterval!.x, 0);
	await chart.getByRole('button', { name: /25 log lines/ }).hover();
	const tooltip = page.getByRole('tooltip', { name: /25 log lines/ });
	await expect(tooltip).toBeVisible();
	await expect(tooltip).toContainText('Log lines');
	await expect(tooltip).toContainText('25');
});

test('dismisses hover and focus tooltips with Escape and reopens on a new interaction', async ({
	page
}) => {
	const button = page.getByRole('button', { name: /25 log lines/ });
	const tooltip = page.getByRole('tooltip', { name: /25 log lines/ });
	await button.hover();
	await expect(tooltip).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(tooltip).toHaveCount(0);
	const bounds = await button.boundingBox();
	expect(bounds).not.toBeNull();
	await page.mouse.move(bounds!.x + bounds!.width / 2 + 1, bounds!.y + bounds!.height / 2);
	await expect(tooltip).toHaveCount(0);
	await page.mouse.move(0, 0);
	await button.hover();
	await expect(tooltip).toBeVisible();
	await page.mouse.move(0, 0);
	await expect(tooltip).toHaveCount(0);
	await button.focus();
	await expect(tooltip).toBeVisible();
	await expect(button).toHaveAccessibleDescription(/25 log lines/);
	await page.keyboard.press('Escape');
	await expect(tooltip).toHaveCount(0);
	await expect(button).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(page.getByRole('tooltip', { name: /100 log lines/ })).toBeVisible();
});

test('selects intervals by mouse and keyboard, including intervals with no logs', async ({
	page
}) => {
	const buttons = page.getByRole('button', { name: /^Search / });
	await expect(buttons).toHaveCount(4);
	await buttons.nth(1).click();
	await expect(page.getByRole('status', { name: 'Selected interval' })).toHaveText(
		'1794225601000/1794225602000/25'
	);
	await buttons.nth(2).focus();
	await expect(buttons.nth(2)).toBeFocused();
	await expect(page.getByRole('tooltip', { name: /100 log lines/ })).toBeVisible();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('status', { name: 'Selected interval' })).toHaveText(
		'1794225602000/1794225603000/100'
	);
	await buttons.nth(0).focus();
	await page.keyboard.press('Space');
	await expect(page.getByRole('status', { name: 'Selected interval' })).toHaveText(
		'1794225600000/1794225601000/0'
	);
});

test('keeps the chart behind one empty-state overlay and disables interval selection', async ({
	page
}) => {
	await page.getByRole('button', { name: 'Toggle empty', exact: true }).click();
	await expect(
		page.getByText('No logs match this query and time range.', { exact: true })
	).toBeVisible();
	await expect(page.getByText('Try a wider time range or adjust the filters.')).toBeVisible();
	await expect(page.locator('.lc-axis')).toHaveCount(2);
	for (const interval of await page.getByRole('button', { name: /^Search / }).all()) {
		await expect(interval).toHaveAttribute('tabindex', '-1');
		await expect(interval).toHaveAttribute('aria-disabled', 'true');
	}
	await page.getByRole('button', { name: 'Toggle loading', exact: true }).click();
	await expect(page.getByText('Loading log volume…', { exact: true })).toBeVisible();
	await expect(
		page.getByText('No logs match this query and time range.', { exact: true })
	).toBeHidden();
	await page.getByRole('button', { name: 'Toggle loading', exact: true }).click();
	await page.getByRole('button', { name: 'Toggle empty', exact: true }).click();
	await expect(page.getByRole('button', { name: /25 log lines/ })).toHaveAttribute('tabindex', '0');
});

test('fits a narrow viewport in both themes without horizontal scrolling', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 640 });
	for (const theme of ['light', 'dark']) {
		await page
			.locator('html')
			.evaluate((element, value) => element.setAttribute('class', value), theme);
		await expect(page.getByRole('region', { name: 'Log volume' })).toBeVisible();
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
		).toBe(true);
		await expect(page.getByRole('button', { name: /^Search / })).toHaveCount(4);
	}
});
