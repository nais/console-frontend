import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import Persistence from './Persistence.svelte';

const fixture = vi.hoisted(() => ({ data: {} }));

vi.mock('$houdini', () => ({
	graphql: () => ({}),
	fragment: () => readable(fixture.data)
}));

describe('Postgres persistence usages', () => {
	test.each(['Application', 'Job'])('deduplicates database usages for a %s', async (__typename) => {
		fixture.data = {
			__typename,
			name: 'workload',
			team: { slug: 'nais' },
			teamEnvironment: { environment: { name: 'dev-gcp' } },
			buckets: { edges: [] },
			bigQueryDatasets: { edges: [] },
			sqlInstances: { edges: [] },
			kafkaTopicAcls: { edges: [] },
			openSearch: null,
			valkeys: { edges: [] },
			postgreses: {
				edges: ['usage-1', 'usage-2'].map((cursor) => ({
					cursor,
					node: {
						postgres: { id: 'same-database', name: 'database' }
					}
				}))
			}
		};

		const { body } = await render(Persistence, {
			props: { workload: { ' $fragments': { Persistence: {} } } }
		});

		expect(body.match(/href="\/team\/nais\/dev-gcp\/postgres\/database"/g)).toHaveLength(1);
	});
});
