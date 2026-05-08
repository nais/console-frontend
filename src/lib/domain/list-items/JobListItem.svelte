<script lang="ts">
	import { JobState, type JobRunState$options } from '$houdini';
	import IssuePills from '$lib/domain/issues/IssuePills.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import RunningIndicator from '$lib/ui/RunningIndicator.svelte';
	import Time from '$lib/ui/Time.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { getLocalizedCronDescription } from '$lib/utils/cron';
	import { countIssuesBySeverity } from '$lib/utils/issueCounts';
	import { Detail, Loader, Tooltip } from '@nais/ds-svelte-community';
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

	const nextRun = $derived(
		job.schedule
			? getLocalizedCronDescription({
					...job.schedule,
					context: {
						team: job.team.slug,
						environment: job.teamEnvironment.environment.name,
						job: job.name
					}
				})
			: null
	);
</script>

<ListItem>
	<div class="job-row">
		<div class="primary">
			<IconLabel
				label={job.name}
				href="/team/{job.team.slug}/{job.teamEnvironment.environment.name}/job/{job.name}"
				size="medium"
				tag={{
					label: job.teamEnvironment.environment.name,
					variant: envTagVariant(job.teamEnvironment.environment.name)
				}}
				tagSize="xsmall"
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
		</div>

		<div class="meta-slot issues-slot">
			{#if job.issues?.pageInfo.totalCount > 0}
				{@const criticalCount = countIssuesBySeverity(job.issues.edges, 'CRITICAL')}
				{@const warningCount = countIssuesBySeverity(job.issues.edges, 'WARNING')}
				{@const todoCount = countIssuesBySeverity(job.issues.edges, 'TODO')}

				<IssuePills
					critical={criticalCount}
					warning={warningCount}
					todo={todoCount}
					direction="column"
				/>
			{/if}
		</div>

		<div class="right">
			<div class="meta-slot deploy-slot">
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
			</div>

			<div class="meta-slot run-slot">
				{#if job.runs.edges.length}
					{@const lastRun = job.runs.edges[0].node}
					<div class="run-slot-content">
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
				{:else}
					<Detail>No runs</Detail>
				{/if}
			</div>

			<div class="meta-slot schedule-slot">
				{#if job.runs.edges.length && nextRun && nextRun.nextRun}
					<TooltipAlignHack content="Next scheduled run: {nextRun.nextRun}">
						<IconLabel size="small" icon={CalendarIcon} label={nextRun.nextRun} />
					</TooltipAlignHack>
				{/if}
			</div>
		</div>
	</div>
</ListItem>

<style>
	.job-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content 13rem;
		align-items: center;
		column-gap: var(--ax-space-16);
		min-block-size: 3rem;
		width: 100%;
	}

	.primary {
		min-width: 0;
	}

	.primary :global(.icon-label) {
		min-width: 0;
	}

	.primary :global(.content) {
		min-width: 0;
	}

	.primary :global(.aksel-heading),
	.primary :global(.aksel-heading a) {
		display: block;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.right {
		display: grid;
		grid-template-rows: auto auto auto;
		inline-size: 13rem;
		justify-items: end;
		align-items: end;
		row-gap: var(--ax-space-2);
	}

	.meta-slot {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		min-width: 0;
		white-space: nowrap;
	}

	.deploy-slot :global(.icon-label),
	.schedule-slot :global(.icon-label) {
		justify-content: flex-end;
	}

	.deploy-slot :global(.icon-label > *),
	.deploy-slot :global(.content),
	.schedule-slot :global(.icon-label > *),
	.schedule-slot :global(.content) {
		flex: 0 0 auto;
	}

	.run-slot-content {
		display: flex;
		gap: var(--ax-space-4);
		align-items: center;
		justify-content: flex-end;
	}

	.issues-slot {
		justify-content: flex-end;
	}

	/* Mobile responsive layout */
	@media (max-width: 767px) {
		.job-row {
			grid-template-columns: 1fr;
			align-items: start;
			min-block-size: auto;
			row-gap: var(--ax-space-12);
		}

		.right {
			grid-template-columns: 1fr;
			justify-items: end;
			row-gap: var(--ax-space-4);
			column-gap: 0;
		}

		.issues-slot {
			justify-content: flex-end;
		}
	}
</style>
