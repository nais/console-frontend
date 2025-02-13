<script module>
	import { Button, Detail, Heading, Link, Loader, Tooltip } from '@nais/ds-svelte-community';
	import {
		CheckmarkCircleFillIcon,
		ChevronDownIcon,
		CircleFillIcon,
		PersonGroupIcon,
		QuestionmarkIcon,
		RocketIcon,
		TimerIcon,
		XMarkOctagonFillIcon
	} from '@nais/ds-svelte-community/icons';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import IconWithText from './IconWithText.svelte';
	import List from './List.svelte';
	import Time from '$lib/Time.svelte';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';

	const { Story } = defineMeta({
		component: List,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import Pagination from '$lib/Pagination.svelte';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental.js';

	const teams = [
		{
			slug: 'aura',
			purpose: 'Not the Nais platform team any more, check out Nais instead.'
		},
		{
			slug: 'detsombetyrnoe',
			purpose: 'Rekruttering og profileringssiden for NAV IT - blir liggende på detsombetyrnoe.no'
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
			trigger: { type: 'AUTOMATIC' }
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
			trigger: { type: 'AUTOMATIC' }
		}
	];

	const formatDuration = (duration: number) => {
		const minute = 60;
		const hour = 60 * minute;

		const hours = Math.floor(duration / hour);
		const minutes = Math.floor((duration % hour) / minute);
		const seconds = Math.floor(duration % minute);

		if (hours > 0) {
			return `${hours}h ${minutes}m ${seconds}s`;
		} else if (minutes > 0) {
			return `${minutes}m ${seconds}s`;
		} else {
			return `${seconds}s`;
		}
	};

	const apps = [
		{
			name: 'behovsakkumulator',
			environment: { name: 'prod-gcp' },
			team: { slug: 'tbd' },
			status: { state: 'NAIS' },
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
			name: 'behovsakkumulator',
			environment: { name: 'dev-gcp' },
			team: { slug: 'tbd' },
			status: { state: 'FAILING' },
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:22:22.26412Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			name: 'dataprodukt-annulleringer',
			environment: { name: 'dev-gcp' },
			team: { slug: 'tbd' },
			status: { state: 'NOT_NAIS' },
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:21:26.10995Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			name: 'dataprodukt-annulleringer',
			environment: { name: 'prod-gcp' },
			team: { slug: 'tbd' },
			status: { state: 'UNKNOWN' },
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:21:20.156954Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			name: 'dataprodukt-arbeidsgiveropplysninger',
			environment: { name: 'prod-gcp' },
			team: { slug: 'tbd' },
			status: { state: 'NAIS' },
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:21:31.81996Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			name: 'dataprodukt-arbeidsgiveropplysninger',
			environment: { name: 'dev-gcp' },
			team: { slug: 'tbd' },
			status: { state: 'NAIS' },
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:21:28.74535Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			name: 'dataprodukt-forstegangsbehandling',
			environment: { name: 'dev-gcp' },
			team: { slug: 'tbd' },
			status: { state: 'NAIS' },
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:21:38.095107Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			name: 'dataprodukt-forstegangsbehandling',
			environment: { name: 'prod-gcp' },
			team: { slug: 'tbd' },
			status: { state: 'NAIS' },
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T12:21:44.186683Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			name: 'helse-spane',
			environment: { name: 'dev-gcp' },
			team: { slug: 'tbd' },
			status: { state: 'NAIS' },
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T20:37:08.725562Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			name: 'helse-spleis',
			environment: { name: 'dev-gcp' },
			team: { slug: 'tbd' },
			status: { state: 'NAIS' },
			deployments: { nodes: [{ createdAt: new Date('2025-02-13T14:44:41.989308Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			name: 'red-team',
			environment: { name: 'prod-gcp' },
			team: { slug: 'tbd' },
			status: { state: 'NAIS' },
			deployments: { nodes: [{ createdAt: new Date('2025-02-03T15:12:17.565089Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		},
		{
			name: 'risk-mock',
			environment: { name: 'dev-gcp' },
			team: { slug: 'tbd' },
			status: { state: 'NAIS' },
			deployments: { nodes: [{ createdAt: new Date('2025-01-27T19:32:15.70328Z') }] },
			instances: {
				pageInfo: { totalCount: 1 },
				edges: [{ node: { status: { message: 'Running', state: 'RUNNING' } } }]
			}
		}
	];
</script>

<Story name="Teams">
	<List>
		{#each teams as team}
			<div>
				<IconWithText size="large" icon={PersonGroupIcon} description={team.purpose}>
					{#snippet text()}
						<Heading level="4" size="xsmall">
							<Link href="#">{team.slug}</Link>
						</Heading>
					{/snippet}
				</IconWithText>
			</div>
		{/each}
	</List>
</Story>

<Story name="Job runs">
	<List title="4 job runs">
		{#each runs as run}
			<div>
				<IconWithText size="large">
					{#snippet description()}
						<Detail>
							{#if run.trigger.type === 'MANUAL'}
								Manually triggered
							{:else}
								Automatically triggered
							{/if}
							{#if run.startTime}
								<Time time={run.startTime} distance={true} />
							{/if}
							{#if run.trigger.actor}
								by {run.trigger.actor}.
							{:else}
								by cron schedule.
							{/if}
						</Detail>
					{/snippet}
					{#snippet icon()}
						{#if run.status.state === 'RUNNING'}
							<Tooltip content="Job is running">
								<Loader size="small" variant="interaction" />
							</Tooltip>
						{:else if run.status.state === 'PENDING'}
							<Tooltip content="Job run pending">
								<Loader size="small" variant="interaction" />
							</Tooltip>
						{:else if run.status.state === 'SUCCEEDED'}
							<Tooltip content="Job ran successfully">
								<CheckmarkCircleFillIcon style="color: var(--a-icon-success)" />
							</Tooltip>
						{:else if run.status.state === 'FAILED'}
							<Tooltip content="Job run failed">
								<XMarkOctagonFillIcon style="color: var(--a-icon-danger)" />
							</Tooltip>
						{:else}
							<Tooltip content="Job run status is unknown">
								<QuestionmarkIcon />
							</Tooltip>
						{/if}
					{/snippet}
					{#snippet text()}
						<Heading level="4" size="xsmall">
							<Link href="#">slack-teams-notification-28855320</Link>
						</Heading>
					{/snippet}
				</IconWithText>
				<div style="display: flex; flex-direction: column; align-items: end">
					<IconWithText size="small" text={formatDuration(run.duration)} icon={TimerIcon} />
					<Detail>{run.status.message}</Detail>
				</div>
			</div>
		{/each}
	</List>
</Story>

<Story name="Applications">
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
		{/snippet}
		{#each apps as app}
			<div>
				<IconWithText size="large" description={app.environment.name}>
					{#snippet icon()}
						<Tooltip
							content={{
								NAIS: 'Application is Nais',
								FAILING: 'Application is failing',
								NOT_NAIS: 'Application is not Nais',
								UNKNOWN: 'Application status is unknown'
							}[app.status.state] ?? ''}
						>
							<CircleFillIcon
								style="color: var(--a-icon-{{
									NAIS: 'success',
									FAILING: 'danger',
									NOT_NAIS: 'warning',
									UNKNOWN: 'info'
								}[app.status.state] ?? 'info'}); font-size: 0.5rem"
							/>
						</Tooltip>
					{/snippet}
					{#snippet text()}
						<Heading level="4" size="xsmall">
							<Link href="#">{app.name}</Link>
						</Heading>
					{/snippet}
				</IconWithText>
				<div style="display: flex; flex-direction: column; align-items: end;">
					{#if app.deployments.nodes.length > 0}
						{@const timestamp = app.deployments.nodes[0].createdAt}
						<Tooltip
							content="Last deploy - {format(timestamp, 'PPPP', {
								locale: enGB
							})}"
						>
							<IconWithText size="small" icon={RocketIcon}>
								{#snippet text()}
									<Time time={timestamp} distance={true} />
								{/snippet}
							</IconWithText>
						</Tooltip>
					{/if}
					<Detail>
						{#if app.instances.pageInfo.totalCount === 0}
							No instances
						{:else}
							{app.instances.edges.filter((s) => s.node.status.state === 'RUNNING').length} / {app
								.instances.pageInfo.totalCount} running
						{/if}
					</Detail>
				</div>
			</div>
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
