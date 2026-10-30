import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import LogVolume from './LogVolume.svelte';

describe('LogVolume', () => {
	it('scales bars proportionally without giving empty intervals a false volume', async () => {
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
		expect(body).toContain('--bar-height: 0%');
		expect(body).toContain('--bar-height: 25%');
		expect(body).toContain('--bar-height: 100%');
		expect(body).toContain('aksel-sr-only');
		expect(body).toContain('aria-label="Search ');
		expect(body).toContain('25 log lines');
		expect(body).not.toContain('title=');
		expect(body).not.toContain('No log lines in this time range.');
	});

	it('explains an empty histogram without dividing by zero', async () => {
		const { body } = await render(LogVolume, {
			props: {
				buckets: [{ start: 0, end: 1000, count: 0 }],
				onselect: () => {}
			}
		});
		expect(body).toContain('No log lines in this time range.');
		expect(body).toContain('--bar-height: 0%');
		expect(body).not.toContain('NaN');
		expect(body).not.toContain('Infinity');
	});
});
