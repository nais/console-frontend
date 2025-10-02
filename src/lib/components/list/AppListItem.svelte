<script lang="ts">
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { Detail, Tag, Tooltip } from '@nais/ds-svelte-community';
	import { CircleFillIcon, RocketIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import IconLabel from '../IconLabel.svelte';
	import RunningIndicator from '../RunningIndicator.svelte';
	import TooltipAlignHack from '../TooltipAlignHack.svelte';
	import ListItem from './ListItem.svelte';

	const {
		app
	}: {
		app: {
			__typename: string | null;
			name: string;
			teamEnvironment: {
				environment: { name: string };
			};
			team: { slug: string };
			state: string;
			deployments: { nodes: { createdAt: Date }[] };
			instances: {
				pageInfo: { totalCount: number };
				edges: { node: { status: { message: string; state: string } } }[];
			};
			issues: {
				pageInfo: { totalCount: number };
				edges: { node: { severity: string } }[];
			};
		};
	} = $props();
</script>

<ListItem>
	<IconLabel
		level="4"
		href="/team/{app.team.slug}/{app.teamEnvironment.environment.name}/app/{app.name}"
		size="large"
		label={app.name}
		tag={{
			label: app.teamEnvironment.environment.name,
			variant: envTagVariant(app.teamEnvironment.environment.name)
		}}
	>
		{#snippet icon()}
			<TooltipAlignHack
				content={{
					RUNNING: 'Application is running',
					NOT_RUNNING: 'Application is not running',
					UNKNOWN: 'Unkown status'
				}[app.state] ?? ''}
			>
				{#if app.state === 'RUNNING'}
					<RunningIndicator />
				{:else if app.state === 'NOT_RUNNING'}
					<CircleFillIcon
						style="width: 24px; color: light-dark(var(--ax-bg-danger-strong), var(--ax-bg-danger-strong)); font-size: 0.7rem"
					/>
				{:else}
					<CircleFillIcon
						style="width: 24px; color: light-dark(var(--ax-text-neutral-decoration), var(--ax-text-neutral-decoration)); font-size: 0.7rem"
					/>
				{/if}
			</TooltipAlignHack>
		{/snippet}
	</IconLabel>

	<div class="right">
		{#if app.deployments.nodes.length > 0}
			{@const timestamp = app.deployments.nodes[0].createdAt}
			<Tooltip
				content="Last deploy - {format(timestamp, 'PPPP', {
					locale: enGB
				})}"
			>
				<IconLabel size="small" icon={RocketIcon}>
					{#snippet label()}
						<Time time={timestamp} distance={true} />
					{/snippet}
				</IconLabel>
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
		{#if app.issues?.pageInfo.totalCount > 0}
			{@const criticalCount = app.issues.edges.filter((e) => e.node.severity === 'CRITICAL').length}
			{@const warningCount = app.issues.edges.filter((e) => e.node.severity === 'WARNING').length}
			{@const todoCount = app.issues.edges.filter((e) => e.node.severity === 'TODO').length}

			<div class="issues-container">
				{#if criticalCount > 0}
					<Tag variant="error" size="xsmall"
						>{criticalCount} critical issue{criticalCount > 1 ? 's' : ''}</Tag
					>
				{/if}
				{#if warningCount > 0}
					<Tag variant="warning" size="xsmall"
						>{warningCount} warning{warningCount > 1 ? 's' : ''}</Tag
					>
				{/if}
				{#if todoCount > 0}
					<Tag variant="info" size="xsmall">{todoCount} todo{todoCount > 1 ? 's' : ''}</Tag>
				{/if}
			</div>
		{/if}
	</div>
</ListItem>

<style>
	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-2);
	}

	.issues-container {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		width: 100%;
		align-items: end;
	}
</style>
