import { expect, test } from '@playwright/test';

for (const width of [320, 960, 1600, 1601]) {
	test(`external tools remain accessible at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/tests/browser/page-header.html');
		await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
		const header = page.locator('.sh-topnav');
		const opener = header.getByRole('button', { name: 'External tools' });
		const links = [
			{ name: 'Docs', href: 'https://docs.nais.io' },
			{ name: 'APM', href: 'https://grafana.nav.cloud.nais.io/a/nais-apm-app/services' },
			{ name: 'Grafana', href: 'https://grafana.nav.cloud.nais.io' }
		];

		if (width <= 1600) {
			await expect(opener).toBeVisible();
			await expect(header.getByRole('link', { name: 'APM', exact: true })).not.toBeVisible();
			await opener.focus();
			await page.keyboard.press('ArrowDown');
			const menu = page.getByRole('menu');
			await expect(menu.getByRole('menuitem', { name: 'Docs', exact: true })).toBeFocused();
			for (const { name, href } of links) {
				const link = menu.getByRole('menuitem', { name, exact: true });
				await expect(link).toBeVisible();
				await expect(link).toHaveAttribute('href', href);
				await expect(link).toHaveAttribute('target', '_blank');
				await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
			}
			await page.keyboard.press('ArrowDown');
			await expect(menu.getByRole('menuitem', { name: 'APM', exact: true })).toBeFocused();
			await page
				.context()
				.route('https://grafana.nav.cloud.nais.io/**', (route) =>
					route.fulfill({ contentType: 'text/html', body: '<title>APM</title>' })
				);
			const popup = page.waitForEvent('popup');
			await page.keyboard.press('Enter');
			const apm = await popup;
			await expect(apm).toHaveURL(links[1].href);
			await apm.close();
			await expect(menu).not.toBeVisible();
			await expect(opener).toBeFocused();
			await opener.click();
			await expect(menu).toBeVisible();
			await page.keyboard.press('Escape');
			await expect(menu).not.toBeVisible();
			await expect(opener).toBeFocused();
		} else {
			await expect(opener).not.toBeVisible();
			for (const { name, href } of links) {
				const link = header.getByRole('link', { name, exact: true });
				await expect(link).toBeVisible();
				await expect(link).toHaveAttribute('href', href);
			}
		}

		expect(
			await header.evaluate((element) => {
				const bounds = element.getBoundingClientRect();
				return [...element.querySelectorAll('button, a')].every((control) => {
					const box = control.getBoundingClientRect();
					return box.width === 0 || (box.left >= bounds.left && box.right <= bounds.right);
				});
			})
		).toBe(true);
	});
}
