<script lang="ts">
	import { JobState, type JobRunState$options } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import RunningIndicator from '$lib/ui/RunningIndicator.svelte';
	import Time from '$lib/ui/Time.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { getLocalizedCronDescription } from '$lib/utils/cron';
	import { Detail, Loader, Tag, Tooltip } from '@nais/ds-svelte-community';
	import {
		CalendarIcon,
		CircleFillIcon,
		QuestionmarkIcon,
		RocketIcon
	} from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import ErrorIcon from '../../icons/ErrorIcon.svelte';

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

	const nextRun = $derived(job.schedule ? getLocalizedCronDescription(job.schedule) : null);
</script>

<ListItem>
	<IconLabel
		as="h4"
		label={job.name}
		href="/team/{job.team.slug}/{job.teamEnvironment.environment.name}/job/{job.name}"
		size="large"
		tag={{
			label: job.teamEnvironment.environment.name,
			variant: envTagVariant(job.teamEnvironment.environment.name)
		}}
	>
		{#snippet icon()}
			<TooltipAlignHack
				content={{
					COMPLETED: 'Job is completed',
					RUNNING: 'Job is running',
					FAILED: 'Job failed',
					UNKNOWN: 'Unkown status'
				}[job.state] ?? ''}
			>
				{#if job.state === JobState.COMPLETED}
					<CircleFillIcon
						style="width: 24px; color: light-dark(var(--ax-bg-success-strong), var(--ax-bg-success-strong)); font-size: 0.7rem"
					/>
				{:else if job.state === JobState.RUNNING}
					<RunningIndicator />
				{:else if job.state === JobState.FAILED}
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
		{#if job.deployments.nodes.length > 0}
			{@const timestamp = job.deployments.nodes[0].createdAt}
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
		{#if job.runs.edges.length}
			{@const lastRun = job.runs.edges[0].node}
			<div style="display: flex; gap: 4px; align-items: center;">
				{#if lastRun.status}
					{#if lastRun.status.state === 'RUNNING'}
						<TooltipAlignHack content="Job is running">
							<Loader size="xsmall" variant="interaction" />
						</TooltipAlignHack>
					{:else if lastRun.status.state === 'PENDING'}
						<TooltipAlignHack content="Job run pending">
							<Loader size="xsmall" variant="interaction" />
						</TooltipAlignHack>
					{:else if lastRun.status.state === 'SUCCEEDED'}
						<TooltipAlignHack content="Last job ran successfully">
							<SuccessIcon />
						</TooltipAlignHack>
					{:else if lastRun.status.state === 'FAILED'}
						<TooltipAlignHack content="Last job run failed">
							<ErrorIcon />
						</TooltipAlignHack>
					{:else}
						<TooltipAlignHack content="Job run status is unknown">
							<QuestionmarkIcon />
						</TooltipAlignHack>
					{/if}
				{:else}
					<TooltipAlignHack content="Job run status is unknown">
						<QuestionmarkIcon />
					</TooltipAlignHack>
				{/if}
				{#if lastRun.startTime}
					<TooltipAlignHack
						content="Last run - {format(lastRun.startTime, 'PPPP', { locale: enGB })}"
					>
						<Detail><Time time={lastRun.startTime} distance={true} /></Detail>
					</TooltipAlignHack>
				{/if}
			</div>
			{#if nextRun && nextRun.nextRun}
				<TooltipAlignHack content="Next scheduled run: {nextRun.nextRun}">
					<IconLabel size="small" icon={CalendarIcon} label={nextRun.nextRun} />
				</TooltipAlignHack>
			{/if}
		{:else}
			<Detail>No runs</Detail>
		{/if}
		{#if job.issues?.pageInfo.totalCount > 0}
			{@const criticalCount = job.issues.edges.filter((e) => e.node.severity === 'CRITICAL').length}
			{@const warningCount = job.issues.edges.filter((e) => e.node.severity === 'WARNING').length}
			{@const todoCount = job.issues.edges.filter((e) => e.node.severity === 'TODO').length}

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
