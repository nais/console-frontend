import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import LogVolume from './LogVolume.svelte';

describe('LogVolume', () => {
	it('provides a labelled chart without redundant visible headings or instructions', async () => {
		const { body } = await render(LogVolume, {
			props: {
				buckets: [
					{ start: 0, end: 1000, count: 0 },
					{ start: 1000, end: 2000, count: 25 },
					{ start: 2000, end: 3000, count: 100 }
				],
				onselect: () => {}
			}
		});
		expect(body).toContain('class="sr-only"');
		expect(body).toContain('Log volume');
		expect(body).toContain('Select an interval to search its logs.');
		expect(body).not.toContain('No logs match');
		expect(body).not.toContain('Loading log volume');
	});

	it.each([{ buckets: [] }, { buckets: [{ start: 0, end: 1000, count: 0 }] }])(
		'shows one empty-state overlay without invalid chart values ($buckets)',
		async ({ buckets }) => {
			const { body } = await render(LogVolume, { props: { buckets, onselect: () => {} } });
			expect(body.match(/No logs match this query and time range\./g)).toHaveLength(1);
			expect(body).toContain('Try a wider time range or adjust the filters.');
			expect(body).toContain('role="status"');
			expect(body).not.toContain('NaN');
			expect(body).not.toContain('Infinity');
		}
	);

	it('does not present a pending volume request as an empty result', async () => {
		const { body } = await render(LogVolume, {
			props: { buckets: [], loading: true, onselect: () => {} }
		});
		expect(body).toContain('aria-busy="true"');
		expect(body).toContain('Loading log volume');
		expect(body).not.toContain('No logs match');
	});
});
