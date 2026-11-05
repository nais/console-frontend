import { expect, test, type Locator, type Page } from '@playwright/test';

async function expectSquare(locator: Locator, size: number) {
	await expect(locator).toHaveCSS('width', `${size}px`);
	await expect(locator).toHaveCSS('height', `${size}px`);
}

async function expectTokenSizes(page: Page, rootFontSize = 16) {
	const scale = rootFontSize / 16;
	await expectSquare(page.getByTestId('sbom-size').locator('svg'), 22 * scale);
	const persistence = page.getByTestId('persistence-size');
	await expectSquare(persistence.locator('.icon'), 32 * scale);
	await expectSquare(persistence.locator('svg'), 28 * scale);
	await expectSquare(page.getByRole('button', { name: 'Clear search', exact: true }), 24 * scale);
	await expectSquare(page.locator('.known-exploited .icon').first(), 36 * scale);
	await expect(page.locator('.count-badge').first()).toHaveCSS('height', `${20 * scale + 2}px`);
	await expect(page.getByTestId('loading-card').locator('.loading')).toHaveCSS(
		'min-height',
		`${96 * scale}px`
	);
}

async function contrast(
	locator: Locator,
	property: 'color' | 'borderTopColor' = 'color',
	pseudo: string | null = null
) {
	return locator.evaluate(
		(element, { property, pseudo }) => {
			const canvas = document.createElement('canvas');
			canvas.width = canvas.height = 1;
			const context = canvas.getContext('2d', { willReadFrequently: true });
			if (!context) throw new Error('Cannot measure contrast without a canvas context');

			const rgba = (color: string) => {
				context.clearRect(0, 0, 1, 1);
				context.fillStyle = color;
				context.fillRect(0, 0, 1, 1);
				const values = [...context.getImageData(0, 0, 1, 1).data];
				return [...values.slice(0, 3), values[3] / 255];
			};

			function composite(foreground: number[], background: number[]) {
				return [
					...foreground
						.slice(0, 3)
						.map((value, index) => value * foreground[3] + background[index] * (1 - foreground[3])),
					1
				];
			}

			function luminance(color: number[]) {
				return color
					.slice(0, 3)
					.map((value) => {
						value /= 255;
						return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
					})
					.reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
			}

			const ancestors: Element[] = [];
			for (let current: Element | null = element; current; current = current.parentElement) {
				ancestors.unshift(current);
			}
			let background = [255, 255, 255, 1];
			for (const ancestor of ancestors) {
				background = composite(rgba(getComputedStyle(ancestor).backgroundColor), background);
			}
			const foreground = composite(rgba(getComputedStyle(element, pseudo)[property]), background);
			const a = luminance(foreground);
			const b = luminance(background);
			return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
		},
		{ property, pseudo }
	);
}

for (const theme of ['light', 'dark']) {
	for (const width of [375, 1440]) {
		test(`${theme} at ${width}px keeps text legible and status colours AA compliant`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto('/tests/browser/primitive-feedback.html');
			await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
			await page.locator('html').evaluate((element, theme) => {
				element.dataset.theme = theme;
			}, theme);
			await expectTokenSizes(page);
			const controls = page.getByRole('region', { name: 'Readable controls' });
			await expect(page.getByRole('heading', { name: 'Cloud SQL', exact: true })).toHaveCSS(
				'font-size',
				'18px'
			);
			await expect(page.getByTestId('cost-decreasing').locator('.metric-value').first()).toHaveCSS(
				'font-size',
				width <= 767 ? '22px' : '28px'
			);
			await expect(controls.getByRole('columnheader').first()).toHaveCSS('font-size', '14px');
			await expect(controls.getByRole('cell').first()).toHaveCSS('font-size', '15px');
			await expect(controls.getByText('Recently updated')).toHaveCSS('font-size', '14px');
			for (const text of [
				'success badge',
				'warning badge',
				'destructive badge',
				'info badge',
				'success tag',
				'warning tag',
				'destructive tag',
				'info tag',
				'dev-gcp'
			]) {
				const status = controls.getByText(text, { exact: true });
				await expect(status).toHaveCSS('font-size', '13px');
				expect(await contrast(status), `${text} contrast`).toBeGreaterThanOrEqual(4.5);
			}
			for (const locator of [
				controls.getByRole('columnheader').first(),
				controls.getByText('Recently updated')
			]) {
				expect(await contrast(locator)).toBeGreaterThanOrEqual(4.5);
			}
			const input = controls.getByRole('textbox', { name: 'Readability search' });
			await expect(input).toHaveCSS('font-size', '14px');
			const criticalDot = controls.getByTestId('critical-dot').locator('svg');
			await expect(criticalDot).toHaveCSS('width', '12px');
			await expect(criticalDot).toHaveCSS('height', '12px');
			expect(await contrast(input, 'borderTopColor')).toBeGreaterThanOrEqual(3);
			expect(await contrast(input, 'color', '::placeholder')).toBeGreaterThanOrEqual(4.5);
			expect(await controls.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
				true
			);
		});
	}
}

for (const theme of ['light', 'dark']) {
	test(`${theme} metric figures follow compact viewport boundaries`, async ({ page }) => {
		await page.goto('/tests/browser/primitive-feedback.html');
		await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
		await page.locator('html').evaluate((element, theme) => {
			element.dataset.theme = theme;
		}, theme);
		const metric = page.getByTestId('cost-decreasing').locator('.metric-value').first();
		for (const [width, height, size] of [
			[768, 501, '28px'],
			[767, 501, '22px'],
			[1440, 500, '22px'],
			[1440, 501, '28px']
		] as const) {
			await page.setViewportSize({ width, height });
			await expect(metric).toHaveCSS('font-size', size);
		}
	});

	test(`${theme} approved token sizes scale with a larger root font`, async ({ page }) => {
		await page.goto('/tests/browser/primitive-feedback.html');
		await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
		await page.locator('html').evaluate((element, theme) => {
			element.dataset.theme = theme;
			element.style.fontSize = '20px';
		}, theme);
		for (const width of [375, 1440]) {
			await page.setViewportSize({ width, height: 900 });
			await expectTokenSizes(page, 20);
			await expect(page.getByTestId('cost-decreasing').locator('.metric-value').first()).toHaveCSS(
				'font-size',
				width <= 767 ? '27.5px' : '35px'
			);
		}
	});

	test(`${theme} sidebar group labels remain legible`, async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 1000 });
		await page.goto(
			`/tests/browser/navigation.html?path=/team/nais&features${theme === 'dark' ? '&dark' : ''}`
		);
		const group = page.locator('.sh-sidebar .nav-group-label').first();
		await expect(group).toHaveCSS('font-size', '13px');
		expect(await contrast(group)).toBeGreaterThanOrEqual(4.5);
	});
}
