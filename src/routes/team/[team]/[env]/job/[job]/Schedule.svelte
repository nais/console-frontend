<script lang="ts">
	export let schedule: string;
	import cronstrue from 'cronstrue';
</script>

<div>
	{#if schedule !== ''}
		<span style="font-family: monospace">{schedule}</span>
		<br />
		<span style="font-size: 1rem">({cronstrue.toString(schedule, { verbose: true })})</span>
	{:else}
		No schedule
	{/if}
</div>

<style>
</style>
