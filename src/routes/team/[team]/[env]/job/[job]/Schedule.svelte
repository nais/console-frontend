<script lang="ts">
	import { getLocalizedCronDescription, type ScheduleContext } from '$lib/utils/cron';
	import { Heading } from '@nais/ds-svelte-community';

	interface Props {
		schedule: {
			readonly expression: string;
			readonly timeZone: string;
		} | null;
		scheduleContext?: ScheduleContext;
	}

	let { schedule, scheduleContext }: Props = $props();
</script>

<div class="wrapper">
	<Heading as="h3" size="small">Run Configuration</Heading>
	<div>
		{#if schedule}
			{@const runConfig = getLocalizedCronDescription({ ...schedule, context: scheduleContext })}
			{#if runConfig.error}
				<p style="color: red;">Error: {runConfig.error}</p>
			{:else}
				<dl class="details-grid">
					<dt>Schedule</dt>
					<dd>{runConfig.description}</dd>
					<dt>Next run</dt>
					<dd>{runConfig.nextRun}</dd>
				</dl>
			{/if}
		{:else}
			<p>No schedule</p>
		{/if}
	</div>
</div>

<style>
	dt {
		font-weight: bold;
	}
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		width: 100%;
	}

	.details-grid {
		margin: 0;
		display: grid;
		grid-template-rows: repeat(2, auto);
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		width: 100%;
	}

	dd {
		margin: 0;
	}

	@media (max-width: 800px) {
		.details-grid {
			grid-template-rows: none;
			grid-auto-flow: row;
			grid-auto-columns: auto;
		}
	}
</style>
