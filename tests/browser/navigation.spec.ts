import { expect, test, type Page } from '@playwright/test';

async function visit(page: Page, params: Record<string, string> = {}) {
	await page.goto(`/tests/browser/navigation.html?${new URLSearchParams(params)}`);
	await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
}

test.use({ viewport: { width: 800, height: 900 } });

test('narrow team navigation shows Tenant first and keeps team links distinct', async ({
	page
}) => {
	await visit(page, { path: '/team/nais/vulnerabilities' });
	await page.getByRole('button', { name: 'Open navigation' }).click();
	const dialog = page.getByRole('dialog', { name: 'Navigation' });
	const tenant = dialog.getByRole('navigation', { name: 'Tenant', exact: true });
	const team = dialog.getByRole('navigation', { name: 'Team: nais', exact: true });
	await expect(tenant.getByRole('link')).toHaveText([
		'Teams',
		'Vulnerabilities',
		'Cost',
		'Utilization',
		'Activity Log'
	]);
	await expect(tenant.getByRole('link', { name: 'Vulnerabilities' })).toHaveAttribute(
		'href',
		'/vulnerabilities'
	);
	await expect(tenant.locator('[aria-current]')).toHaveCount(0);
	await expect(team.getByRole('link', { name: 'Vulnerabilities' })).toHaveAttribute(
		'href',
		'/team/nais/vulnerabilities'
	);
	await expect(team.getByRole('link', { name: 'Vulnerabilities' })).toHaveAttribute(
		'aria-current',
		'page'
	);
	const sections = dialog.getByRole('navigation');
	await expect(sections.nth(0)).toHaveAccessibleName('Tenant');
	await expect(sections.nth(1)).toHaveAccessibleName('Team: nais');
	await expect(team.getByRole('link', { name: 'Valkey', exact: true })).toHaveCount(0);
});

test('tenant pages have navigation without a selected team, with admin gating', async ({
	page
}) => {
	await visit(page, { path: '/vulnerabilities/CVE-2026-1234' });
	await page.getByRole('button', { name: 'Open navigation' }).click();
	const dialog = page.getByRole('dialog', { name: 'Navigation' });
	await expect(dialog.getByRole('navigation')).toHaveCount(1);
	await expect(dialog.getByRole('link', { name: 'Vulnerabilities' })).toHaveAttribute(
		'aria-current',
		'page'
	);
	await expect(dialog.getByRole('link', { name: 'Teams', exact: true })).not.toHaveAttribute(
		'aria-current'
	);
	await expect(dialog.getByRole('link', { name: 'Admin', exact: true })).toHaveCount(0);

	await visit(page, { path: '/admin/reconcilers', admin: 'true' });
	await page.getByRole('button', { name: 'Open navigation' }).click();
	await expect(dialog.getByRole('link', { name: 'Admin', exact: true })).toHaveAttribute(
		'aria-current',
		'page'
	);
});

test('closed navigation is not tabbable and Escape restores focus to the opener', async ({
	page
}) => {
	await visit(page);
	const opener = page.getByRole('button', { name: 'Open navigation' });
	const outside = page.getByRole('button', { name: 'Outside navigation' });
	await opener.focus();
	await page.keyboard.press('Tab');
	await expect(outside).toBeFocused();
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Enter');
	const dialog = page.getByRole('dialog', { name: 'Navigation' });
	await expect(dialog).toBeVisible();
	await expect(opener).toHaveAttribute('aria-expanded', 'true');
	await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
	const last = dialog.getByRole('link').last();
	await last.focus();
	await page.keyboard.press('Tab');
	await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
	await page.keyboard.press('Shift+Tab');
	await expect(last).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(dialog).not.toBeVisible();
	await expect(opener).toBeFocused();
	await expect(opener).toHaveAttribute('aria-expanded', 'false');
	await page.keyboard.press('Tab');
	await expect(outside).toBeFocused();
});

test('navigation completion and backdrop clicks close the drawer', async ({ page }) => {
	await visit(page);
	const opener = page.getByRole('button', { name: 'Open navigation' });
	const dialog = page.getByRole('dialog', { name: 'Navigation' });
	await opener.click();
	await page.evaluate(() => window.dispatchEvent(new Event('test:navigated')));
	await expect(dialog).not.toBeVisible();
	await opener.click();
	await page.mouse.click(700, 300);
	await expect(dialog).not.toBeVisible();
	await expect(opener).toBeFocused();
});

test('desktop collapse survives resizing while mobile links retain their text', async ({
	page
}) => {
	await page.setViewportSize({ width: 1200, height: 900 });
	await visit(page, { features: 'true' });
	const sidebar = page.getByRole('complementary', { name: 'Team navigation' });
	await expect(sidebar).toBeVisible();
	await expect(sidebar.getByRole('link', { name: 'Valkey', exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Collapse team sidebar' }).click();
	await expect(page.getByRole('button', { name: 'Expand team sidebar' })).toBeVisible();
	await page.setViewportSize({ width: 800, height: 900 });
	await expect(sidebar).not.toBeVisible();
	await page.getByRole('button', { name: 'Open navigation' }).click();
	const dialog = page.getByRole('dialog', { name: 'Navigation' });
	await expect(dialog.getByRole('link', { name: 'Applications', exact: true })).toHaveText(
		'Applications'
	);
	await expect(dialog.getByRole('link', { name: 'Valkey', exact: true })).toBeVisible();
	await page.setViewportSize({ width: 1200, height: 900 });
	await expect(dialog).not.toBeVisible();
	await expect(sidebar).toBeVisible();
	await page.getByRole('button', { name: 'Expand team sidebar' }).click();
	await expect(sidebar.getByRole('link', { name: 'Applications', exact: true })).toHaveText(
		'Applications'
	);
	await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');
	await page.setViewportSize({ width: 800, height: 900 });
	await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute(
		'aria-expanded',
		'false'
	);
});

for (const theme of ['light', 'dark']) {
	test(`320px ${theme} navigation fits the viewport and scrolls to the last team link`, async ({
		page
	}) => {
		await page.setViewportSize({ width: 320, height: 568 });
		await visit(page, { ...(theme === 'dark' ? { dark: 'true' } : {}), features: 'true' });
		await page.getByRole('button', { name: 'Open navigation' }).click();
		const dialog = page.getByRole('dialog', { name: 'Navigation' });
		const bounds = await dialog.boundingBox();
		expect(bounds?.x).toBe(0);
		expect(bounds?.y).toBe(0);
		expect(bounds?.width).toBeLessThanOrEqual(320);
		expect(bounds?.height).toBe(568);
		const last = dialog.getByRole('link').last();
		await last.scrollIntoViewIfNeeded();
		await expect(last).toBeInViewport();
		await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeInViewport();
		expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
			true
		);
	});
}
