<script lang="ts">
	export let schedule: string;
	import cronstrue from 'cronstrue';
</script>

<div>
	{#if schedule !== ''}
		<span style="font-family: monospace">{schedule}</span>
		<span style="font-size: 1rem"
			>({cronstrue.toString(schedule, {
				verbose: true,
				use24HourTimeFormat: true
			})})</span
		>

		<p>All schedule times in UTC</p>
	{:else}
		No schedule
	{/if}
</div>

<style>
</style>
