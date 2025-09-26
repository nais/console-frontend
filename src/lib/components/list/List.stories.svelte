<script module>
	import { Button } from '@nais/ds-svelte-community';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import List from './List.svelte';

	const { Story } = defineMeta({
		component: List,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import Pagination from '$lib/Pagination.svelte';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import AppInstanceListItem from './AppInstanceListItem.svelte';
	import AppListItem from './AppListItem.svelte';
	import JobRunListItem from './JobRunListItem.svelte';
	import TeamListItem from './TeamListItem.svelte';

	const teams = [
		{
			slug: 'aura',
			purpose: 'Not the Nais platform team any more, check out Nais instead.'
		},
		{
			slug: 'detsombetyrnoe',
			purpose:
				'Rekruttering og profileringssiden for NAV IT - blir liggende på detsombetyrnoe.no. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.'
		},
		{
			slug: 'frontend-golden-path',
			purpose: 'Teste greier for den gyldne sti'
		},
		{
			slug: 'frontendplattform',
			purpose: 'Frontendplattform'
		},
		{
			slug: 'nais',
			purpose: 'The Nais platform team'
		}
	];

	const runs = [
		{
			name: 'slack-teams-notification-28855320',
			startTime: new Date('2022-02-22T09:00:00Z'),
			duration: 1185,
			status: { state: 'RUNNING', message: 'Running' },
			trigger: { type: 'AUTOMATIC', actor: null }
		},
		{
			name: 'fix-nais-api-path',
			startTime: new Date('2022-02-22T09:00:00Z'),
			duration: 1139,
			status: { state: 'SUCCEEDED', message: 'Succeeded' },
			trigger: { type: 'MANUAL', actor: 'Christer Edvartsen' }
		},
		{
			name: 'fix-query',
			startTime: new Date('2022-02-22T09:00:00Z'),
			duration: 686,
			status: { state: 'FAILED', message: 'Job has reached the specified backoff limit' },
			trigger: { type: 'MANUAL', actor: 'Christer Edvartsen' }
		},
		{
			name: 'slack-teams-notification-28943160',
			startTime: new Date('2022-02-22T09:00:00Z'),
			duration: 1048,
			status: { state: 'SUCCEEDED', message: 'Succeeded' },
			trigger: { type: 'AUTOMATIC', actor: null }
		}
	] as const;

	const apps = [
		{
			__typename: 'Application',
			name: 'behovsakkumulator',
			teamEnvironment: { environment: { name: 'prod-fss' } },
			team: { slug: 'tbd' },
			state: 'RUNNING',
			issues: {
				pageInfo: { totalCount: 2 },
				edges: [
					{ node: { severity: 'CRITICAL', message: 'Critical issue', __typename: 'SomeIssue' } },
					{ node: { severity: 'WARNING', message: 'Warning issue', __typename: 'SomeIssue' } }
				]
			},
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:22:24.210001Z') }] },
			instances: {
				pageInfo: { totalCount: 4 },
				edges: [
					{ node: { status: { message: 'Running', state: 'RUNNING' } } },
					{ node: { status: { message: 'Running', state: 'RUNNING' } } },
					{ node: { status: { message: 'Running', state: 'RUNNING' } } },
					{ node: { status: { message: 'Running', state: 'RUNNING' } } }
				]
			}
		},
		{
			__typename: 'Application',

			name: 'behovsakkumulator',
			teamEnvironment: { environment: { name: 'dev-gcp' } },
			team: { slug: 'tbd' },
			state: 'RUNNING',
			issues: {
				pageInfo: { totalCount: 2 },
				edges: [
					{ node: { severity: 'CRITICAL', message: 'Critical issue', __typename: 'SomeIssue' } },
					{ node: { severity: 'WARNING', message: 'Warning issue', __typename: 'SomeIssue' } }
				]
			},
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:22:22.26412Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			__typename: 'Application',
			name: 'dataprodukt-annulleringer',
			teamEnvironment: { environment: { name: 'dev-gcp' } },
			team: { slug: 'tbd' },
			state: 'RUNNING',
			issues: {
				pageInfo: { totalCount: 2 },
				edges: [
					{ node: { severity: 'CRITICAL', message: 'Critical issue', __typename: 'SomeIssue' } },
					{ node: { severity: 'WARNING', message: 'Warning issue', __typename: 'SomeIssue' } }
				]
			},
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:21:26.10995Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			__typename: 'Application',
			name: 'dataprodukt-annulleringer',
			teamEnvironment: { environment: { name: 'prod-fss' } },
			team: { slug: 'tbd' },
			state: 'RUNNING',
			issues: {
				pageInfo: { totalCount: 2 },
				edges: [
					{ node: { severity: 'CRITICAL', message: 'Critical issue', __typename: 'SomeIssue' } },
					{ node: { severity: 'WARNING', message: 'Warning issue', __typename: 'SomeIssue' } }
				]
			},
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:21:20.156954Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			__typename: 'Application',
			name: 'dataprodukt-arbeidsgiveropplysninger',
			teamEnvironment: { environment: { name: 'prod-gcp' } },
			team: { slug: 'tbd' },
			state: 'RUNNING',
			issues: {
				pageInfo: { totalCount: 2 },
				edges: [
					{ node: { severity: 'CRITICAL', message: 'Critical issue', __typename: 'SomeIssue' } },
					{ node: { severity: 'WARNING', message: 'Warning issue', __typename: 'SomeIssue' } }
				]
			},
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:21:31.81996Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			__typename: 'Application',
			name: 'dataprodukt-arbeidsgiveropplysninger',
			teamEnvironment: { environment: { name: 'dev-fss' } },
			team: { slug: 'tbd' },
			state: 'RUNNING',
			issues: {
				pageInfo: { totalCount: 2 },
				edges: [
					{ node: { severity: 'CRITICAL', message: 'Critical issue', __typename: 'SomeIssue' } },
					{ node: { severity: 'WARNING', message: 'Warning issue', __typename: 'SomeIssue' } }
				]
			},
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:21:28.74535Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			__typename: 'Application',
			name: 'dataprodukt-forstegangsbehandling',
			teamEnvironment: { environment: { name: 'dev-fss' } },
			team: { slug: 'tbd' },
			state: 'RUNNING',
			issues: {
				pageInfo: { totalCount: 0 },
				edges: []
			},
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:21:38.095107Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			__typename: 'Application',
			name: 'dataprodukt-forstegangsbehandling',
			teamEnvironment: { environment: { name: 'prod-fss' } },
			team: { slug: 'tbd' },
			state: 'RUNNING',
			issues: {
				pageInfo: { totalCount: 2 },
				edges: [
					{ node: { severity: 'CRITICAL', message: 'Critical issue', __typename: 'SomeIssue' } },
					{ node: { severity: 'WARNING', message: 'Warning issue', __typename: 'SomeIssue' } }
				]
			},
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:21:44.186683Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			__typename: 'Application',
			name: 'helse-spane',
			teamEnvironment: { environment: { name: 'dev-fss' } },
			team: { slug: 'tbd' },
			state: 'RUNNING',
			issues: {
				pageInfo: { totalCount: 2 },
				edges: [
					{ node: { severity: 'CRITICAL', message: 'Critical issue', __typename: 'SomeIssue' } },
					{ node: { severity: 'WARNING', message: 'Warning issue', __typename: 'SomeIssue' } }
				]
			},
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T20:37:08.725562Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			__typename: 'Application',
			name: 'helse-spleis',
			teamEnvironment: { environment: { name: 'dev-gcp' } },
			team: { slug: 'tbd' },
			state: 'RUNNING',
			issues: {
				pageInfo: { totalCount: 0 },
				edges: []
			},
			deployments: { nodes: [{ createdAt: new Date('2025-02-13T14:44:41.989308Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			__typename: 'Application',
			name: 'red-team',
			teamEnvironment: { environment: { name: 'prod-gcp' } },
			team: { slug: 'tbd' },
			state: 'RUNNING',
			issues: {
				pageInfo: { totalCount: 0 },
				edges: []
			},
			deployments: { nodes: [{ createdAt: new Date('2025-02-03T15:12:17.565089Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			__typename: 'Application',
			name: 'risk-mock',
			teamEnvironment: { environment: { name: 'dev-gcp' } },
			team: { slug: 'tbd' },
			state: 'RUNNING',
			issues: {
				pageInfo: { totalCount: 0 },
				edges: []
			},
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T19:32:15.70328Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		}
	];

	const instances = [
		{
			name: 'sparkiv-subsumsjon-77c799fccd-2gmhx',
			restarts: 0,
			status: { state: 'FAILING', message: 'CrashLoopBackOff' },
			created: new Date('2025-02-12T09:59:36Z'),

			cpu: { current: 0.0543 },
			memory: { current: 234 }
		},
		{
			name: 'sparkiv-subsumsjon-77c799fccd-2rdm5',
			restarts: 0,
			status: { state: 'RUNNING', message: 'Running' },
			created: new Date('2025-02-12T09:58:04Z'),

			cpu: { current: 0.0543 },
			memory: { current: 234 }
		},
		{
			name: 'sparkiv-subsumsjon-77c799fccd-4k47z',
			restarts: 0,
			status: { state: 'UNKNOWN', message: 'Unknown' },
			created: new Date('2025-02-12T15:34:13Z'),

			cpu: { current: 0.0543 },
			memory: { current: 234 }
		},
		{
			name: 'sparkiv-subsumsjon-77c799fccd-5qg2r',
			restarts: 0,
			status: { state: 'RUNNING', message: 'Running' },
			created: new Date('2025-02-12T16:23:28Z'),

			cpu: { current: 0.0543 },
			memory: { current: 234 }
		},
		{
			name: 'sparkiv-subsumsjon-77c799fccd-bpxtx',
			restarts: 0,
			status: { state: 'RUNNING', message: 'Running' },
			created: new Date('2025-02-12T15:09:46Z'),

			cpu: { current: 0.0543 },
			memory: { current: 234 }
		},
		{
			name: 'sparkiv-subsumsjon-77c799fccd-fg4c6',
			restarts: 0,
			status: { state: 'RUNNING', message: 'Running' },
			created: new Date('2025-02-12T12:14:10Z'),

			cpu: { current: 0.0543 },
			memory: { current: 234 }
		},
		{
			name: 'sparkiv-subsumsjon-77c799fccd-jnzb4',
			restarts: 0,
			status: { state: 'RUNNING', message: 'Running' },
			created: new Date('2025-02-12T16:06:57Z'),

			cpu: { current: 0.0543 },
			memory: { current: 234 }
		},
		{
			name: 'sparkiv-subsumsjon-77c799fccd-km9p5',
			restarts: 0,
			status: { state: 'RUNNING', message: 'Running' },
			created: new Date('2025-02-12T15:30:13Z'),

			cpu: { current: 0.0543 },
			memory: { current: 234 }
		},
		{
			name: 'sparkiv-subsumsjon-77c799fccd-mfsgp',
			restarts: 0,
			status: { state: 'RUNNING', message: 'Running' },
			created: new Date('2025-02-12T13:35:53Z'),

			cpu: { current: 0.0543 },
			memory: { current: 234 }
		},
		{
			name: 'sparkiv-subsumsjon-77c799fccd-xb4st',
			restarts: 0,
			status: { state: 'RUNNING', message: 'Running' },
			created: new Date('2025-02-12T12:31:14Z'),

			cpu: { current: 0.0543 },
			memory: { current: 234 }
		}
	];
</script>

<Story name="Teams" asChild>
	<List>
		{#each teams as team (team.slug)}
			<TeamListItem {team} />
		{/each}
	</List>
</Story>

<Story name="Job runs" asChild>
	<List title="4 job runs">
		{#each runs as jobRun (jobRun)}
			<JobRunListItem run={jobRun} urlBase="/" />
		{/each}
	</List>
</Story>

<Story name="App instances" asChild>
	<List title="{instances.length} application instances">
		{#each instances as instance (instance)}
			<AppInstanceListItem
				{instance}
				urlBase="/"
				utilization={{
					requested_cpu: 0.32,
					requested_memory: 234
				}}
			/>
		{/each}
	</List>
</Story>

<Story name="Applications" asChild>
	<List title="173 applications">
		{#snippet menu()}
			<ActionMenu>
				{#snippet trigger(props)}
					<Button
						variant="tertiary-neutral"
						size="small"
						iconPosition="right"
						icon={ChevronDownIcon}
						{...props}
					>
						<span style="font-weight: normal">Environment</span>
					</Button>
				{/snippet}
				<ActionMenuCheckboxItem>All environments</ActionMenuCheckboxItem>
			</ActionMenu>
			<ActionMenu>
				{#snippet trigger(props)}
					<Button
						variant="tertiary-neutral"
						size="small"
						iconPosition="right"
						icon={ChevronDownIcon}
						{...props}
					>
						Name
					</Button>
				{/snippet}
				<ActionMenuCheckboxItem>All environments</ActionMenuCheckboxItem>
			</ActionMenu>
		{/snippet}
		{#each apps as app (app)}
			<AppListItem {app} />
		{/each}
	</List>
	<Pagination
		page={{
			hasNextPage: true,
			hasPreviousPage: false,
			pageStart: 1,
			pageEnd: 10,
			totalCount: 173
		}}
		loaders={{
			loadNextPage: () => {},
			loadPreviousPage: () => {}
		}}
	/>
</Story>
