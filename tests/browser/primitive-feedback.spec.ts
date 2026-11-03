import { expect, test } from '@playwright/test';

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
		small: 15,
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
