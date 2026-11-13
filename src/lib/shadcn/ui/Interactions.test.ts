import { render } from 'svelte/server';
import Interactions from './Interactions.test.svelte';

describe('primitive interaction contracts', () => {
	test('passes menu trigger attributes directly to the button', async () => {
		const { body } = await render(Interactions);
		expect(body).toMatch(/<button\b[^>]*aria-haspopup="menu"[^>]*>/);
		expect(body).toContain('aria-expanded="false"');
		expect(body).not.toContain('role="menu"');
	});

	test('connects Select validation and descriptions while preserving the supplied ID', async () => {
		const { body } = await render(Interactions);
		expect(body).toContain('for="test-selection"');
		expect(body).toContain('id="test-selection-description"');
		expect(body).toContain('id="test-selection-error"');
		expect(body).toMatch(/<select\b[^>]*aria-invalid="true"[^>]*>/);
		expect(body).toContain(
			'aria-describedby="external-description test-selection-description test-selection-error"'
		);
	});

	test('keeps only selected tabs and periods in the tab order', async () => {
		const { body } = await render(Interactions);
		expect(body).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*tabindex="0"/);
		expect(body).toMatch(/role="tab"[^>]*aria-selected="false"[^>]*tabindex="-1"/);
		expect(body).toMatch(/role="radio"[^>]*aria-checked="true"[^>]*tabindex="0"/);
		expect(body).toMatch(/role="radio"[^>]*aria-checked="false"[^>]*tabindex="-1"/);
	});

	test('provides a keyboard entry point when no tab or period is selected', async () => {
		const { body } = await render(Interactions, { props: { period: '', tab: '' } });
		expect(body).toMatch(/role="tablist"[^>]*tabindex="0"/);
		expect(body).toMatch(/role="radiogroup"[^>]*tabindex="0"/);
	});

	test('connects tabs to their named panels and hides inactive panels', async () => {
		const { body } = await render(Interactions);
		const tab = body.match(/<button\b[^>]*role="tab"[^>]*aria-selected="true"[^>]*>/)?.[0];
		const tabId = tab?.match(/\bid="([^"]+)"/)?.[1];
		const panelId = tab?.match(/aria-controls="([^"]+)"/)?.[1];
		expect(tabId).toBeDefined();
		expect(panelId).toBeDefined();
		expect(body).toContain(`id="${panelId}" aria-labelledby="${tabId}"`);
		expect(body).toMatch(/role="tabpanel"[^>]*hidden/);
	});

	test('maps Box compatibility props to shared tokens instead of DOM attributes', async () => {
		const { body } = await render(Interactions);
		const box = body.match(/<div\b[^>]*data-testid="compat-box"[^>]*>/)?.[0];
		for (const token of [
			'--nais-space-24',
			'--nais-radius-12',
			'--border',
			'--nais-space-2',
			'--background-subtle',
			'--sh-shadow-md'
		]) {
			expect(box).toContain(`var(${token})`);
		}
		expect(box).not.toContain('padding="space-24"');
		expect(box).not.toContain('borderRadius=');
	});

	test('keeps context lookup optional outside providers', async () => {
		const { body } = await render(Interactions);
		expect(body).toContain('aria-label="Optional contexts" data-missing="true"');
	});

	test('renders route navigation as links with the current page identified', async () => {
		const { body } = await render(Interactions);
		const navigation = body.match(
			/<nav\b[^>]*aria-label="Compatibility navigation"[^>]*>[\s\S]*?<\/nav>/
		)?.[0];
		expect(navigation).toContain('href="#overview"');
		expect(navigation).toContain('aria-current="page"');
		expect(navigation).not.toContain('role="tab"');
	});

	test('uses a named status for the shared loader icon', async () => {
		const { body } = await render(Interactions);
		expect(body).toMatch(/<svg\b[^>]*role="status"[^>]*aria-label="Compatibility loading"/);
		expect(body).toContain('lucide-loader-circle');
	});
});
