<script lang="ts">
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
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
				<div class="resource-cards">
					<SurfaceCard title="Schedule" level="h4">
						<code>{runConfig.description}</code>
					</SurfaceCard>

					<SurfaceCard title="Next run" level="h4">
						<code>{runConfig.nextRun}</code>
					</SurfaceCard>
				</div>
			{/if}
		{:else}
			<p>No schedule</p>
		{/if}
	</div>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		width: 100%;
	}

	.resource-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--ax-space-12);
	}

	code {
		font-family: monospace;
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
	}

	@media (max-width: 800px) {
		.resource-cards {
			grid-template-columns: 1fr;
		}
	}
</style>
