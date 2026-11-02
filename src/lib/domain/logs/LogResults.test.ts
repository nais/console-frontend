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
	it('keeps collapsed rows free of expanded content and actions', async () => {
		const { body } = await render(LogResults, { props: { ...props, onfilter: () => {} } });
		expect(body).toMatch(/<summary\b/);
		expect(body).toContain('Test log');
		expect(body).not.toContain('<pre');
		expect(body).not.toContain('<dl');
		expect(body).not.toContain('<button');
		expect(body).not.toContain('Copy log line');
		expect(body).not.toContain('Timestamp (ns):');
	});

	it('renders all 500 summaries without mounting hidden detail controls', async () => {
		const { body } = await render(LogResults, {
			props: {
				...props,
				entries: Array.from({ length: 500 }, (_, index) => ({
					...props.entries[0],
					timestamp: String(BigInt(props.entries[0].timestamp) + BigInt(index))
				})),
				onfilter: () => {}
			}
		});
		expect(body.match(/<summary\b/g)).toHaveLength(500);
		expect(body).not.toContain('<button');
		expect(body).not.toContain('<pre');
		expect(body).not.toContain('<h4');
	});

	it('also defers details in advanced mode', async () => {
		const { body } = await render(LogResults, { props });
		expect(body).toContain('Test log');
		expect(body).not.toContain('detected_level');
		expect(body).not.toContain('aria-label="Include ');
		expect(body).not.toContain('aria-label="Exclude ');
	});

	it.each([false, true])('preserves summary ordering with oldestFirst=%s', async (oldestFirst) => {
		const { body } = await render(LogResults, {
			props: {
				...props,
				oldestFirst,
				entries: [
					{ ...props.entries[0], message: 'Newest log' },
					{ ...props.entries[0], message: 'Oldest log', timestamp: '1793360657408654615' }
				]
			}
		});
		expect(body.indexOf('Oldest log') < body.indexOf('Newest log')).toBe(oldestFirst);
	});
});
