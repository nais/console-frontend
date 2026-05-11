<script lang="ts">
	import { JobState, type JobRunState$options } from '$houdini';
	import IssuePills from '$lib/domain/issues/IssuePills.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import ErrorIcon from '$lib/icons/ErrorIcon.svelte';
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import ListItemV2 from '$lib/ui/ListItemV2.svelte';
	import RunningIndicator from '$lib/ui/RunningIndicator.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { countIssuesBySeverity } from '$lib/utils/issueCounts';
	import { Loader, Tag, Tooltip } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';

	const {
		job
	}: {
		job: {
			__typename: string | null;
			name: string;
			teamEnvironment: { environment: { name: string } };
			team: { slug: string };
			state: string;
			schedule: {
				expression: string;
				timeZone: string;
			} | null;
			issues: {
				pageInfo: { totalCount: number };
				edges: { node: { severity: string } }[];
			};
			deployments: { nodes: { createdAt: Date }[] };
			runs: {
				pageInfo: { totalCount: number };
				edges: {
					node: { startTime: Date | null; status: { message: string; state: JobRunState$options } };
				}[];
			};
		};
	} = $props();

	const jobHref = $derived(
		`/team/${job.team.slug}/${job.teamEnvironment.environment.name}/job/${job.name}`
	);

	const lastRun = $derived(job.runs.edges.length ? job.runs.edges[0].node : null);
</script>

<ListItemV2 interactive>
	<div class="job-row">
		<div class="name-group">
			{#if job.state === JobState.RUNNING}
				<Tooltip content="Job is running">
					<span class="status-indicator">
						<RunningIndicator />
					</span>
				</Tooltip>
			{:else if job.state === JobState.COMPLETED}
				<Tooltip content="Job completed">
					<span class="status-dot completed"></span>
				</Tooltip>
			{:else if job.state === JobState.FAILED}
				<Tooltip content="Job failed">
					<span class="status-dot failed"></span>
				</Tooltip>
			{:else}
				<Tooltip content="Unknown status">
					<span class="status-dot unknown"></span>
				</Tooltip>
			{/if}
			<a href={jobHref} class="job-name">{job.name}</a>
			<Tag size="xsmall" variant={envTagVariant(job.teamEnvironment.environment.name)}
				>{job.teamEnvironment.environment.name}</Tag
			>
		</div>

		<div class="issues-cell">
			{#if job.issues?.pageInfo.totalCount > 0}
				{@const criticalCount = countIssuesBySeverity(job.issues.edges, 'CRITICAL')}
				{@const warningCount = countIssuesBySeverity(job.issues.edges, 'WARNING')}
				{@const todoCount = countIssuesBySeverity(job.issues.edges, 'TODO')}
				<IssuePills critical={criticalCount} warning={warningCount} todo={todoCount} />
			{/if}
		</div>

		<div class="meta-cell">
			{#if lastRun}
				<span class="meta-item run-status">
					{#if lastRun.status.state === 'RUNNING' || lastRun.status.state === 'PENDING'}
						<Loader size="xsmall" variant="interaction" />
					{:else if lastRun.status.state === 'SUCCEEDED'}
						<SuccessIcon />
					{:else if lastRun.status.state === 'FAILED'}
						<ErrorIcon />
					{/if}
					{#if lastRun.startTime}
						<Time time={lastRun.startTime} distance={true} />
					{/if}
				</span>
			{/if}
			{#if job.deployments.nodes.length > 0}
				{@const timestamp = job.deployments.nodes[0].createdAt}
				<Tooltip content="Last deploy \u2014 {format(timestamp, 'PPPP', { locale: enGB })}">
					<span class="meta-item">
						<RocketIcon style="font-size: 14px" />
						<Time time={timestamp} distance={true} />
					</span>
				</Tooltip>
			{/if}
		</div>
	</div>
</ListItemV2>

<style>
	.job-row {
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

	.status-dot.completed::after {
		background-color: var(--ax-bg-success-strong);
	}

	.status-dot.failed::after {
		background-color: var(--ax-bg-danger-strong);
	}

	.status-dot.unknown::after {
		background-color: var(--ax-text-neutral-decoration);
	}

	.job-name {
		color: var(--ax-text-neutral);
		text-decoration: none;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
		flex: 0 1 auto;
	}

	.job-name:hover {
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

	.run-status :global(svg) {
		width: 16px;
		height: 16px;
	}

	@media (max-width: 767px) {
		.job-row {
			grid-template-columns: 1fr;
			gap: var(--ax-space-8);
		}

		.name-group {
			flex-wrap: wrap;
		}

		.job-name {
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
