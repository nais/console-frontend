<script lang="ts">
	import Time from '$lib/Time.svelte';
	import { Detail, Heading, Link, Loader, Tooltip } from '@nais/ds-svelte-community';
	import {
		CheckmarkCircleFillIcon,
		QuestionmarkIcon,
		TimerIcon,
		XMarkOctagonFillIcon
	} from '@nais/ds-svelte-community/icons';
	import IconWithText from '../IconWithText.svelte';
	import ListItem from './ListItem.svelte';

	const {
		jobRun
	}: {
		jobRun: {
			name: string;
			startTime: Date;
			duration: number;
			status: { state: string; message: string };
			trigger: { type: 'MANUAL'; actor: string } | { type: 'AUTOMATIC' };
		};
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
	<IconWithText size="large">
		{#snippet description()}
			<Detail>
				{#if jobRun.trigger.type === 'MANUAL'}
					Manually triggered
					{#if jobRun.startTime}
						<Time time={jobRun.startTime} distance={true} />
					{/if}
					by {jobRun.trigger.actor}.
				{:else}
					Automatically triggered
					{#if jobRun.startTime}
						<Time time={jobRun.startTime} distance={true} />
					{/if}
					by cron schedule.
				{/if}
			</Detail>
		{/snippet}
		{#snippet icon()}
			{#if jobRun.status.state === 'RUNNING'}
				<Tooltip content="Job is running">
					<Loader size="small" variant="interaction" />
				</Tooltip>
			{:else if jobRun.status.state === 'PENDING'}
				<Tooltip content="Job run pending">
					<Loader size="small" variant="interaction" />
				</Tooltip>
			{:else if jobRun.status.state === 'SUCCEEDED'}
				<Tooltip content="Job ran successfully">
					<CheckmarkCircleFillIcon style="color: var(--a-icon-success)" />
				</Tooltip>
			{:else if jobRun.status.state === 'FAILED'}
				<Tooltip content="Job run failed">
					<XMarkOctagonFillIcon style="color: var(--a-icon-danger)" />
				</Tooltip>
			{:else}
				<Tooltip content="Job run status is unknown">
					<QuestionmarkIcon />
				</Tooltip>
			{/if}
		{/snippet}
		{#snippet text()}
			<Heading level="4" size="xsmall">
				<Link href="#">slack-teams-notification-28855320</Link>
			</Heading>
		{/snippet}
	</IconWithText>
	<div class="right">
		<IconWithText size="small" text={formatDuration(jobRun.duration)} icon={TimerIcon} />
		<Detail>{jobRun.status.message}</Detail>
	</div>
</ListItem>

<style>
	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--a-spacing-05);
	}
</style>
