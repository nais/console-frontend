<script lang="ts">
	import type { JobRunsList$result } from '$houdini';
	import SuccessIcon from '#lib/icons/SuccessIcon.svelte';
	import JobRunDiagnostics from '#lib/domain/workload/JobRunDiagnostics.svelte';
	import IconLabel from '#lib/ui/IconLabel.svelte';
	import ListItem from '#lib/ui/ListItem.svelte';
	import Time from '#lib/ui/Time.svelte';
	import TooltipAlignHack from '#lib/ui/TooltipAlignHack.svelte';
	import { Button, Detail, Loader, ReadMore, Tooltip } from '#lib/shadcn/ui/index.js';
	import { QuestionmarkIcon, TimerIcon, TrashIcon } from '#lib/icons/index.js';
	import ErrorIcon from '../../icons/ErrorIcon.svelte';

	type JobRun = JobRunsList$result['team']['environment']['job']['runs']['edges'][number]['node'];

	const {
		run,
		jobPath,
		ondelete
	}: {
		run: JobRun;
		jobPath: string;
		ondelete?: (runName: string) => void;
	} = $props();

	let detailsOpen = $state(false);
	const count = $derived(run.instances.pageInfo.totalCount);

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
</script>

<ListItem>
	<div class="run">
		<div class="run-header">
			<IconLabel size="large" label={run.name} as="h3">
				{#snippet description()}
					{run.trigger.type === 'MANUAL' ? 'Manually triggered' : 'Automatically triggered'}
					{#if run.startTime}
						<Time time={run.startTime} distance />
					{/if}
					by {run.trigger.type === 'MANUAL' ? run.trigger.actor : 'cron schedule'}.
				{/snippet}
				{#snippet icon()}
					{#if run.status.state === 'RUNNING'}
						<TooltipAlignHack content="Job is running">
							<Loader size="small" variant="interaction" />
						</TooltipAlignHack>
					{:else if run.status.state === 'PENDING'}
						<TooltipAlignHack content="Job run pending">
							<Loader size="small" variant="interaction" />
						</TooltipAlignHack>
					{:else if run.status.state === 'SUCCEEDED'}
						<TooltipAlignHack content="Job ran successfully">
							<SuccessIcon />
						</TooltipAlignHack>
					{:else if run.status.state === 'FAILED'}
						<TooltipAlignHack content="Job run failed">
							<ErrorIcon />
						</TooltipAlignHack>
					{:else}
						<TooltipAlignHack content="Job run status is unknown">
							<QuestionmarkIcon />
						</TooltipAlignHack>
					{/if}
				{/snippet}
			</IconLabel>
			<div class="right">
				<IconLabel size="small" label={formatDuration(run.duration)} icon={TimerIcon} />
				<Detail>{run.status.message}</Detail>
				{#if ondelete}
					<Tooltip content="Delete run">
						<Button
							variant="tertiary-neutral"
							size="xsmall"
							icon={TrashIcon}
							aria-label="Delete run {run.name}"
							onclick={() => ondelete(run.name)}
						/>
					</Tooltip>
				{/if}
			</div>
		</div>
		<ReadMore size="small" bind:open={detailsOpen}>
			{#snippet header()}
				Run details<span class="sr-only"> for {run.name}</span> &middot; {count}
				{count === 1 ? 'instance' : 'instances'}
			{/snippet}
			{#if detailsOpen}
				<JobRunDiagnostics
					runId={run.id}
					{jobPath}
					active={run.status.state === 'RUNNING' || run.status.state === 'PENDING'}
				/>
			{/if}
		</ReadMore>
	</div>
</ListItem>

<style>
	.run {
		display: grid;
		gap: var(--nais-space-6);
		min-width: 0;
		width: 100%;
		overflow-wrap: anywhere;
	}

	.run-header {
		display: flex;
		justify-content: space-between;
		gap: var(--nais-space-8);
	}

	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--nais-space-2);
	}

	@container (max-width: 500px) {
		.run-header {
			flex-wrap: wrap;
		}

		.right {
			width: 100%;
			flex-direction: row;
			flex-wrap: wrap;
			align-items: center;
			gap: var(--nais-space-4) var(--nais-space-8);
		}
	}
</style>
