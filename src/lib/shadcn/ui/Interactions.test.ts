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
});
