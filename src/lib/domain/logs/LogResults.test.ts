import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import LogResults from './LogResults.svelte';

const props = {
	entries: [
		{
			timestamp: '1793360657408654616',
			message: '{"message":"Test log"}',
			labels: {
				service_namespace: 'team',
				service_name: 'app',
				k8s_cluster_name: 'prod',
				k8s_container_name: 'app',
				k8s_pod_name: 'app-123',
				detected_level: 'info',
				'bad-label': 'display only'
			}
		}
	],
	wrap: true,
	oldestFirst: false
};

describe('LogResults label filters', () => {
	it('offers include and exclude actions for filterable labels only', async () => {
		const { body } = await render(LogResults, { props: { ...props, onfilter: () => {} } });
		expect(body).toContain('aria-label="Include k8s_pod_name = app-123"');
		expect(body).toContain('aria-label="Exclude detected_level = info"');
		expect(body.match(/aria-label="Include [^"]* = /g)).toHaveLength(2);
		expect(body.match(/aria-label="Exclude [^"]* = /g)).toHaveLength(2);
		expect(body.match(/aksel-button--icon-only/g)).toHaveLength(4);
		expect(body.match(/aksel-button--xsmall/g)).toHaveLength(5);
		expect(body).not.toContain('data-variant="secondary"');
		expect(body).not.toContain('>Include</');
		expect(body).not.toContain('>Exclude</');
		for (const name of [
			'service_namespace',
			'service_name',
			'k8s_cluster_name',
			'k8s_container_name',
			'bad-label'
		]) {
			expect(body).toContain(name);
			expect(body).not.toContain(`aria-label="Include ${name} =`);
			expect(body).not.toContain(`aria-label="Exclude ${name} =`);
		}
	});

	describe('LogResults details', () => {
		it('labels each message and label section with a unique heading', async () => {
			const { body } = await render(LogResults, {
				props: {
					...props,
					entries: [...props.entries, { ...props.entries[0], timestamp: '1793360657408654617' }]
				}
			});
			const headings = [...body.matchAll(/<section\b[^>]*aria-labelledby="([^"]+)"/g)].map(
				(match) => match[1]
			);
			expect(headings).toHaveLength(5);
			expect(new Set(headings).size).toBe(headings.length);
			for (const id of headings) expect(body).toContain(`id="${id}"`);
			expect(body.match(/<h4\b/g)).toHaveLength(4);
			expect(body.match(/Copy log line/g)).toHaveLength(2);
			expect(body).toContain('Timestamp (ns):');
			expect(body).toContain('1793360657408654616');
			expect(body).toContain('1793360657408654617');
		});
	});

	it('keeps labels visible without modifying hand-written advanced queries', async () => {
		const { body } = await render(LogResults, { props });
		expect(body).toContain('detected_level');
		expect(body).toContain('Use filters to filter by label values.');
		expect(body).not.toContain('aria-label="Include ');
		expect(body).not.toContain('aria-label="Exclude ');
	});
});
