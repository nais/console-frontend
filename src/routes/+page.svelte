<script lang="ts">
	import Card from '$lib/Card.svelte';
	import Deploys from './Deploys.svelte';
	import Teams from './Teams.svelte';
</script>

<svelte:head><title>Console</title></svelte:head>

<div class="page">
	<div class="grid">
		<Card columns={4} rows={1}>
			<Teams />
		</Card>

		<Card columns={8} rows={2}>
			<Deploys />
		</Card>
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
