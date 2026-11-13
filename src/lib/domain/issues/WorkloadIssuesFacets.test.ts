import { render } from 'svelte/server';
import { vi } from 'vitest';
import WorkloadIssuesFacets from './WorkloadIssuesFacets.svelte';

// Use the generated enums without loading Houdini's SvelteKit runtime in the SSR test.
vi.mock('$houdini', () => import('../../../../.houdini/graphql/enums'));

test('offers canonical Postgres issue filtering without the compatibility-only branch type', async () => {
	const { body } = await render(WorkloadIssuesFacets, {
		props: {
			selectedSeverity: '',
			selectedIssueType: 'POSTGRES',
			onSeverityChange: () => {},
			onIssueTypeChange: () => {}
		}
	});

	expect(body).toMatch(/checked[^>]*>\s*<span[^>]*>Postgres<\/span>/);
	expect(body).not.toContain('Postgres Branch');
});
