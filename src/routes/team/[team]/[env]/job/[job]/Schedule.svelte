<script lang="ts">
	import cronstrue from 'cronstrue';

	interface Props {
		schedule: {
			readonly expression: string;
			readonly timeZone: string;
		} | null;
	}

	let { schedule }: Props = $props();
</script>

<div>
	{#if schedule}
		<span style="font-family: monospace">{schedule.expression}</span>
		<span style="font-size: 1rem"
			>({cronstrue.toString(schedule.expression, {
				verbose: true,
				use24HourTimeFormat: true
			})})</span
		>

		<p>Timezone: {schedule.timeZone}</p>
	{:else}
		No schedule
	{/if}
</div>

<style>
</style>
