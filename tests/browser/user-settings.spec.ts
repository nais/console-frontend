import { expect, test, type Page } from '@playwright/test';

async function visit(page: Page, theme = 'light') {
	await page.goto(`/tests/browser/user-settings.html${theme === 'dark' ? '?dark=true' : ''}`);
	await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
}

for (const theme of ['light', 'dark']) {
	for (const rootSize of [16, 20]) {
		test(`${theme}: rem typography scales from a ${rootSize}px root`, async ({ page }) => {
			await visit(page, theme);
			await page.locator('html').evaluate((element, size) => {
				element.style.fontSize = `${size}px`;
			}, rootSize);
			const typography = await page.locator('main').evaluate((element) => {
				const sample = document.createElement('span');
				sample.textContent = 'l';
				element.append(sample);
				try {
					sample.style.fontFamily = 'var(--sh-font-family-mono)';
					return {
						monospace: getComputedStyle(sample).fontFamily,
						sizes: ['xs', 'sm', 'label', 'body', 'base', 'lg', 'xl'].map((size) => {
							sample.style.fontSize = `var(--sh-font-size-${size})`;
							return Number.parseFloat(getComputedStyle(sample).fontSize);
						}),
						weights: ['regular', 'medium', 'semibold', 'heading-large', 'bold'].map((weight) => {
							sample.style.fontWeight = `var(--sh-font-weight-${weight})`;
							return getComputedStyle(sample).fontWeight;
						}),
						lineHeights: ['compact', 'large', 'heading-xsmall', 'heading-medium'].map((height) => {
							sample.style.lineHeight = `var(--sh-font-line-height-${height})`;
							return Number.parseFloat(getComputedStyle(sample).lineHeight);
						})
					};
				} finally {
					sample.remove();
				}
			});
			expect(typography).toEqual({
				monospace: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
				sizes: [0.85, 0.9, 0.9, 0.9375, 1, 1.125, 1.375].map((size) => size * rootSize),
				weights: ['400', '500', '600', '650', '700'],
				lineHeights: [1.25, 1.5, 1.375, 1.75].map((height) => height * rootSize)
			});
			await expect(page.getByText('Sample body text', { exact: true })).toHaveCSS(
				'font-size',
				`${0.9 * rootSize}px`
			);
			await expect(page.getByRole('cell')).toHaveCSS('font-size', `${0.9375 * rootSize}px`);
		});
	}

	test(`${theme}: keyboard navigation reaches themes and logout, with no text-size options`, async ({
		page
	}) => {
		await visit(page, theme);
		const opener = page.getByRole('button', { name: 'User settings' });
		await opener.focus();
		await page.keyboard.press('ArrowDown');
		const light = page.getByRole('menuitemradio', { name: 'Light', exact: true });
		const dark = page.getByRole('menuitemradio', { name: 'Dark', exact: true });
		const logout = page.getByRole('menuitem', { name: 'Log out', exact: true });
		await expect(light).toBeFocused();
		await expect(page.getByRole('menuitemradio')).toHaveCount(2);
		await expect(page.getByText('Text size', { exact: true })).toHaveCount(0);
		await expect(theme === 'light' ? light : dark).toHaveAttribute('aria-checked', 'true');
		await page.keyboard.press('ArrowDown');
		await expect(dark).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(logout).toBeFocused();
		await expect(logout).toHaveAttribute('href', '/oauth2/logout');
		await expect(logout).toHaveAttribute('data-sveltekit-reload');
		await expect(logout.locator('svg')).toHaveAttribute('aria-hidden', 'true');
		await page.keyboard.press('Escape');
		await expect(opener).toBeFocused();
	});

	for (const width of [320, 375]) {
		test(`${theme}: profile menu fits a ${width}px mobile viewport`, async ({ page }) => {
			await page.setViewportSize({ width, height: 812 });
			await visit(page, theme);
			await page.getByRole('button', { name: 'User settings' }).click();
			await expect(page.getByRole('menuitemradio')).toHaveCount(2);
			await expect(page.getByRole('menuitem', { name: 'Log out' })).toBeVisible();
			const menu = await page.getByRole('menu').boundingBox();
			expect(menu).not.toBeNull();
			expect(menu!.x).toBeGreaterThanOrEqual(0);
			expect(menu!.x + menu!.width).toBeLessThanOrEqual(width);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
				width
			);
		});
	}
}

test('switches color theme without changing the user-adjusted typography', async ({ page }) => {
	await page.route('**/api/theme', (route) => route.fulfill({ status: 200 }));
	await visit(page);
	const opener = page.getByRole('button', { name: 'User settings' });
	const theme = page.locator('.sh-theme-root');
	await opener.click();
	const request = page.waitForRequest('**/api/theme');
	await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).click();
	expect((await request).postData()).toContain('dark');
	await expect(theme).toHaveAttribute('data-theme', 'dark');
	await expect(page.locator('body')).toHaveCSS('font-size', '15px');
	await opener.click();
	await page.getByRole('menuitemradio', { name: 'Light', exact: true }).click();
	await expect(theme).toHaveAttribute('data-theme', 'light');
	await expect(page.locator('body')).toHaveCSS('font-size', '15px');
});

test('disables concurrent theme changes while keeping logout available', async ({ page }) => {
	let complete: (() => void) | undefined;
	const pending = new Promise<void>((resolve) => (complete = resolve));
	await page.route('**/api/theme', async (route) => {
		await pending;
		await route.fulfill({ status: 200 });
	});
	await visit(page);
	const opener = page.getByRole('button', { name: 'User settings' });
	await opener.click();
	await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).click();
	await opener.click();
	for (const item of await page.getByRole('menuitemradio').all()) {
		await expect(item).toHaveAttribute('data-disabled');
	}
	await expect(page.getByRole('menuitem', { name: 'Log out' })).not.toHaveAttribute(
		'data-disabled'
	);
	complete?.();
	await expect(page.getByRole('menuitemradio').first()).not.toHaveAttribute('data-disabled');
});

for (const failure of ['network', 'server']) {
	test(`restores the previous theme and shows a ${failure} save error`, async ({ page }) => {
		await page.route('**/api/theme', (route) =>
			failure === 'network' ? route.abort() : route.fulfill({ status: 500 })
		);
		await visit(page, 'dark');
		await page.getByRole('button', { name: 'User settings' }).click();
		await page.getByRole('menuitemradio', { name: 'Light', exact: true }).click();
		await expect(page.getByText('Color theme could not be saved. Please try again.')).toBeVisible();
		await expect(page.locator('.sh-theme-root')).toHaveAttribute('data-theme', 'dark');
		await expect(page.getByRole('menuitemradio', { name: 'Dark', exact: true })).toHaveAttribute(
			'aria-checked',
			'true'
		);
		await expect(page.getByRole('menuitem', { name: 'Log out' })).toBeVisible();
	});
}

test('logout follows a native document navigation', async ({ page }) => {
	await page.route('**/oauth2/logout', (route) =>
		route.fulfill({ contentType: 'text/html', body: '<h1>Logged out</h1>' })
	);
	await visit(page);
	await page.getByRole('button', { name: 'User settings' }).click();
	const request = page.waitForRequest('**/oauth2/logout');
	await page.getByRole('menuitem', { name: 'Log out', exact: true }).click();
	const navigation = await request;
	expect(navigation.isNavigationRequest()).toBe(true);
	expect(navigation.resourceType()).toBe('document');
	await expect(page.getByRole('heading', { name: 'Logged out' })).toBeVisible();
});
