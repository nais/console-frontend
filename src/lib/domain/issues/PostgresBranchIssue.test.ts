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
const message = 'Postgres branch "failed-restore" of "database" has reported a failure.';

beforeEach(() => {
	fixture.data = {
		__typename: 'PostgresBranchIssue',
		PostgresBranchIssue: null,
		severity: 'CRITICAL',
		message,
		teamEnvironment: { environment: { name: 'dev-gcp' }, team: { slug: 'nais' } },
		branch: { name: 'failed-restore', postgres: { name: 'database' } }
	};
});

test('renders a named, linked Postgres branch in the issue list during SSR', async () => {
	const { body } = await render(IssueListItem, { props: { item } });
	expect(body).toContain('database / failed-restore');
	expect(body).toContain('href="/team/nais/dev-gcp/postgres/database?branch=failed-restore"');
	expect(body).toContain('Postgres Branch');
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

test('renders a named, linked Postgres branch in the critical issues card during SSR', async () => {
	const { body } = await render(CriticalIssueRow, { props: { issue: item } });
	expect(body).toContain('Postgres branch failure for database / failed-restore in dev-gcp');
	expect(body).toContain('href="/team/nais/dev-gcp/postgres/database?branch=failed-restore"');
	expect(body).toContain('has reported a failure.');
	expect(body).not.toContain('Unknown');
});

test.each([
	['issue list', listArtifact],
	['critical issues', criticalArtifact]
])('selects all Postgres branch fields in the concrete %s fragment for SSR', (_, artifact) => {
	const selection = artifact.selection.abstractFields.fields.PostgresBranchIssue;
	for (const field of ['__typename', 'severity', 'message', 'teamEnvironment', 'branch'] as const) {
		expect(selection[field].visible).toBe(true);
	}
	expect(selection.teamEnvironment.selection.fields.environment.selection.fields.name.visible).toBe(
		true
	);
	expect(selection.teamEnvironment.selection.fields.team.selection.fields.slug.visible).toBe(true);
	expect(selection.branch.selection.fields.name.visible).toBe(true);
	expect(selection.branch.selection.fields.postgres.selection.fields.name.visible).toBe(true);
});
