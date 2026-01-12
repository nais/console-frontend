<script lang="ts">
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Time from '$lib/ui/Time.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { Detail, Loader } from '@nais/ds-svelte-community';
	import { QuestionmarkIcon, TimerIcon } from '@nais/ds-svelte-community/icons';
	import ErrorIcon from '../../icons/ErrorIcon.svelte';

	const {
		run,
		urlBase
	}: {
		run: {
			name: string;
			startTime: Date | null;
			duration: number;
			status: { state: string; message: string };
			trigger: { type: 'MANUAL' | 'AUTOMATIC'; actor: string | null };
		};
		urlBase?: string;
	} = $props();

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
	<IconLabel size="large" label={run.name} href={urlBase ? urlBase + run.name : undefined} as="h4">
		{#snippet description()}
			{#if run.trigger.type === 'MANUAL'}
				Manually triggered
				{#if run.startTime}
					<Time time={run.startTime} distance={true} />
				{/if}
				by {run.trigger.actor}.
			{:else}
				Automatically triggered
				{#if run.startTime}
					<Time time={run.startTime} distance={true} />
				{/if}
				by cron schedule.
			{/if}
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
	</div>
</ListItem>

<style>
	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-2);
	}
</style>
