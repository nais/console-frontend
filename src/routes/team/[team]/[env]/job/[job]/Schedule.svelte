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
					<div class="details-item">
						<dt>Schedule</dt>
						<dd>{runConfig.description}</dd>
					</div>
					<div class="details-item">
						<dt>Next run</dt>
						<dd>{runConfig.nextRun}</dd>
					</div>
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

	.details-item {
		display: grid;
		gap: var(--ax-space-2);
	}

	dd {
		margin: 0;
	}

	@media (max-width: 800px) {
		.details-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
