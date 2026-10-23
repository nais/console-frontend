import { readFileSync } from 'node:fs';
import { buildSchema, Kind, NoUnusedFragmentsRule, parse, specifiedRules, validate } from 'graphql';
import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import WorkloadDeploy from './WorkloadDeploy.svelte';

const fixture = vi.hoisted(() => ({ data: {} as Record<string, unknown> }));

vi.mock('$houdini', () => ({
	graphql: () => ({}),
	fragment: () => readable(fixture.data),
	DeploymentStatusState: {
		SUCCESS: 'SUCCESS',
		IN_PROGRESS: 'IN_PROGRESS',
		FAILURE: 'FAILURE',
		ERROR: 'ERROR'
	}
}));

const workload = { ' $fragments': { WorkloadDeploy: {} } };
const older = new Date('2026-10-21T12:00:00Z');
const newer = new Date('2026-10-22T12:00:00Z');

function legacyDeployment(createdAt = older, state = 'SUCCESS') {
	return {
		createdAt,
		repository: 'nais/legacy',
		deployerUsername: 'legacy-user',
		triggerUrl: 'https://github.com/nais/legacy/actions/runs/1',
		statuses: { nodes: [{ state }] }
	};
}

function activityEntry(__typename = 'DeploymentActivityLogEntry') {
	return {
		__typename,
		createdAt: newer,
		actor: 'service-account',
		gitHubActorClaims: { actor: 'github-user', repository: 'nais/current', runID: '42' },
		...(__typename === 'DeploymentActivityLogEntry'
			? { data: { triggerURL: 'https://github.com/nais/current/actions/runs/99' } }
			: {})
	};
}

beforeEach(() => {
	fixture.data = {
		__typename: 'Application',
		deployments: { nodes: [] },
		activityLog: { nodes: [] }
	};
});

test.each([
	'DeploymentActivityLogEntry',
	'ApplicationUpdatedActivityLogEntry',
	'JobUpdatedActivityLogEntry'
])('renders activity metadata from %s instead of an older deployment', async (__typename) => {
	fixture.data.__typename = __typename.startsWith('Job') ? 'Job' : 'Application';
	fixture.data.deployments = { nodes: [legacyDeployment()] };
	fixture.data.activityLog = { nodes: [activityEntry(__typename)] };

	const { body } = await render(WorkloadDeploy, { props: { workload } });

	expect(body).toContain('nais/current');
	expect(body).toContain('github-user');
	expect(body).not.toContain('legacy-user');
	expect(body).not.toContain('Unknown');
	expect(body).not.toContain('ds-svelte-tag');
	expect(body).toContain(
		__typename === 'DeploymentActivityLogEntry'
			? 'https://github.com/nais/current/actions/runs/99'
			: 'https://github.com/nais/current/actions/runs/42'
	);
});

test.each([
	['SUCCESS', 'Success'],
	['IN_PROGRESS', 'In progress'],
	['FAILURE', 'Failed'],
	['ERROR', 'Error']
])('preserves the legacy %s status when no activity exists', async (state, label) => {
	fixture.data.deployments = { nodes: [legacyDeployment(older, state)] };
	const { body } = await render(WorkloadDeploy, { props: { workload } });

	expect(body).toContain('nais/legacy');
	expect(body).toContain('legacy-user');
	expect(body).toContain(label);
});

test.each([newer, new Date('2026-10-23T12:00:00Z')])(
	'prefers legacy metadata when it is as new as or newer than the activity (%s)',
	async (createdAt) => {
		fixture.data.deployments = { nodes: [legacyDeployment(createdAt)] };
		fixture.data.activityLog = { nodes: [activityEntry()] };

		const { body } = await render(WorkloadDeploy, { props: { workload } });
		expect(body).toContain('legacy-user');
		expect(body).toContain('Success');
		expect(body).not.toContain('github-user');
	}
);

test('uses the activity actor and trigger URL when GitHub claims are absent', async () => {
	fixture.data.activityLog = {
		nodes: [{ ...activityEntry(), gitHubActorClaims: null }]
	};
	const { body } = await render(WorkloadDeploy, { props: { workload } });

	expect(body).toContain('service-account');
	expect(body).toContain('Deployment workflow');
	expect(body).toContain('https://github.com/nais/current/actions/runs/99');
});

test('renders activity metadata without GitHub claims or a trigger URL', async () => {
	fixture.data.activityLog = {
		nodes: [{ ...activityEntry('ApplicationUpdatedActivityLogEntry'), gitHubActorClaims: null }]
	};
	const { body } = await render(WorkloadDeploy, { props: { workload } });

	expect(body).toContain('service-account');
	expect(body).not.toContain('No deployment metadata');
	expect(body).not.toContain('View workflow on GitHub');
});

test('renders the empty state when neither source has metadata', async () => {
	const { body } = await render(WorkloadDeploy, { props: { workload } });
	expect(body).toContain('No deployment metadata found for workload.');
});

test('selects shared workload and activity metadata with deployment-specific trigger data', () => {
	const source = readFileSync(new URL('./WorkloadDeploy.svelte', import.meta.url), 'utf8');
	const fragmentSource = source.match(/graphql\(\s*`([\s\S]*?)`\s*\)/)?.[1];
	if (!fragmentSource) throw new Error('WorkloadDeploy fragment not found');
	const document = parse(fragmentSource);
	const schema = buildSchema(
		readFileSync(new URL('../../../../schema.graphql', import.meta.url), 'utf8'),
		{ assumeValid: true }
	);
	expect(
		validate(
			schema,
			document,
			specifiedRules.filter((rule) => rule !== NoUnusedFragmentsRule)
		)
	).toEqual([]);

	const definition = document.definitions[0];
	if (definition.kind !== Kind.FRAGMENT_DEFINITION) throw new Error('Expected a fragment');
	expect(definition.typeCondition.name.value).toBe('Workload');
	expect(
		definition.selectionSet.selections
			.filter((node) => node.kind === Kind.FIELD)
			.map((node) => node.name.value)
	).toEqual(expect.arrayContaining(['activityLog', 'deployments']));
	const activityLog = definition.selectionSet.selections.find(
		(node) => node.kind === Kind.FIELD && node.name.value === 'activityLog'
	);
	if (activityLog?.kind !== Kind.FIELD) throw new Error('Missing activityLog selection');
	const nodes = activityLog.selectionSet?.selections.find(
		(node) => node.kind === Kind.FIELD && node.name.value === 'nodes'
	);
	if (nodes?.kind !== Kind.FIELD) throw new Error('Missing activity nodes');
	expect(
		nodes.selectionSet?.selections
			.filter((node) => node.kind === Kind.FIELD)
			.map((node) => node.name.value)
	).toEqual(expect.arrayContaining(['__typename', 'createdAt', 'actor', 'gitHubActorClaims']));

	const claims = nodes.selectionSet?.selections.find(
		(node) => node.kind === Kind.FIELD && node.name.value === 'gitHubActorClaims'
	);
	if (claims?.kind !== Kind.FIELD) throw new Error('Missing GitHub claims');
	expect(
		claims.selectionSet?.selections
			.filter((node) => node.kind === Kind.FIELD)
			.map((node) => node.name.value)
	).toEqual(expect.arrayContaining(['actor', 'repository', 'runID']));

	const deployment = nodes.selectionSet?.selections.find(
		(node) =>
			node.kind === Kind.INLINE_FRAGMENT &&
			node.typeCondition?.name.value === 'DeploymentActivityLogEntry'
	);
	if (deployment?.kind !== Kind.INLINE_FRAGMENT) throw new Error('Missing deployment fragment');
	const data = deployment.selectionSet.selections.find(
		(node) => node.kind === Kind.FIELD && node.name.value === 'data'
	);
	if (data?.kind !== Kind.FIELD) throw new Error('Missing deployment data');
	expect(
		data.selectionSet?.selections
			.filter((node) => node.kind === Kind.FIELD)
			.map((node) => node.name.value)
	).toContain('triggerURL');

	const filter = activityLog.arguments?.find((argument) => argument.name.value === 'filter')?.value;
	if (filter?.kind !== Kind.OBJECT) throw new Error('Missing activity filter');
	const activityTypes = filter.fields.find((field) => field.name.value === 'activityTypes')?.value;
	if (activityTypes?.kind !== Kind.LIST) throw new Error('Missing activity types');
	expect(
		activityTypes.values.filter((value) => value.kind === Kind.ENUM).map((value) => value.value)
	).toEqual(expect.arrayContaining(['DEPLOYMENT', 'APPLICATION_UPDATED', 'JOB_UPDATED']));
});
