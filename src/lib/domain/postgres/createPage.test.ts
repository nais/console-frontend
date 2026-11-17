import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import CreatePage from '../../../routes/team/[team]/postgres/create/+page.svelte';
import { load } from '../../../routes/team/[team]/postgres/create/+page.js';

const { loadEnvironments, loadOptions, loadSources, loadSource } = vi.hoisted(() => ({
	loadSources: vi.fn(),
	loadSource: vi.fn(),
	loadEnvironments: vi.fn(),
	loadOptions: vi.fn()
}));

vi.mock('$app/forms', () => ({ enhance: () => {} }));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/state', () => ({
	page: { url: new URL('https://console.test/team/test/postgres/create') }
}));
vi.mock('#lib/utils/pageMeta.js', () => ({ addPageMeta: async () => ({}) }));
vi.mock('$houdini', () => ({
	load_CreatePostgresEnvironments: loadEnvironments,
	load_PostgresAvailableValues: loadOptions,
	load_PostgresRecoverySources: loadSources,
	load_PostgresRecoverySource: loadSource
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
	errors = null,
	recovery = false,
	source = null
}: {
	form?: ComponentProps<typeof CreatePage>['form'];
	available?: typeof options | undefined;
	errors?: { message: string }[] | null;
	recovery?: boolean;
	source?: {
		name: string;
		majorVersion: string;
		extensions: string[];
		earliestRestoreTime: Date | null;
	} | null;
} = {}) {
	return render(CreatePage, {
		props: {
			data: {
				selectedEnvironment: 'dev',
				recoveryMode: recovery,
				recoverySource: source ? { data: { team: { environment: { postgres: source } } } } : null,
				recoverySources: {
					data: {
						team: {
							postgreses: {
								nodes: source ? [{ id: 'source', name: source.name }] : [],
								pageInfo: { hasNextPage: true, endCursor: 'next' }
							}
						}
					}
				},
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
				mode: 'empty',
				sourcePostgres: '',
				targetTime: '',
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
			params: { team: 'test' },
			url: new URL('https://console.test/team/test/postgres/create')
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
	test('loads the preset source and paginated sources in the same team/environment', async () => {
		loadEnvironments.mockResolvedValue({
			CreatePostgresEnvironments: readable({ data: { team: { environments } } })
		});
		loadOptions.mockResolvedValue({ PostgresAvailableValues: readable({ data: null }) });
		loadSources.mockResolvedValue({ PostgresRecoverySources: readable({ data: null }) });
		loadSource.mockResolvedValue({ PostgresRecoverySource: readable({ data: null }) });
		const result = await load({
			parent: async () => ({ viewerIsMember: true }),
			params: { team: 'test' },
			url: new URL(
				'https://console.test/team/test/postgres/create?mode=recovery&environment=prod&source=original&after=cursor'
			)
		} as Parameters<typeof load>[0]);
		expect(result.recoveryMode).toBe(true);
		expect(result.selectedEnvironment).toBe('prod');
		expect(loadSources).toHaveBeenCalledWith(
			expect.objectContaining({ variables: { team: 'test', env: 'prod', after: 'cursor' } })
		);
		expect(loadSource).toHaveBeenCalledWith(
			expect.objectContaining({ variables: { team: 'test', env: 'prod', name: 'original' } })
		);
	});
});

describe('shared recovery creation flow', () => {
	test('offers empty and recovery modes from the normal create entry point', async () => {
		const { body } = await renderPage();
		expect(body).toContain('Empty database');
		expect(body).toContain('Restore from an existing database');
	});
	test('renders preset source with locked inherited configuration and explicit UTC time', async () => {
		const { body } = await renderPage({
			recovery: true,
			source: {
				name: 'original',
				majorVersion: '17',
				extensions: ['vector'],
				earliestRestoreTime: new Date('2026-01-01T12:00:01Z')
			}
		});
		expect(body).toMatch(/<option[^>]*value="original"[^>]*selected/);
		expect(body).toContain('Target time (UTC)');
		expect(body).toContain('min="2026-01-01T12:01"');
		expect(body).not.toContain('name="extensions"');
		expect(body).not.toContain('name="diskSize"');
		expect(body).toContain('No applications are automatically moved');
		expect(body).toContain('restoration can fail');
		expect(body).toContain('More sources');
	});
	test('disables restoration when the recovery window is unavailable', async () => {
		const { body } = await renderPage({
			recovery: true,
			source: { name: 'original', majorVersion: '17', extensions: [], earliestRestoreTime: null }
		});
		expect(body).toContain('no available recovery window');
		expect(body).toMatch(/<button(?=[^>]*type="submit")(?=[^>]*disabled)[^>]*>/);
	});
});
