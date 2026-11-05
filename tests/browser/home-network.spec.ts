import { expect, test } from '@playwright/test';

test('reuses SSR home queries during hydration', async ({ page }) => {
	const queries: string[] = [];
	const errors: Error[] = [];
	page.on('request', (request) => {
		if (request.method() !== 'POST' || new URL(request.url()).pathname !== '/graphql') return;
		queries.push(request.postDataJSON().operationName);
	});
	page.on('pageerror', (error) => errors.push(error));

	const response = await page.goto('/');
	if (!response) throw new Error('Home navigation did not return a response.');
	expect(response.status()).toBe(200);
	const html = await response.text();
	expect(html).toContain('Recent activity');
	expect(html).not.toContain('Unable to load recent activity');
	expect(html).not.toContain('Recent activity is unavailable.');
	expect(html).toContain('class="team-card-main');

	const switcher = page.getByRole('button', { name: 'Select team', exact: true });
	await expect(async () => {
		await switcher.dispatchEvent('click');
		await expect(switcher).toHaveAttribute('aria-expanded', 'true', { timeout: 500 });
	}).toPass();
	await switcher.dispatchEvent('click');

	expect(errors).toEqual([]);
	expect(
		queries.filter((name) =>
			['UserTeams', 'HomeAttention', 'HomeActivity', 'HomeTeamSummaries'].includes(name)
		)
	).toEqual([]);
});
