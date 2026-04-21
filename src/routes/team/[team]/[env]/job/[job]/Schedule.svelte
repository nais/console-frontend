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
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		width: 100%;
	}

	.details-grid dt:nth-of-type(1) {
		grid-column: 1;
		grid-row: 1;
	}

	.details-grid dd:nth-of-type(1) {
		grid-column: 1;
		grid-row: 2;
	}

	.details-grid dt:nth-of-type(2) {
		grid-column: 2;
		grid-row: 1;
	}

	.details-grid dd:nth-of-type(2) {
		grid-column: 2;
		grid-row: 2;
	}

	dd {
		margin: 0;
	}

	@media (max-width: 800px) {
		.details-grid {
			grid-template-columns: 1fr;
		}

		.details-grid dt,
		.details-grid dd {
			grid-column: auto;
			grid-row: auto;
		}
	}
</style>
