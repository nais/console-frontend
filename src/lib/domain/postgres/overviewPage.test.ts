import { PostgresOverviewStore } from '$houdini';
import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import Overview from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/+page.svelte';

type Configuration = { parameters: { name: string; value: string }[] } | null;
type Branch = {
	id: string;
	name: string;
	state: string;
	configuration?: Configuration;
};

const fixture = vi.hoisted(() => ({ overview: {} }));

vi.mock('$app/paths', () => ({
	resolve: (_route: string, params: { team: string; env: string; postgres: string }) =>
		`/team/${params.team}/${params.env}/postgres/${params.postgres}/branches`
}));
vi.mock('$app/state', () => ({
	page: { params: { team: 'test', env: 'dev', postgres: 'database' } }
}));
vi.mock('$houdini', () => ({
	graphql: () => ({ mutate: vi.fn() }),
	PostgresOverviewStore: class {
		subscribe = readable(fixture.overview).subscribe;
	},
	paginatedFragment: () =>
		readable({ data: { activityLog: { edges: [] } }, pageInfo: { hasNextPage: false } })
}));

async function renderPage({
	configuration = {
		parameters: [
			{ name: 'work_mem', value: '16MB' },
			{ name: 'statement_timeout', value: '30s' }
		]
	},
	activeBranch = { id: 'main', name: 'main', state: 'AVAILABLE', configuration },
	desiredActiveBranch = 'main',
	extensions = [],
	viewerIsMember = false,
	isAdmin = false
}: {
	configuration?: Configuration;
	activeBranch?: Branch | null;
	desiredActiveBranch?: string;
	extensions?: string[];
	viewerIsMember?: boolean;
	isAdmin?: boolean;
} = {}) {
	fixture.overview = {
		errors: null,
		fetching: false,
		data: {
			team: {
				environment: {
					postgres: {
						id: 'database',
						name: 'database',
						activeBranch,
						desiredActiveBranch,
						highAvailability: false,
						majorVersion: '18',
						extensions,
						resources: { cpu: '100m', memory: '512Mi', diskSize: '10Gi' },
						workloads: { nodes: [], pageInfo: { totalCount: 0 } },
						labels: []
					}
				}
			}
		}
	};
	return render(Overview, {
		props: {
			data: {
				teamSlug: 'test',
				viewerIsMember,
				isAdmin,
				PostgresOverview: new PostgresOverviewStore()
			} as ComponentProps<typeof Overview>['data'],
			params: { team: 'test', env: 'dev', postgres: 'database' }
		}
	});
}

function parameterPanel(body: string) {
	const panel = body.match(
		/<div id="([^"]+-panel)" role="region" aria-labelledby="([^"]+)" hidden="">([\s\S]*?)<\/section>/
	);
	expect(panel).not.toBeNull();
	return {
		html: panel![3],
		panelId: panel![1],
		headingId: panel![2]
	};
}

describe('Postgres overview', () => {
	test('renders configured extensions after the Postgres version', async () => {
		const { body } = await renderPage({ extensions: ['pg_stat_statements', 'pgcrypto'] });
		expect(body).toContain('>pg_stat_statements, pgcrypto</code>');
		expect(body.indexOf('Postgres version')).toBeLessThan(body.indexOf('<dt>Extensions</dt>'));
		expect(body.indexOf('<dt>Extensions</dt>')).toBeLessThan(body.indexOf('<dt>CPU</dt>'));
	});

	test('shows None when no extensions are configured', async () => {
		const { body } = await renderPage();
		expect(body).toMatch(/<dt>Extensions<\/dt>\s*<dd>[\s\S]*?None[\s\S]*?<\/dd>/);
	});

	test('escapes extension names', async () => {
		const { body } = await renderPage({ extensions: ['<custom&extension>'] });
		expect(body).toContain('&lt;custom&amp;extension>');
		expect(body).not.toContain('<custom&extension>');
	});

	test('preserves resource configuration with collapsed, labelled PostgreSQL parameters', async () => {
		const { body } = await renderPage();
		expect(body).not.toContain('<h1');
		for (const value of ['Ready', '100m', '512Mi', '10Gi', 'Postgres version', 'Active branch']) {
			expect(body).toContain(value);
		}
		const { html, headingId, panelId } = parameterPanel(body);
		expect(body).toMatch(
			new RegExp(
				`<button[^>]*aria-expanded="false"[^>]*>[\\s\\S]*?<span id="${headingId}">PostgreSQL parameters</span>[\\s\\S]*?</button>`
			)
		);
		expect(body).toContain(`id="${panelId}" role="region" aria-labelledby="${headingId}" hidden`);
		expect(body).toContain('aksel-accordion__content--closed');
		expect(body.match(/PostgreSQL parameters/g)).toHaveLength(1);
		expect(body).not.toContain('aria-expanded="true"');
		expect(html).toMatch(new RegExp(`<table\\b[^>]*aria-labelledby="${headingId}"`));
		const headers = Array.from(
			html.matchAll(/<th\b[^>]*scope="col"[^>]*>([\s\S]*?)<\/th>/g),
			(header) => header[1]
		);
		expect(headers).toHaveLength(2);
		expect(headers[0]).toContain('>Parameter<');
		expect(headers[1]).toContain('>Value<');
		expect(body.indexOf('id="configuration-heading"')).toBeLessThan(
			body.indexOf(`id="${headingId}"`)
		);
	});

	test('shows unavailable parameters while preserving provisioning UI when no branch is active', async () => {
		const { body } = await renderPage({ activeBranch: null });
		expect(body).toContain(
			'Postgres is being created. The main branch will appear when it is ready.'
		);
		expect(body).toContain('Preparing');
		const { html } = parameterPanel(body);
		expect(html).toContain('PostgreSQL parameters are unavailable.');
		expect(html).not.toContain('<table');
		expect(html).not.toContain('<select');
	});

	test('preserves requested activation status without introducing branch selection in parameters', async () => {
		const { body } = await renderPage({ desiredActiveBranch: 'preview' });
		expect(body).toContain('Activation requested');
		expect(body).toContain('preview');
		expect(body).toContain('Preparing');
		expect(body).toContain('<strong>main</strong>');
		const { html } = parameterPanel(body);
		expect(html).toContain('16MB');
		expect(html).not.toContain('preview');
		expect(html).not.toContain('main');
		expect(html).not.toContain('Active branch');
		expect(html).not.toContain('activeBranch');
		expect(html).not.toContain('<select');
	});

	test('renders names and raw values with units in server order', async () => {
		const { body } = await renderPage();
		const { html } = parameterPanel(body);
		for (const value of ['work_mem', '16MB', 'statement_timeout', '30s']) {
			expect(html).toContain(`>${value}</code>`);
		}
		expect(html.indexOf('work_mem')).toBeLessThan(html.indexOf('statement_timeout'));
	});

	test('escapes names and values without interpreting HTML or changing whitespace', async () => {
		const { body } = await renderPage({
			configuration: {
				parameters: [{ name: '<custom&name>', value: '<script>alert(1)</script> &  16MB\n30s' }]
			}
		});
		const { html } = parameterPanel(body);
		expect(html).toContain('&lt;custom&amp;name>');
		expect(html).toContain('&lt;script>alert(1)&lt;/script> &amp;  16MB\n30s');
		expect(html).not.toContain('<script>');
	});

	test.each([null, undefined])('shows unavailable for configuration=%s', async (configuration) => {
		const { body } = await renderPage({
			activeBranch: { id: 'main', name: 'main', state: 'AVAILABLE', configuration }
		});
		const { html } = parameterPanel(body);
		expect(html).toContain('PostgreSQL parameters are unavailable.');
		expect(html).not.toContain('explicitly configured');
		expect(html).not.toContain('<table');
	});

	test('distinguishes an explicitly empty list from unavailable configuration', async () => {
		const { body } = await renderPage({ configuration: { parameters: [] } });
		const { html } = parameterPanel(body);
		expect(html).toContain('No PostgreSQL parameters explicitly configured.');
		expect(html).not.toContain('unavailable');
		expect(html).not.toContain('<table');
	});

	test.each([
		[false, false],
		[true, false],
		[false, true]
	])(
		'is read-only with no branch label or dropdown for member=%s admin=%s',
		async (viewerIsMember, isAdmin) => {
			const { body } = await renderPage({ viewerIsMember, isAdmin });
			const { html } = parameterPanel(body);
			expect(html).toContain('work_mem');
			expect(html).not.toMatch(/<(button|input|select|textarea|form)\b/);
			expect(html).not.toContain('Active branch');
			expect(html).not.toContain('activeBranch');
			expect(html).not.toContain('Load more branches');
		}
	);
});
