<script lang="ts">
	import Alert from '$lib/Alert.svelte';
	import Teams from './Teams.svelte';
	import Footprint from './Footprint.svelte';
	import Emissions from './Emissions.svelte';
	import Deploys from './Deploys.svelte';
</script>

<Alert variant="idea">
	<p>Here's an idea</p>
	<p>Here's another idea</p>
	<p>And even one more</p>
</Alert>

<div class="mainGrid">
	<div class="teams"><Teams /></div>
	<div class="foootprint"><Footprint /></div>
	<div class="emissions"><Emissions /></div>
	<div class="deploys"><Deploys /></div>
</div>

<style>
	.mainGrid {
		display: grid;
		grid-template-columns: repeat(5, auto);
		grid-column-gap: 1rem;
	}
	.teams {
		grid-column-start: span 2;
	}
</style>
