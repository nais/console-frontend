import { readFileSync } from 'node:fs';
import { expect, test, type Locator } from '@playwright/test';

const themeProperties = [
	...new Set(
		[
			...readFileSync(new URL('../../src/styles/shadcn.css', import.meta.url), 'utf8').matchAll(
				/(--[\w-]+)\s*:/g
			)
		].map(([, name]) => name)
	)
];

test.beforeEach(async ({ page }) => {
	await page.goto('/tests/browser/primitive-feedback.html');
	await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
});

for (const width of [375, 1200]) {
	test(`cost axis follows visible legend series at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/tests/browser/primitive-feedback.html?cost-formatting');
		await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
		const chart = page.getByTestId('cost-area-legend');
		const labels = chart.locator('.lc-axis.placement-left .lc-axis-tick-group text');
		const large = chart.getByRole('button', { name: 'Compute Engine', exact: true });
		const small = chart.getByRole('button', { name: 'Cloud Storage', exact: true });
		const credit = chart.getByRole('button', { name: 'Secret Manager', exact: true });

		async function expectAxis(precision: number) {
			await expect
				.poll(async () => {
					const texts = await labels.allTextContents();
					return (
						texts.length > 2 &&
						new Set(texts).size === texts.length &&
						texts.every((text) => text.split(',')[1]?.split(/\s/)[0].length === precision)
					);
				})
				.toBe(true);
			for (const label of await labels.all()) {
				const box = await label.boundingBox();
				if (!box) throw new Error('Cost axis label has no bounding box');
				expect(box.x).toBeGreaterThanOrEqual(0);
				expect(box.x + box.width).toBeLessThanOrEqual(width);
			}
		}

		await expectAxis(2);
		await small.click();
		await expectAxis(4);
		await expect(labels.last()).toContainText('0,0010');
		await small.click();
		await expectAxis(2);
		await large.click();
		await expectAxis(2);
		await small.click();
		await expectAxis(2);
		await large.click();
		await expectAxis(4);
		await small.click();
		await credit.click();
		await expectAxis(6);
		await expect(labels.first()).toContainText('−0,000010');
	});

	test(`cost charts use readable decimal euros at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/tests/browser/primitive-feedback.html?cost-formatting');
		await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
		for (const maximum of [1, 1000, 1000000, 0.001, 0.00001]) {
			const chart = page.getByTestId(`cost-area-${maximum}`);
			const labels = chart.locator('.lc-axis.placement-left .lc-axis-tick-group text');
			await expect(labels.first()).toBeVisible();
			const texts = await labels.allTextContents();
			expect(texts.length).toBeGreaterThan(2);
			expect(new Set(texts).size).toBe(texts.length);
			expect(texts.every((text) => text.includes('€') && !/[mµK]/.test(text))).toBe(true);
			const precision = texts.map((text) => text.split(',')[1].split(/\s/)[0].length);
			expect(new Set(precision).size).toBe(1);
			for (const label of await labels.all()) {
				const box = await label.boundingBox();
				if (!box) throw new Error('Cost axis label has no bounding box');
				expect(box.x).toBeGreaterThanOrEqual(0);
				expect(box.x + box.width).toBeLessThanOrEqual(width);
			}
		}
		const chart = page.getByTestId('cost-line');
		await chart.hover();
		await expect(
			page.locator('.lc-tooltip-item-value').filter({ hasText: '0,0024' })
		).toBeVisible();
	});
}

test('favorite drag handles use a tooltip instead of a native title', async ({ page }) => {
	await page.goto('/tests/browser/primitive-feedback.html?favorite-drag');
	await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
	const handle = page.locator('.drag-handle');
	await expect(handle).not.toHaveAttribute('title');
	await handle.hover();
	const tooltip = page.getByRole('tooltip', { name: 'Drag to reorder', exact: true });
	await expect(tooltip).toBeVisible();
	const trigger = page.getByRole('button', { name: 'Drag to reorder', exact: true });
	await trigger.focus();
	await page.mouse.move(0, 0);
	await expect(tooltip).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(tooltip).toHaveCount(0);
});

for (const width of [320, 1200]) {
	test(`log label filters show tooltips on hover and focus at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.locator('summary').filter({ hasText: 'Tooltip regression log' }).click();
		for (const { action, content, operator } of [
			{ action: 'Include', content: 'Include this value', operator: '=' },
			{ action: 'Exclude', content: 'Exclude this value', operator: '!=' }
		]) {
			const button = page.getByRole('button', {
				name: `${action} detected_level = info`,
				exact: true
			});
			const tooltip = page.getByRole('tooltip', { name: content, exact: true });
			await button.hover();
			await expect(tooltip).toBeVisible();
			expect(await tooltip.evaluate((element) => element.closest('.lines'))).toBeNull();
			const box = await tooltip.boundingBox();
			if (!box) throw new Error('Tooltip has no visible bounding box');
			expect(box.x).toBeGreaterThanOrEqual(0);
			expect(box.x + box.width).toBeLessThanOrEqual(width);
			await page.mouse.move(0, 0);
			await expect(tooltip).toHaveCount(0);
			await button.focus();
			await expect(tooltip).toBeVisible();
			await page.keyboard.press('Escape');
			await expect(tooltip).toHaveCount(0);
			await button.click();
			await expect(page.getByRole('status', { name: 'Selected log filter' })).toHaveText(
				`detected_level${operator}info`
			);
			await button.blur();
			await page.mouse.move(0, 0);
		}
		await expect(page.getByRole('button', { name: /Include service_name/ })).toHaveCount(0);
	});
}

test('log volume tooltips support both hover and keyboard focus', async ({ page }) => {
	const button = page.getByRole('button', { name: /Search .*42 log lines/ });
	const tooltip = page.getByRole('tooltip', { name: /42 log lines/ });
	await button.hover();
	await expect(tooltip).toBeVisible();
	await page.mouse.move(0, 0);
	await expect(tooltip).toHaveCount(0);
	await button.focus();
	await expect(tooltip).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(tooltip).toHaveCount(0);
});

test('job run delete buttons show a tooltip on hover and focus without changing the action', async ({
	page
}) => {
	const button = page.getByRole('button', { name: 'Delete run fixture-run', exact: true });
	const tooltip = page.getByRole('tooltip', { name: 'Delete run', exact: true });
	await button.hover();
	await expect(tooltip).toBeVisible();
	await page.mouse.move(0, 0);
	await expect(tooltip).toHaveCount(0);
	await button.focus();
	await expect(tooltip).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(tooltip).toHaveCount(0);
	await expect(button).toBeFocused();
	await button.click();
	await expect(page.getByRole('status', { name: 'Run selected for deletion' })).toHaveText(
		'fixture-run'
	);
});

for (const width of [320, 1200]) {
	test(`activity tooltips escape collection clipping at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		const trigger = page.getByRole('button', { name: 'Kubernetes audit', exact: true });
		await trigger.hover();
		const tooltip = page.getByRole('tooltip', { name: 'Kubernetes audit', exact: true });
		await expect(tooltip).toBeVisible();
		expect(await tooltip.evaluate((element) => element.closest('.collection'))).toBeNull();
		const box = await tooltip.boundingBox();
		expect(box).not.toBeNull();
		expect(box!.x).toBeGreaterThanOrEqual(0);
		expect(box!.x + box!.width).toBeLessThanOrEqual(width);
		await trigger.focus();
		const tooltipId = await tooltip.getAttribute('id');
		if (!tooltipId) throw new Error('Tooltip is missing its description ID');
		await expect(trigger).toHaveAttribute('aria-describedby', tooltipId);
		await page.keyboard.press('Escape');
		await expect(tooltip).toHaveCount(0);
	});
}

test('tooltips preserve dialog layering, themes and interactive child descriptions', async ({
	page
}) => {
	await page.getByRole('button', { name: 'Open themed dialog' }).click();
	const dialog = page.getByRole('dialog', { name: 'Themed dialog' });
	const trigger = dialog.getByRole('button', { name: 'Dialog tooltip target' });
	await trigger.focus();
	const tooltip = dialog.getByRole('tooltip', { name: 'Dialog tooltip', exact: true });
	await expect(tooltip).toBeVisible();
	const tooltipId = await tooltip.getAttribute('id');
	if (!tooltipId) throw new Error('Tooltip is missing its description ID');
	await expect(trigger).toHaveAttribute('aria-describedby', tooltipId);
	const background = await tooltip.evaluate((element) => getComputedStyle(element).backgroundColor);
	await dialog.getByRole('button', { name: 'Toggle dialog theme' }).click();
	await trigger.focus();
	await expect(tooltip).toBeVisible();
	await expect(tooltip).not.toHaveCSS('background-color', background);
	await page.keyboard.press('Escape');
	await expect(tooltip).toHaveCount(0);
	await expect(dialog).toBeVisible();
});

for (const theme of ['light', 'dark']) {
	test(`cost sparklines and hover indicators follow the trend colour in ${theme} mode`, async ({
		page
	}) => {
		await page.evaluate((theme) => {
			document.documentElement.classList.toggle('dark', theme === 'dark');
		}, theme);
		for (const { key, variant, label } of [
			{ key: 'decreasing', variant: 'success', label: '-4%' },
			{ key: 'threshold', variant: 'success', label: '+5%' },
			{ key: 'increasing', variant: 'warning', label: '+6%' }
		]) {
			const metric = page.getByTestId(`cost-${key}`).locator('a[href="/team/cost-fixture/cost"]');
			await expect(metric).toHaveClass(new RegExp(`\\b${variant}\\b`));
			const value = metric.locator('.metric-value');
			await expect(value).toHaveText(label);
			const colour = await value.evaluate((element) => getComputedStyle(element).color);
			await expect(metric.locator('.lc-area-line.sparkline-line')).toHaveCSS('stroke', colour);
			await metric.locator('.sparkline').hover();
			await expect(metric.locator('.lc-highlight-point')).toHaveCSS('fill', colour);
			const tooltip = page.locator('.lc-tooltip-container:visible');
			await expect(tooltip).toBeVisible();
			await expect(tooltip.locator('.lc-tooltip-item-color')).toHaveCSS('background-color', colour);
			await expect(tooltip.locator('.lc-tooltip-item-label')).toHaveText('Cost');
			await page.mouse.move(0, 0);
			await expect(page.locator('.lc-tooltip-container')).toHaveCount(0);
		}
	});
}

for (const theme of ['light', 'dark']) {
	test(`Monitor uses the same blue-grey colour in bars and legends in ${theme} mode`, async ({
		page
	}) => {
		await page.evaluate((theme) => {
			document.documentElement.classList.toggle('dark', theme === 'dark');
		}, theme);
		const summaries = page.getByRole('region', { name: 'Priority colours' });
		const expectedColour = theme === 'light' ? 'rgb(203, 213, 225)' : 'rgb(51, 65, 85)';
		const bars = summaries.getByRole('img', {
			name: 'High: 162, Elevated: 99, Monitor: 1092',
			exact: true
		});
		await expect(bars).toHaveCount(2);
		for (let index = 0; index < 2; index++) {
			await expect(summaries.locator('.segment.monitor').nth(index)).toHaveCSS(
				'background-color',
				expectedColour
			);
			await expect(summaries.locator('.swatch.monitor').nth(index)).toHaveCSS(
				'background-color',
				expectedColour
			);
		}
	});
}

for (const width of [320, 1200]) {
	for (const theme of ['light', 'dark']) {
		test(`${width}px ${theme} empty collections have spacing, clear headings and no overflow`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 900 });
			await page.evaluate((theme) => {
				document.documentElement.classList.toggle('dark', theme === 'dark');
			}, theme);
			const collection = page.locator('.collection').filter({
				has: page.getByRole('heading', { name: 'Cloud SQL', exact: true })
			});
			const empty = collection.locator('.empty-state');
			await expect(
				empty.getByRole('heading', { level: 3, name: 'No Cloud SQL instances found.' })
			).toBeVisible();
			await expect(empty).toHaveCSS('padding-top', '40px');
			await expect(empty).toHaveCSS('padding-inline-start', '24px');
			await expect(
				empty.getByText('Cloud SQL instances provide managed relational databases in the cloud.')
			).toBeVisible();
			const documentation = empty.getByRole('link');
			await expect(documentation).toHaveAttribute(
				'href',
				'https://docs.nais.io/persistence/cloudsql'
			);
			await expect(documentation).toHaveAttribute('target', '_blank');
			await expect(collection.locator('table')).toHaveCount(0);
			expect(
				await collection.evaluate((element) => element.scrollWidth <= element.clientWidth)
			).toBe(true);
			await expect(page.getByRole('heading', { name: 'No applications found.' })).toBeVisible();
			await expect(
				page.getByRole('heading', { name: 'No jobs match your filters.' })
			).toBeVisible();
			const issues = page.getByRole('region', { name: 'Issues', exact: true });
			const issueCollection = issues.locator('.collection');
			await expect(issueCollection.locator('header')).toHaveCount(0);
			await expect(
				issues.getByRole('heading', { level: 3, name: 'No issues found', exact: true })
			).toBeVisible();
			await expect(issueCollection.locator('.empty-state')).toHaveCSS('padding-top', '40px');
			await expect(issueCollection.locator('.empty-state')).toHaveCSS('text-align', 'center');
			expect(
				await issueCollection.evaluate((element) => element.scrollWidth <= element.clientWidth)
			).toBe(true);
			await documentation.focus();
			await expect(documentation).toBeFocused();
		});
	}
}

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

async function themeTokens(locator: Locator, properties = themeProperties) {
	return locator.evaluate((element, names) => {
		const style = getComputedStyle(element);
		return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name).trim()]));
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
