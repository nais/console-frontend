<script lang="ts">
	import IssuePills from '#lib/domain/issues/IssuePills.svelte';
	import { Badge, Td, Tr } from '#lib/shadcn/ui/index.js';
	import StatusIndicator from '#lib/ui/StatusIndicator.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { countIssuesBySeverity } from '#lib/utils/issueCounts.js';

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
			activityLog: { nodes: { createdAt: Date }[] };
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

	const totalInstances = $derived(app.instances.pageInfo.totalCount);
	const isProd = $derived(app.teamEnvironment.environment.name.startsWith('prod'));
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
		<Badge variant={isProd ? 'env-prod' : 'env-dev'} size="sm" mono>
			{app.teamEnvironment.environment.name}
		</Badge>
	</Td>
	<Td>
		{#if app.issues?.pageInfo.totalCount > 0}
			{const criticalCount = $derived(countIssuesBySeverity(app.issues.edges, 'CRITICAL'))}
			{const warningCount = $derived(countIssuesBySeverity(app.issues.edges, 'WARNING'))}
			{const todoCount = $derived(countIssuesBySeverity(app.issues.edges, 'TODO'))}
			<IssuePills critical={criticalCount} warning={warningCount} todo={todoCount} />
		{:else}
			<span class="healthy-text">Healthy</span>
		{/if}
	</Td>
	<Td>
		{#if app.activityLog.nodes.length > 0}
			{const timestamp = $derived(app.activityLog.nodes[0].createdAt)}
			<span class="table-meta">
				<Time time={timestamp} distance={true} />
			</span>
		{:else}
			<span class="table-meta">—</span>
		{/if}
	</Td>
	<Td>
		<div class="instances-cell">
			{#if totalInstances === 0}
				<span class="table-meta">0 instances</span>
			{:else}
				<span class="instances-text">{runningInstances} / {totalInstances} running</span>
				<div class="instances-bar" aria-hidden="true">
					<div
						class="instances-fill"
						class:all-running={runningInstances === totalInstances}
						class:none-running={runningInstances === 0}
						style="width: {Math.min(100, (runningInstances / totalInstances) * 100)}%"
					></div>
				</div>
			{/if}
		</div>
	</Td>
</Tr>

<style>
	.status-cell {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.app-name {
		color: var(--foreground);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.875rem;
		white-space: nowrap;
		transition: color 120ms ease;
	}

	.app-name:hover {
		color: var(--primary);
	}

	.healthy-text {
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}

	.instances-cell {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 110px;
	}

	.instances-text {
		font-size: 0.75rem;
		color: var(--muted-foreground);
		font-variant-numeric: tabular-nums;
	}

	.instances-bar {
		height: 4px;
		width: 100%;
		max-width: 96px;
		background-color: var(--secondary);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.instances-fill {
		height: 100%;
		border-radius: var(--radius-full);
		background-color: var(--warning);
		transition: width 200ms ease;
	}

	.instances-fill.all-running {
		background-color: var(--success);
	}

	.instances-fill.none-running {
		background-color: var(--destructive);
	}
</style>
