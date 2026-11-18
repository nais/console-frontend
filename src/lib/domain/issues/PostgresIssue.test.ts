import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import criticalArtifact from '../../../../.houdini/artifacts/CriticalIssueRow';
import listArtifact from '../../../../.houdini/artifacts/IssueFragment';
import IssueListItem from '../list-items/IssueListItem.svelte';
import CriticalIssueRow from './CriticalIssueRow.svelte';

const fixture = vi.hoisted(() => ({ data: {} as Record<string, unknown> }));

vi.mock('$houdini', () => ({
	graphql: () => ({}),
	fragment: () => readable(fixture.data)
}));

const item = { ' $fragments': { IssueFragment: {}, CriticalIssueRow: {} } };
const message = 'Postgres "database" has reported a failure.';

beforeEach(() => {
	fixture.data = {
		__typename: 'PostgresIssue',
		PostgresIssue: null,
		severity: 'CRITICAL',
		message,
		teamEnvironment: { environment: { name: 'dev-gcp' }, team: { slug: 'nais' } },
		postgres: { name: 'database' }
	};
});

test('renders only the logical Postgres database in the issue list during SSR', async () => {
	const { body } = await render(IssueListItem, { props: { item } });
	expect(body).toContain('database');
	expect(body).toContain('href="/team/nais/dev-gcp/postgres/database"');
	expect(body).toContain('Postgres');
	expect(body).not.toContain('Postgres Branch');
	expect(body).not.toContain('database /');
	expect(body).not.toContain('branch=');
	expect(body).toContain('dev-gcp');
	expect(body).toContain('has reported a failure.');
	expect(body).not.toContain('Unknown');
});

test.each([
	['CRITICAL', 'Critical', 'danger'],
	['WARNING', 'Warning', 'warning'],
	['TODO', 'Todo', 'info']
])(
	'labels the %s severity indicator with its semantic tone during SSR',
	async (severity, label, tone) => {
		fixture.data.severity = severity;
		const { body } = await render(IssueListItem, { props: { item } });
		expect(body).toMatch(
			new RegExp(
				`<span\\b[^>]*class="status-indicator ${tone} compact\\b[^"]*"[^>]*role="img"[^>]*aria-label="Severity: ${label}"`
			)
		);
	}
);

test('renders only the logical Postgres database in the critical issues card during SSR', async () => {
	const { body } = await render(CriticalIssueRow, { props: { issue: item } });
	expect(body).toContain('Postgres failure for database in dev-gcp');
	expect(body).toContain('href="/team/nais/dev-gcp/postgres/database"');
	expect(body).not.toContain('database /');
	expect(body).not.toContain('branch=');
	expect(body).toContain('has reported a failure.');
	expect(body).not.toContain('Unknown');
});

test.each([
	['issue list', listArtifact],
	['critical issues', criticalArtifact]
])('selects direct Postgres fields in the concrete %s fragment for SSR', (_, artifact) => {
	const selection = artifact.selection.abstractFields.fields.PostgresIssue;
	for (const field of [
		'__typename',
		'severity',
		'message',
		'teamEnvironment',
		'postgres'
	] as const) {
		expect(selection[field].visible).toBe(true);
	}
	expect(selection.teamEnvironment.selection.fields.environment.selection.fields.name.visible).toBe(
		true
	);
	expect(selection.teamEnvironment.selection.fields.team.selection.fields.slug.visible).toBe(true);
	expect(selection.postgres.selection.fields.name.visible).toBe(true);
	expect(selection).not.toHaveProperty('branch');
});
