<script lang="ts">
	import IssuePills from '$lib/domain/issues/IssuePills.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import ListItem from '$lib/ui/ListItem.svelte';
	import RunningIndicator from '$lib/ui/RunningIndicator.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { countIssuesBySeverity } from '$lib/utils/issueCounts';
	import { Tag, Tooltip } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';

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

	const appHref = $derived(
		`/team/${app.team.slug}/${app.teamEnvironment.environment.name}/app/${app.name}`
	);

	const runningInstances = $derived(
		app.instances.edges.filter((s) => s.node.status.state === 'RUNNING').length
	);
</script>

<ListItem interactive>
	<div class="app-row">
		<div class="name-group">
			{#if app.state === 'RUNNING'}
				<Tooltip content="Application is running">
					<span class="status-indicator">
						<RunningIndicator />
					</span>
				</Tooltip>
			{:else if app.state === 'NOT_RUNNING'}
				<Tooltip content="Application is not running">
					<span class="status-dot not-running"></span>
				</Tooltip>
			{:else}
				<Tooltip content="Unknown status">
					<span class="status-dot unknown"></span>
				</Tooltip>
			{/if}
			<a href={appHref} class="app-name">{app.name}</a>
			<Tag size="xsmall" variant={envTagVariant(app.teamEnvironment.environment.name)}
				>{app.teamEnvironment.environment.name}</Tag
			>
		</div>

		<div class="issues-cell">
			{#if app.issues?.pageInfo.totalCount > 0}
				{@const criticalCount = countIssuesBySeverity(app.issues.edges, 'CRITICAL')}
				{@const warningCount = countIssuesBySeverity(app.issues.edges, 'WARNING')}
				{@const todoCount = countIssuesBySeverity(app.issues.edges, 'TODO')}
				<IssuePills critical={criticalCount} warning={warningCount} todo={todoCount} />
			{/if}
		</div>

		<div class="meta-cell">
			{#if app.deployments.nodes.length > 0}
				{@const timestamp = app.deployments.nodes[0].createdAt}
				<span class="meta-item">
					<RocketIcon style="font-size: 14px" />
					<Time time={timestamp} distance={true} />
				</span>
			{/if}
			<span class="meta-item">
				{#if app.instances.pageInfo.totalCount === 0}
					No instances
				{:else}
					{runningInstances} / {app.instances.pageInfo.totalCount} running
				{/if}
			</span>
		</div>
	</div>
</ListItem>

<style>
	.app-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto auto;
		align-items: center;
		gap: var(--ax-space-16);
		width: 100%;
	}

	.name-group {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		min-width: 0;
	}

	.name-group :global(.aksel-tag) {
		white-space: nowrap;
		flex-shrink: 0;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		flex-shrink: 0;
	}

	.status-dot {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		flex-shrink: 0;
	}

	.status-dot::after {
		content: '';
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	.status-dot.not-running::after {
		background-color: var(--ax-bg-danger-strong);
	}

	.status-dot.unknown::after {
		background-color: var(--ax-text-neutral-decoration);
	}

	.app-name {
		color: var(--ax-text-neutral);
		text-decoration: none;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
		flex: 0 1 auto;
	}

	.app-name:hover {
		text-decoration: underline;
	}

	.issues-cell {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.meta-cell {
		display: flex;
		align-items: center;
		gap: var(--ax-space-12);
		color: var(--ax-text-neutral);
		font-size: var(--ax-font-size-small);
		flex-shrink: 0;
		white-space: nowrap;
	}

	.meta-item {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
	}

	@media (max-width: 767px) {
		.app-row {
			grid-template-columns: 1fr;
			gap: var(--ax-space-8);
		}

		.name-group {
			flex-wrap: wrap;
		}

		.app-name {
			flex: 1 1 0;
			width: auto;
			min-width: 0;
		}

		.issues-cell,
		.meta-cell {
			justify-content: flex-start;
		}
	}
</style>
