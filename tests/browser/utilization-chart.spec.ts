import { expect, test } from '@playwright/test';

for (const width of [375, 768, 1440]) {
	for (const theme of ['light', 'dark']) {
		test(`${width}px ${theme} utilization charts preserve plot area and contain axis labels`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(`/tests/browser/utilization-chart.html${theme === 'dark' ? '?dark' : ''}`);
			await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
			await page.evaluate(() => document.fonts.ready);
			const charts = page.locator('svg.lc-layout-svg:has(.lc-grid-y)');
			await expect(charts).toHaveCount(2);
			await expect(
				page
					.getByTestId('memory-chart')
					.locator('text')
					.filter({ hasText: /^100 GB$/ })
			).toBeVisible();
			await expect(
				page.getByTestId('memory-chart').getByText('teamdokumen...', { exact: true })
			).toBeVisible();
			await expect(
				page.getByTestId('memory-chart').getByText('teamkuhr', { exact: true })
			).toBeVisible();
			for (const label of await charts.locator('.placement-bottom text').allTextContents()) {
				expect(label.length).toBeLessThanOrEqual(14);
			}
			for (const resource of ['cpu', 'memory']) {
				// Label containment alone must not pass by squeezing away the data plot.
				const plot = page.getByTestId(`${resource}-chart`).locator('.lc-grid-y');
				await expect
					.poll(async () => (await plot.boundingBox())?.height)
					.toBeGreaterThanOrEqual(210);
				await expect
					.poll(async () => (await plot.boundingBox())?.width)
					.toBeGreaterThanOrEqual(200);
				const svg = page
					.getByTestId(`${resource}-chart`)
					.locator('svg.lc-layout-svg:has(.lc-grid-y)');
				const bounds = await svg.boundingBox();
				const plotBounds = await plot.boundingBox();
				expect(plotBounds!.x - bounds!.x).toBeLessThanOrEqual(resource === 'memory' ? 56 : 40);
			}
			for (const chart of await charts.all()) {
				await expect
					.poll(() =>
						chart.evaluate((svg) => {
							const box = svg.getBoundingClientRect();
							return [...svg.querySelectorAll('text')].flatMap((text) => {
								const label = text.getBoundingClientRect();
								return label.left < box.left - 1 ||
									label.right > box.right + 1 ||
									label.top < box.top - 1 ||
									label.bottom > box.bottom + 1
									? [text.textContent]
									: [];
							});
						})
					)
					.toEqual([]);
			}
			const [cpu, memory] = await charts.evaluateAll((elements) =>
				elements.map((element) => {
					const { left, right, top, bottom } = element.getBoundingClientRect();
					return { left, right, top, bottom };
				})
			);
			expect(cpu.right <= memory.left + 1 || cpu.bottom <= memory.top + 1).toBe(true);
			const following = await page.getByText('Content following the charts').boundingBox();
			expect(following!.y).toBeGreaterThanOrEqual(memory.bottom);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
				width
			);
		});
	}
}

test('truncated team labels retain the full name in tooltips and click payloads', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/tests/browser/utilization-chart.html');
	await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
	const memory = page.getByTestId('memory-chart');
	await expect(memory.getByText('teamdokumen...', { exact: true })).toBeVisible();
	const firstBar = memory.locator('.lc-tooltip-rect').first();
	await firstBar.hover();
	await expect(page.locator('.lc-tooltip-header')).toHaveText('teamdokumenthandtering');
	await firstBar.click();
	await expect(page.getByLabel('Selected team')).toHaveText('teamdokumenthandtering');
});
