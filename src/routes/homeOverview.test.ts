import { readFileSync } from 'node:fs';
import { buildSchema, isInterfaceType, Kind, parse, validate, visit } from 'graphql';
import attentionArtifact from '../../.houdini/artifacts/HomeAttention';
import activityArtifact from '../../.houdini/artifacts/HomeActivity';
import {
	filterHomeTeams,
	homeActivityHref,
	homeIssueResource,
	type HomeActivityEntry,
	type HomeIssue
} from './homeOverview';

const schema = buildSchema(readFileSync(new URL('../../schema.graphql', import.meta.url), 'utf8'), {
	assumeValid: true
});

describe('home queries', () => {
	test.each(['homeAttention.gql', 'homeActivity.gql', 'homeTeamSummaries.gql', 'query.gql'])(
		'%s validates against the current schema',
		(file) => {
			const document = visit(parse(readFileSync(new URL(file, import.meta.url), 'utf8')), {
				Directive(node) {
					if (node.name.value === 'paginate') return null;
				}
			});
			expect(validate(schema, document)).toEqual([]);
		}
	);

	test.each([
		['homeAttention.gql', 'issues', 'Issue', ['id', 'message', 'teamEnvironment']],
		[
			'homeActivity.gql',
			'activityLog',
			'ActivityLogEntry',
			[
				'id',
				'message',
				'createdAt',
				'actor',
				'environmentName',
				'resourceName',
				'resourceType',
				'teamSlug'
			]
		]
	] as const)(
		'selects complete concrete %s nodes for SSR',
		(file, fieldName, interfaceName, fields) => {
			const document = parse(readFileSync(new URL(file, import.meta.url), 'utf8'));
			const operation = document.definitions[0];
			if (operation.kind !== Kind.OPERATION_DEFINITION) throw new Error('Missing query');
			const connection = operation.selectionSet.selections.find(
				(field) => field.kind === Kind.FIELD && field.name.value === fieldName
			);
			if (connection?.kind !== Kind.FIELD) throw new Error('Missing connection');
			const nodes = connection.selectionSet?.selections.find(
				(field) => field.kind === Kind.FIELD && field.name.value === 'nodes'
			);
			if (nodes?.kind !== Kind.FIELD) throw new Error('Missing nodes');
			const interfaceType = schema.getType(interfaceName);
			if (!interfaceType || !isInterfaceType(interfaceType)) throw new Error('Missing interface');
			for (const type of schema.getPossibleTypes(interfaceType)) {
				const concrete = nodes.selectionSet?.selections.find(
					(field) =>
						field.kind === Kind.INLINE_FRAGMENT && field.typeCondition?.name.value === type.name
				);
				if (concrete?.kind !== Kind.INLINE_FRAGMENT) throw new Error(`Missing ${type.name}`);
				expect(
					concrete.selectionSet.selections
						.filter((field) => field.kind === Kind.FIELD)
						.map((field) => field.name.value)
				).toEqual(expect.arrayContaining([...fields]));
			}
		}
	);

	test('keeps cross-team feeds bounded and membership-scoped independently of team pagination', () => {
		expect(attentionArtifact.raw).toContain('first: 5');
		expect(attentionArtifact.raw).toContain('severity: CRITICAL');
		expect(activityArtifact.raw).toContain('first: 8');
		expect(activityArtifact.raw).toContain('from: $from');
		for (const artifact of [attentionArtifact, activityArtifact]) {
			expect(artifact.raw).toContain('memberOfViewer: true');
			expect(artifact.raw).not.toContain('teamSlugs');
			expect(artifact.raw).not.toMatch(/\bdeployments\s*\(/);
		}
		expect(activityArtifact.raw).toContain('... on DeploymentActivityLogEntry');
	});

	test('filters critical issues without selecting unused severity results', () => {
		const document = parse(readFileSync(new URL('homeAttention.gql', import.meta.url), 'utf8'));
		const severities: string[] = [];
		visit(document, {
			Field(node) {
				if (node.name.value === 'severity') severities.push(node.name.value);
			}
		});
		expect(severities).toEqual([]);
		expect(attentionArtifact.raw).toContain('severity: CRITICAL');
	});

	test('requests backend issue totals with the API’s minimum page size, not issue nodes', () => {
		const source = readFileSync(new URL('homeTeamSummaries.gql', import.meta.url), 'utf8');
		expect(source).toContain('criticalIssues: issues(first: 1, filter: { severity: CRITICAL })');
		expect(source).toContain('issues(first: 1)');
		expect(source).not.toContain('first: 0');
		const operation = parse(source).definitions[0];
		if (operation.kind !== Kind.OPERATION_DEFINITION) throw new Error('Missing query');
		const teams = operation.selectionSet.selections[0];
		if (teams.kind !== Kind.FIELD) throw new Error('Missing teams');
		const nodes = teams.selectionSet?.selections[0];
		if (nodes?.kind !== Kind.FIELD) throw new Error('Missing team nodes');
		for (const issueConnection of nodes.selectionSet?.selections.filter(
			(field) => field.kind === Kind.FIELD && field.name.value === 'issues'
		) ?? []) {
			if (issueConnection.kind !== Kind.FIELD) throw new Error('Missing issue connection');
			expect(
				issueConnection.selectionSet?.selections.map((field) =>
					field.kind === Kind.FIELD ? field.name.value : null
				)
			).toEqual(['pageInfo']);
		}
	});

	test.each(['Application', 'Job'] as const)(
		'generates visible %s workload fields for SSR',
		(type) => {
			const workload =
				attentionArtifact.selection.fields.issues.selection.fields.nodes.selection.abstractFields
					.fields.ExternalIngressUrgentVulnerabilityIssue.workload.selection;
			expect(workload.abstractFields.fields[type].name.visible).toBe(true);
			expect(workload.abstractFields.fields[type].__typename.visible).toBe(true);
		}
	);
});

describe('home navigation and search', () => {
	const context = { team: { slug: 'my-team' }, environment: { name: 'prod-gcp' } };
	test.each(['Application', 'Job'] as const)('links %s issues directly to the workload', (type) => {
		const issue: HomeIssue = {
			__typename: 'NoRunningInstancesIssue',
			id: 'issue',
			message: 'Not running',
			teamEnvironment: context,
			workload: { __typename: type, name: 'workload' }
		};
		expect(homeIssueResource(issue).href).toBe(
			`/team/my-team/prod-gcp/${type === 'Application' ? 'app' : 'job'}/workload`
		);
	});

	test('links Postgres branch issues to the branch overview', () => {
		expect(
			homeIssueResource({
				__typename: 'PostgresBranchIssue',
				id: 'issue',
				message: 'Branch failed',
				teamEnvironment: context,
				branch: { name: 'main', postgres: { name: 'database' } }
			})
		).toEqual({
			name: 'database / main',
			href: '/team/my-team/prod-gcp/postgres/database/branches'
		});
	});

	test('handles nullable activity team slugs and encodes entry identifiers', () => {
		const entry: HomeActivityEntry = {
			__typename: 'TunnelCreatedActivityLogEntry',
			id: 'entry/with+symbols',
			createdAt: new Date(),
			actor: 'operator',
			message: 'Tunnel created',
			environmentName: 'prod-gcp',
			resourceName: 'tunnel',
			resourceType: 'TUNNEL',
			optionalTeamSlug: 'my-team'
		};
		const url = new URL(homeActivityHref(entry), 'https://console.example.com');
		expect(url.pathname).toBe('/team/my-team/activity-log');
		expect(url.searchParams.get('id')).toBe(entry.id);
		expect(url.searchParams.get('environments')).toBe('prod-gcp');
	});

	test('filters only the supplied page by slug and purpose, ignoring case and outer whitespace', () => {
		const teams = [
			{ slug: 'my-team', purpose: null },
			{ slug: 'other-team', purpose: 'Payments' }
		];
		expect(filterHomeTeams(teams, ' MY-TEAM ')).toEqual([teams[0]]);
		expect(filterHomeTeams(teams, ' payMENTS ')).toEqual([teams[1]]);
		expect(filterHomeTeams(teams, '   ')).toEqual(teams);
		expect(filterHomeTeams(teams, 'absent')).toEqual([]);
	});
});
