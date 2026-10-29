import { render } from 'svelte/server';
import PostgresExtensionFields from './PostgresExtensionFields.svelte';

describe('PostgresExtensionFields', () => {
	test('renders a labelled group with the selected extensions and an empty-selection marker', async () => {
		const { body } = await render(PostgresExtensionFields, {
			props: { available: ['pgcrypto', 'vector'], selected: ['vector'] }
		});
		expect(body).toContain('<fieldset');
		expect(body).toContain('<legend');
		expect(body).toContain('Extensions');
		expect(body).toContain('1 selected: vector');
		expect(body).toContain('Choose extensions');
		expect(body).toContain('aria-expanded="false"');
		expect(body).toContain('type="search"');
		expect(body).toContain('name="extensionsPresent"');
		expect(body).toMatch(/<input(?=[^>]*value="vector")(?=[^>]*checked)[^>]*>/);
		expect(body).not.toMatch(/<input(?=[^>]*value="pgcrypto")(?=[^>]*checked)[^>]*>/);
	});

	test('preserves selected extensions no longer offered by the environment', async () => {
		const { body } = await render(PostgresExtensionFields, {
			props: { available: ['vector'], selected: ['legacy'] }
		});
		expect(body).toMatch(/<input(?=[^>]*value="legacy")(?=[^>]*checked)[^>]*>/);
		expect(body).toContain('Kept unless you remove it.');
	});

	test('shows an explicit empty state', async () => {
		const { body } = await render(PostgresExtensionFields, {
			props: { available: [], selected: [] }
		});
		expect(body).toContain('No extensions are available in this environment.');
		expect(body).not.toContain('Choose extensions');
		expect(body).toContain('name="extensionsPresent"');
	});

	test('keeps the summary short when many extensions are selected', async () => {
		const { body } = await render(PostgresExtensionFields, {
			props: {
				available: ['a', 'b', 'c', 'd', 'e'],
				selected: ['a', 'b', 'c', 'd', 'e']
			}
		});
		expect(body).toContain('5 selected: a, b, c, +2 more');
		expect(body).not.toContain('5 selected: a, b, c, d, e');
	});

	test('includes the original selection separately for detecting unchanged edits', async () => {
		const { body } = await render(PostgresExtensionFields, {
			props: { available: ['vector'], selected: [], initial: ['vector'] }
		});
		expect(body).toContain('name="initialExtensionsPresent"');
		expect(body).toContain('name="initialExtensions" value="vector"');
		expect(body).not.toMatch(/<input(?=[^>]*name="extensions")(?=[^>]*checked)[^>]*>/);
	});
});
