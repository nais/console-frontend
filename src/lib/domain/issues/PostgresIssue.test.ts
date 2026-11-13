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
	['CRITICAL', 'Critical'],
	['WARNING', 'Warning'],
	['TODO', 'Todo']
])('labels the %s severity tooltip during SSR', async (severity, label) => {
	fixture.data.severity = severity;
	const { body } = await render(IssueListItem, { props: { item } });
	expect(body).toMatch(new RegExp(`<span class="sr-only">Severity: ${label}</span>`));
});

test.each([
	['WARNING', '--ax-bg-warning-strong'],
	['TODO', '--ax-bg-info-strong']
])('renders a filled %s indicator with its strong semantic colour', async (severity, token) => {
	fixture.data.severity = severity;
	const { body } = await render(IssueListItem, { props: { item } });
	expect(body).toMatch(/<svg\b[^>]*fill="currentColor"[^>]*>/);
	expect(body).toContain(`color: var(${token})`);
	expect(body).not.toContain('light-dark(');
	expect(body).not.toContain('--ax-bg-warning-moderate-pressed');
});

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
