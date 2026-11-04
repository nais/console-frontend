import type { DeleteAppPage$result, DeleteJobPage$result } from '$houdini';
import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { readable, writable } from 'svelte/store';
import { describe, expect, it, vi } from 'vitest';
import DeleteApp from '../../../routes/team/[team]/[env]/app/[app]/delete/+page.svelte';
import DeleteJob from '../../../routes/team/[team]/[env]/job/[job]/delete/+page.svelte';
import CreateTeam from '../../../routes/team/create/+page.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/forms', () => ({ enhance: vi.fn() }));
vi.mock('#lib/ui/PageModal.svelte', () => ({ isPossiblyInModal: () => false }));
vi.mock('$houdini', () => ({
	graphql: () => writable({ errors: null })
}));

const resource = {
	id: 'example',
	name: 'example',
	deletionStartedAt: null,
	team: { slug: 'example-team' },
	teamEnvironment: { environment: { name: 'dev-gcp' } },
	sqlInstances: { nodes: [] },
	bigQueryDatasets: { nodes: [] },
	buckets: { nodes: [] }
};

function deletionQuery<T>(data: T) {
	return readable<{ fetching: boolean; data: T | null }>({
		fetching: false,
		data
	});
}

function expectSubmitButton(body: string, label: string) {
	const button = body.match(/<button\b[^>]*type="submit"[^>]*>[\s\S]*?<\/button>/)?.[0];
	expect(button).toBeDefined();
	expect(button).toContain(label);
	expect(button).toContain('disabled');
}

describe('migrated form submit controls', () => {
	it('renders application deletion as a guarded submit button', async () => {
		const data: DeleteAppPage$result = {
			team: { slug: 'example-team', environment: { application: resource } }
		};
		const { body } = await render(DeleteApp, {
			props: {
				params: { team: 'example-team', env: 'dev-gcp', app: 'example' },
				data: { DeleteAppPage: deletionQuery(data) } as ComponentProps<typeof DeleteApp>['data']
			}
		});
		expectSubmitButton(body, 'Delete');
	});

	it('renders job deletion as a guarded submit button', async () => {
		const data: DeleteJobPage$result = {
			team: { slug: 'example-team', environment: { job: resource } }
		};
		const { body } = await render(DeleteJob, {
			props: {
				params: { team: 'example-team', env: 'dev-gcp', job: 'example' },
				data: { DeleteJobPage: deletionQuery(data) } as ComponentProps<typeof DeleteJob>['data']
			}
		});
		expectSubmitButton(body, 'Delete');
	});

	it('renders team creation as a validated submit button', async () => {
		const { body } = await render(CreateTeam, {
			props: { form: null, params: {} } as ComponentProps<typeof CreateTeam>
		});
		expectSubmitButton(body, 'Create team');
	});
});
