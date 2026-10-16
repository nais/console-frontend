<script lang="ts">
	import IssuePills from '#lib/domain/issues/IssuePills.svelte';
	import { envTagVariant } from '#lib/envTagVariant.js';
	import StatusIndicator from '#lib/ui/StatusIndicator.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { countIssuesBySeverity } from '#lib/utils/issueCounts.js';
	import { Tag, Td, Tr } from '@nais/ds-svelte-community';

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

<Tr>
	<Td>
		<div class="status-cell">
			<StatusIndicator
				label={app.state === 'RUNNING'
					? 'Application is running'
					: app.state === 'NOT_RUNNING'
						? 'Application is not running'
						: 'Unknown status'}
				tone={app.state === 'RUNNING'
					? 'success'
					: app.state === 'NOT_RUNNING'
						? 'danger'
						: 'neutral'}
			/>
		</div>
	</Td>
	<Td>
		<a class="app-name" href={appHref}>{app.name}</a>
	</Td>
	<Td>
		<Tag size="xsmall" variant={envTagVariant(app.teamEnvironment.environment.name)}
			>{app.teamEnvironment.environment.name}</Tag
		>
	</Td>
	<Td>
		{#if app.issues?.pageInfo.totalCount > 0}
			{const criticalCount = $derived(countIssuesBySeverity(app.issues.edges, 'CRITICAL'))}
			{const warningCount = $derived(countIssuesBySeverity(app.issues.edges, 'WARNING'))}
			{const todoCount = $derived(countIssuesBySeverity(app.issues.edges, 'TODO'))}
			<IssuePills critical={criticalCount} warning={warningCount} todo={todoCount} />
		{/if}
	</Td>
	<Td>
		{#if app.deployments.nodes.length > 0}
			{const timestamp = $derived(app.deployments.nodes[0].createdAt)}
			<Time time={timestamp} distance={true} />
		{/if}
	</Td>
	<Td>
		<span class="instances">
			{#if app.instances.pageInfo.totalCount === 0}
				None
			{:else}
				{runningInstances} / {app.instances.pageInfo.totalCount} running
			{/if}
		</span>
	</Td>
</Tr>

<style>
	.instances {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
	}

	.status-cell {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.app-name {
		color: var(--ax-text-neutral);
		text-decoration: none;
		font-weight: var(--ax-font-weight-bold);
		white-space: nowrap;
	}

	.app-name:hover {
		text-decoration: underline;
	}
</style>
