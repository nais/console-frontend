import { expect, test, type Locator } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/tests/browser/primitive-feedback.html');
	await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
});

test('favorites visibly fill and unfill the star, including after reload', async ({ page }) => {
	const add = page.getByRole('button', { name: 'Add to favorites', exact: true });
	await expect(add.locator('svg')).toHaveCSS('fill', 'none');
	await add.click();
	const remove = page.getByRole('button', { name: 'Remove from favorites', exact: true });
	await expect
		.poll(() =>
			remove.locator('svg').evaluate((element) => {
				const style = getComputedStyle(element);
				return style.fill === style.color;
			})
		)
		.toBe(true);
	await page.reload();
	await expect(remove).toBeVisible();
	await expect(remove.locator('svg')).not.toHaveCSS('fill', 'none');
	await remove.click();
	await expect(add.locator('svg')).toHaveCSS('fill', 'none');
});

test('Loader sizes override global Lucide sizing and preserve supplied styles', async ({
	page
}) => {
	const sizes = {
		'3xlarge': 48,
		'2xlarge': 36,
		xlarge: 28,
		large: 24,
		medium: 18,
		small: 16,
		xsmall: 12
	};
	for (const [size, pixels] of Object.entries(sizes)) {
		const loader = page.getByRole('status', { name: `Loading ${size}`, exact: true });
		await expect(loader).toHaveCSS('width', `${pixels}px`);
		await expect(loader).toHaveCSS('height', `${pixels}px`);
	}
	const styled = page.getByRole('status', { name: 'Styled loading' });
	await expect(styled).toHaveCSS('width', '24px');
	await expect(styled).toHaveAttribute('style', /color: var\(--ax-text-accent\)/);
});

test('Loader follows rem scaling and scoped spacing token overrides', async ({ page }) => {
	await page.locator('html').evaluate((element) => {
		element.style.fontSize = '20px';
	});
	const sizes = {
		'3xlarge': 60,
		'2xlarge': 45,
		xlarge: 35,
		large: 30,
		medium: 22.5,
		small: 20,
		xsmall: 15
	};
	for (const [size, pixels] of Object.entries(sizes)) {
		const loader = page.getByRole('status', { name: `Loading ${size}`, exact: true });
		await expect(loader).toHaveCSS('width', `${pixels}px`);
		await expect(loader).toHaveCSS('height', `${pixels}px`);
	}
	await page.locator('main').evaluate((element) => {
		element.style.setProperty('--ax-space-48', '4rem');
	});
	const largest = page.getByRole('status', { name: 'Loading 3xlarge', exact: true });
	await expect(largest).toHaveCSS('width', '80px');
	await expect(largest).toHaveCSS('height', '80px');
	const styled = page.getByRole('status', { name: 'Styled loading' });
	await expect(styled).toHaveCSS('width', '30px');
	await expect(styled).toHaveAttribute('style', /color: var\(--ax-text-accent\)/);
});

test('shared heading tokens preserve the large weight and font-relative spacing', async ({
	page
}) => {
	await expect(page.getByRole('heading', { name: 'large heading', exact: true })).toHaveCSS(
		'font-weight',
		'650'
	);
	for (const size of ['xlarge', 'large', 'medium', 'small', 'xsmall']) {
		const heading = page.getByRole('heading', { name: `${size} heading`, exact: true });
		const metrics = await heading.evaluate((element) => {
			const style = getComputedStyle(element);
			return {
				fontSize: Number.parseFloat(style.fontSize),
				marginBottom: Number.parseFloat(style.marginBottom)
			};
		});
		expect(metrics.marginBottom).toBeCloseTo(metrics.fontSize / 2);
	}
});

async function themeTokens(locator: Locator, properties?: string[]) {
	return locator.evaluate((element, names) => {
		const style = getComputedStyle(element);
		const tokens = names ?? Array.from(style).filter((name) => name.startsWith('--'));
		return Object.fromEntries(tokens.map((name) => [name, style.getPropertyValue(name).trim()]));
	}, properties);
}

for (const rootTheme of ['light', 'dark']) {
	test(`explicit light themes reset nested palettes and portals with a ${rootTheme} root`, async ({
		page
	}) => {
		await page.locator('html').evaluate((element, theme) => {
			element.dataset.theme = theme;
		}, rootTheme);
		await expect(page.locator('body')).toHaveCSS(
			'background-color',
			rootTheme === 'dark' ? 'rgb(9, 13, 22)' : 'rgb(248, 250, 252)'
		);
		const reference = page.getByTestId('light-reference');
		await expect(reference).toHaveCSS('background-color', 'rgb(248, 250, 252)');
		const light = await themeTokens(reference);
		const properties = Object.keys(light);
		const parent = page.getByTestId('dark-parent');
		await expect(parent).toHaveCSS('background-color', 'rgb(9, 13, 22)');
		const dark = await themeTokens(parent, properties);
		expect(dark['--ax-bg-default']).not.toBe(light['--ax-bg-default']);
		expect(dark['--ax-text-neutral']).not.toBe(light['--ax-text-neutral']);
		expect(await themeTokens(page.getByTestId('inherited-dark'), properties)).toEqual(dark);
		expect(await themeTokens(page.getByTestId('nested-theme'), properties)).toEqual(light);
		expect(await themeTokens(page.getByTestId('inherited-theme'), properties)).toEqual(light);
		expect(await themeTokens(page.getByTestId('nested-dark'), properties)).toEqual(dark);

		await page.getByRole('button', { name: 'Nested theme actions', exact: true }).click();
		const menu = page.getByRole('menu');
		await expect(menu).toBeVisible();
		await expect(menu).toHaveCSS('background-color', 'rgb(255, 255, 255)');
		expect(await themeTokens(menu, properties)).toEqual(light);
		expect(
			await menu.evaluate((element) =>
				element.closest('.sh-theme-root')?.getAttribute('data-testid')
			)
		).toBe('nested-theme');
		await page.keyboard.press('Escape');

		await page.getByRole('button', { name: 'Open themed dialog' }).click();
		const dialog = page.getByRole('dialog', { name: 'Themed dialog' });
		await expect(dialog).toBeVisible();
		await expect(dialog).toHaveCSS('background-color', 'rgb(255, 255, 255)');
		expect(await themeTokens(dialog, properties)).toEqual(light);
		expect(
			await dialog.evaluate((element) =>
				element.closest('.sh-theme-root')?.getAttribute('data-testid')
			)
		).toBe('nested-theme');
		await dialog.getByRole('button', { name: 'Toggle dialog theme' }).click();
		await expect(dialog).toHaveCSS('background-color', 'rgb(15, 23, 42)');
		expect(await themeTokens(dialog, properties)).toEqual(dark);
		await dialog.getByRole('button', { name: 'Toggle dialog theme' }).click();
		await expect(dialog).toHaveCSS('background-color', 'rgb(255, 255, 255)');
		expect(await themeTokens(dialog, properties)).toEqual(light);
	});
}
