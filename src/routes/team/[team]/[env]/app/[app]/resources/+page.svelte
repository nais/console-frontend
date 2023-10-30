<script lang="ts">
	import Card from '$lib/Card.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ AppResources } = data);
</script>

{#if $AppResources.errors}
	<Alert variant="error">
		{#each $AppResources.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

<div class="grid">
	<Card columns={12}>
		<h3>Resources</h3>
		{#if $AppResources.data}
			{#each $AppResources.data.dailyMemoryUsageForApp as metric}
				<p>{metric.timestamp}/{metric.value}</p>
			{/each}
		{/if}
	</Card>
	<Card columns={12}>
		<h3>Resources</h3>
		{#if $AppResources.data}
			{#each $AppResources.data.dailyMemoryRequestForApp as metric}
				<p>{metric.timestamp}/{metric.value}</p>
			{/each}
		{/if}
	</Card>
</div>

<style>
	.grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
