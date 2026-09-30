import { render } from 'svelte/server';
import FieldIdsFixture from './FieldIdsFixture.svelte';

describe('field IDs', () => {
	test('links labels to distinct inputs and preserves explicit IDs on SSR', async () => {
		const { body } = await render(FieldIdsFixture);
		const searchIds = [...body.matchAll(/<label for="([^"]+)" class="sr-only[^"]*">/g)].map(
			([, id]) => id
		);
		const textareaId = body.match(/<label[^>]+for="([^"]+)">First notes<\/label>/)?.[1];

		expect(searchIds).toHaveLength(2);
		expect(new Set([...searchIds, textareaId, 'explicit-notes']).size).toBe(4);
		for (const id of searchIds) {
			expect(body).toContain(`id="${id}"`);
		}
		expect(body).toContain(`id="${textareaId}"`);
		expect(body).toContain('for="explicit-notes"');
		expect(body).toContain('id="explicit-notes"');
	});
});
