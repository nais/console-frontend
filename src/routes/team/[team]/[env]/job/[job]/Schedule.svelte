<script lang="ts">
	import { getLocalizedCronDescription } from '$lib/utils/cron';
	import { Heading } from '@nais/ds-svelte-community';

	interface Props {
		schedule: {
			readonly expression: string;
			readonly timeZone: string;
		} | null;
	}

	let { schedule }: Props = $props();
</script>

<div class="wrapper">
	<Heading level="3" size="small">Run Configuration</Heading>
	<div>
		{#if schedule}
			{@const runConfig = getLocalizedCronDescription(schedule)}
			{#if runConfig.error}
				<p style="color: red;">Error: {runConfig.error}</p>
			{:else}
				<dl style="margin: 0">
					<dt>Schedule</dt>
					<dd style="margin: 0">{runConfig.description}</dd>
					<dt>Next run</dt>
					<dd style="margin: 0">{runConfig.nextRun}</dd>
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
		align-items: start;
	}
</style>
