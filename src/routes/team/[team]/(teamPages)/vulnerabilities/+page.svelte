<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import VulnerabilitiesGraph from '$lib/components/VulnerabilitiesGraph.svelte';

	$: teamName = $page.params.team;
</script>

<div class="grid">
	<Card columns={12}>
		<VulnerabilitiesGraph team={teamName} />
	</Card>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
