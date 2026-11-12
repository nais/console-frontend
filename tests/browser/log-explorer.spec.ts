import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.route('**/api/loki/api/v1/**', async (route) => {
		const query = new URL(route.request().url()).searchParams.get('query') ?? '';
		const volume = query.includes('count_over_time');
		await route.fulfill({
			json: {
				status: 'success',
				data: {
					resultType: volume ? 'matrix' : 'streams',
					result: volume
						? []
						: [
								{
									stream: { level: 'info' },
									values: [[String(BigInt(Date.now()) * 1_000_000n), 'Test log message']]
								}
							]
				}
			}
		});
	});
	await page.goto('/tests/browser/log-explorer.html');
	await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
	await expect(page.getByText('Test log message', { exact: true })).toBeVisible();
});

test('settings retain their values and restore focus after Escape or explicit close', async ({
	page
}) => {
	const trigger = page.getByRole('button', { name: 'Settings', exact: true });
	await trigger.focus();
	await page.keyboard.press('Enter');
	const settings = page.getByRole('dialog', { name: 'Log settings' });
	await expect(settings).toBeVisible();
	await expect(trigger).toHaveAttribute('aria-expanded', 'true');
	await expect(settings.getByLabel('Auto-refresh')).toBeFocused();
	await settings.getByRole('checkbox', { name: 'Show query' }).check();
	await expect(settings.getByLabel('Lines per page')).toHaveValue('500');
	await page.keyboard.press('Escape');
	await expect(settings).toBeHidden();
	await expect(trigger).toBeFocused();
	await expect(page.getByText('Executed LogQL', { exact: true })).toBeVisible();
	await trigger.click();
	await expect(settings.getByRole('checkbox', { name: 'Show query' })).toBeChecked();
	await settings.getByRole('button', { name: 'Close settings' }).click();
	await expect(settings).toBeHidden();
	await expect(trigger).toBeFocused();
});

test('settings fit narrow screens and dismiss on outside interaction', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 640 });
	const trigger = page.getByRole('button', { name: 'Settings', exact: true });
	await trigger.click();
	const settings = page.getByRole('dialog', { name: 'Log settings' });
	await expect(settings).toBeVisible();
	const bounds = await settings.boundingBox();
	expect(bounds).not.toBeNull();
	expect(bounds!.x).toBeGreaterThanOrEqual(0);
	expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
	await page.getByRole('textbox', { name: 'Search log content' }).click();
	await expect(settings).toBeHidden();
	await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('label chips remove their filters with the keyboard and refresh the query', async ({
	page
}) => {
	await page.locator('.line summary').click();
	await page.getByRole('button', { name: 'Include level = info', exact: true }).click();
	const chip = page.getByRole('button', { name: 'Remove filter: level="info"', exact: true });
	await expect(chip).toBeVisible();
	await expect(
		page.getByRole('list', { name: 'Active label filters' }).getByRole('listitem')
	).toHaveCount(1);
	await chip.focus();
	const request = page.waitForRequest((request) => {
		const url = new URL(request.url());
		return (
			url.pathname === '/api/loki/api/v1/query_range' &&
			!url.searchParams.get('query')?.includes('level="info"')
		);
	});
	await page.keyboard.press('Enter');
	await expect(chip).toBeHidden();
	await request;
});
