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
	test.each(['Application', 'Job'])(
		'renders one logical database without requiring branches for a %s',
		async (__typename) => {
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
					edges: ['main', 'restore'].map((name) => ({
						cursor: `usage-${name}`,
						node: {
							postgres: { id: 'same-database', name: 'database' }
						}
					}))
				}
			};

			const { body } = await render(Persistence, {
				props: { workload: { ' $fragments': { Persistence: {} } } }
			});

			expect(body).not.toContain('Branch:');
			expect(body.match(/href="\/team\/nais\/dev-gcp\/postgres\/database"/g)).toHaveLength(1);
		}
	);
});
