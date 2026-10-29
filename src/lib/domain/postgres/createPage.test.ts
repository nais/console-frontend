import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import CreatePage from '../../../routes/team/[team]/postgres/create/+page.svelte';
import { load } from '../../../routes/team/[team]/postgres/create/+page.js';

const { loadEnvironments, loadOptions } = vi.hoisted(() => ({
	loadEnvironments: vi.fn(),
	loadOptions: vi.fn()
}));

vi.mock('$app/forms', () => ({ enhance: () => {} }));
vi.mock('#lib/utils/pageMeta.js', () => ({ addPageMeta: async () => ({}) }));
vi.mock('$houdini', () => ({
	load_CreatePostgresEnvironments: loadEnvironments,
	load_PostgresAvailableValues: loadOptions
}));

const environments = [
	{ environment: { name: 'dev' }, gcpProjectID: 'dev-project' },
	{ environment: { name: 'prod' }, gcpProjectID: 'prod-project' },
	{ environment: { name: 'onprem' }, gcpProjectID: null }
];
const options = {
	postgresMajorVersions: { values: ['17', '18'], defaultValues: ['17'] },
	postgresExtensions: { values: ['pgcrypto', 'vector'], defaultValues: ['pgcrypto'] }
};

async function renderPage({
	form = null,
	available = options,
	errors = null
}: {
	form?: ComponentProps<typeof CreatePage>['form'];
	available?: typeof options | undefined;
	errors?: { message: string }[] | null;
} = {}) {
	return render(CreatePage, {
		props: {
			data: {
				teamSlug: 'test',
				CreatePostgresEnvironments: readable({ data: { team: { environments } }, errors: null }),
				postgresOptions: environments.slice(0, 2).map(({ environment }) => ({
					environment: environment.name,
					options: available,
					errors
				}))
			} as ComponentProps<typeof CreatePage>['data'],
			form,
			params: { team: 'test' }
		}
	});
}

describe('Postgres creation page', () => {
	test('renders environment versions and defaults rather than a hardcoded version', async () => {
		const { body } = await renderPage();
		expect(body).toMatch(/<option[^>]*value="17"[^>]*selected/);
		expect(body).toContain('value="18"');
		expect(body).toMatch(/<input(?=[^>]*value="pgcrypto")(?=[^>]*checked)[^>]*>/);
		expect(body).not.toContain('value="onprem"');
	});

	test('retains the submitted environment, version and an explicitly empty extension selection', async () => {
		const { body } = await renderPage({
			form: {
				name: 'database',
				environment: 'prod',
				majorVersion: '18',
				extensions: [],
				cpu: '9',
				memory: '',
				diskSize: '',
				highAvailability: false,
				labelRows: [],
				errors: { cpu: 'Invalid CPU' },
				error: 'Check the resource fields below.'
			}
		});
		expect(body).toMatch(/<option[^>]*value="prod"[^>]*selected/);
		expect(body).toMatch(/<option[^>]*value="18"[^>]*selected/);
		expect(body).not.toMatch(/<input(?=[^>]*name="extensions")(?=[^>]*checked)[^>]*>/);
	});

	test('requires an explicit version choice when the environment declares no default', async () => {
		const { body } = await renderPage({
			available: { ...options, postgresMajorVersions: { values: ['16', '17'], defaultValues: [] } }
		});
		expect(body).toMatch(/<option[^>]*value=""[^>]*selected/);
		expect(body).not.toContain('value="18"');
	});

	test('shows option errors and disables submission instead of presenting an empty list', async () => {
		const { body } = await renderPage({ errors: [{ message: 'Options unavailable.' }] });
		expect(body).toContain('Options unavailable.');
		expect(body).not.toContain('No extensions are available');
		expect(body).toMatch(/<button(?=[^>]*type="submit")(?=[^>]*disabled)[^>]*>/);
	});
});

describe('Postgres creation loading', () => {
	test('loads options only for GCP environments and preserves per-environment errors', async () => {
		loadEnvironments.mockResolvedValue({
			CreatePostgresEnvironments: readable({ data: { team: { environments } } })
		});
		loadOptions.mockImplementation(async ({ variables }: { variables: { env: string } }) => ({
			PostgresAvailableValues: readable(
				variables.env === 'dev'
					? {
							data: { team: { environment: { environment: { availableValues: options } } } },
							errors: null
						}
					: {
							data: null,
							errors: [{ message: 'Prod options unavailable.' }]
						}
			)
		}));
		const data = await load({
			parent: async () => ({ viewerIsMember: true }),
			params: { team: 'test' }
		} as Parameters<typeof load>[0]);
		expect(loadOptions).toHaveBeenCalledTimes(2);
		expect(loadOptions).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: { team: 'test', env: 'dev' }
			})
		);
		expect(loadOptions).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: { team: 'test', env: 'prod' }
			})
		);
		expect(data.postgresOptions).toEqual([
			{ environment: 'dev', options, errors: null },
			{
				environment: 'prod',
				options: undefined,
				errors: [{ message: 'Prod options unavailable.' }]
			}
		]);
	});
});
