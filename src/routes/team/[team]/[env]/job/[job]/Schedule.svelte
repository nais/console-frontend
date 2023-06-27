<script lang="ts">
	export let schedule: string;
</script>

<div>
	{#if schedule !== ''}
		{schedule}
	{:else}
		No schedule
	{/if}
</div>

<style>
	div {
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 1rem;
		font-family: monospace;
	}
</style>
