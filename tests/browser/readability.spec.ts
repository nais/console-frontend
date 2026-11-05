import { expect, test, type Locator } from '@playwright/test';

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
		test(`${theme} cost tooltips are opaque and readable at ${width}px`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto('/tests/browser/primitive-feedback.html?cost-formatting');
			await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
			await page.locator('html').evaluate((element, theme) => {
				element.classList.toggle('dark', theme === 'dark');
			}, theme);
			for (const chartId of ['cost-bar', 'cost-area-legend', 'cost-line']) {
				await page.getByTestId(chartId).hover();
				const tooltip = page.locator('.lc-tooltip-container:visible');
				await expect(tooltip).toBeVisible();
				// Wait for LayerChart's entrance fade before checking effective opacity.
				await expect(tooltip.locator('..')).toHaveCSS('opacity', '1');
				const surface = await tooltip.evaluate((element) => {
					const canvas = document.createElement('canvas');
					canvas.width = canvas.height = 1;
					const context = canvas.getContext('2d');
					if (!context) throw new Error('Cannot measure tooltip background');
					context.fillStyle = getComputedStyle(element).backgroundColor;
					context.fillRect(0, 0, 1, 1);
					let opacity = 1;
					for (let current: Element | null = element; current; current = current.parentElement) {
						opacity *= Number(getComputedStyle(current).opacity);
					}
					return { alpha: context.getImageData(0, 0, 1, 1).data[3] / 255, opacity };
				});
				expect(surface, `${chartId} surface`).toEqual({ alpha: 1, opacity: 1 });
				await expect(tooltip).toHaveCSS(
					'background-color',
					theme === 'dark' ? 'rgb(15, 23, 42)' : 'rgb(255, 255, 255)'
				);
				for (const text of await tooltip
					.locator('.lc-tooltip-header, .lc-tooltip-item-label, .lc-tooltip-item-value')
					.all()) {
					expect(await contrast(text), `${chartId} text contrast`).toBeGreaterThanOrEqual(4.5);
				}
				await page.mouse.move(0, 0);
				await expect(page.locator('.lc-tooltip-container')).toHaveCount(0);
			}
		});
	}

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
			const controls = page.getByRole('region', { name: 'Readable controls' });
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
			expect(await contrast(input, 'borderTopColor')).toBeGreaterThanOrEqual(3);
			expect(await contrast(input, 'color', '::placeholder')).toBeGreaterThanOrEqual(4.5);
			expect(await controls.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
				true
			);
		});
	}
}

for (const theme of ['light', 'dark']) {
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
