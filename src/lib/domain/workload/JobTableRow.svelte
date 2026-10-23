<script lang="ts">
	import IssuePills from '#lib/domain/issues/IssuePills.svelte';
	import { envTagVariant } from '#lib/envTagVariant.js';
	import ErrorIcon from '#lib/icons/ErrorIcon.svelte';
	import SuccessIcon from '#lib/icons/SuccessIcon.svelte';
	import StatusIndicator from '#lib/ui/StatusIndicator.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { countIssuesBySeverity } from '#lib/utils/issueCounts.js';
	import { JobState, type JobRunState$options } from '$houdini';
	import { Loader, Tag, Td, Tr } from '@nais/ds-svelte-community';

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
				nextRun: Date | null;
			} | null;
			issues: {
				pageInfo: { totalCount: number };
				edges: { node: { severity: string } }[];
			};
			activityLog: { nodes: { createdAt: Date }[] };
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

<Tr>
	<Td>
		<div class="status-cell">
			<StatusIndicator
				label={job.state === JobState.RUNNING
					? 'Job is running'
					: job.state === JobState.COMPLETED
						? 'Job completed'
						: job.state === JobState.FAILED
							? 'Job failed'
							: 'Unknown status'}
				tone={job.state === JobState.RUNNING || job.state === JobState.COMPLETED
					? 'success'
					: job.state === JobState.FAILED
						? 'danger'
						: 'neutral'}
			/>
		</div>
	</Td>
	<Td><a class="resource-name" href={jobHref}>{job.name}</a></Td>
	<Td>
		<Tag size="xsmall" variant={envTagVariant(job.teamEnvironment.environment.name)}
			>{job.teamEnvironment.environment.name}</Tag
		>
	</Td>
	<Td>
		{#if job.issues?.pageInfo.totalCount > 0}
			{const criticalCount = $derived(countIssuesBySeverity(job.issues.edges, 'CRITICAL'))}
			{const warningCount = $derived(countIssuesBySeverity(job.issues.edges, 'WARNING'))}
			{const todoCount = $derived(countIssuesBySeverity(job.issues.edges, 'TODO'))}
			<IssuePills critical={criticalCount} warning={warningCount} todo={todoCount} />
		{/if}
	</Td>
	<Td>
		{#if lastRun}
			<span class="run-status table-meta">
				<span class="aksel-sr-only">Last run {lastRun.status.state.toLowerCase()}</span>
				{#if lastRun.status.state === 'RUNNING' || lastRun.status.state === 'PENDING'}
					<Loader size="xsmall" variant="interaction" aria-hidden="true" />
				{:else if lastRun.status.state === 'SUCCEEDED'}
					<SuccessIcon aria-hidden="true" />
				{:else if lastRun.status.state === 'FAILED'}
					<ErrorIcon aria-hidden="true" />
				{/if}
				{#if lastRun.startTime}
					<Time time={lastRun.startTime} distance={true} />
				{/if}
			</span>
		{/if}
	</Td>
	<Td>
		{#if job.schedule?.nextRun}
			<span class="table-meta">
				<Time time={job.schedule.nextRun} distance={true} />
			</span>
		{/if}
	</Td>
	<Td>
		{#if job.activityLog.nodes.length > 0}
			{const timestamp = $derived(job.activityLog.nodes[0].createdAt)}
			<span class="table-meta">
				<Time time={timestamp} distance={true} />
			</span>
		{/if}
	</Td>
</Tr>

<style>
	.run-status {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
	}

	.run-status :global(svg) {
		width: var(--ax-space-16);
		height: var(--ax-space-16);
	}
</style>
