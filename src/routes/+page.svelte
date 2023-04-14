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
	<Teams />
	<Footprint />
	<Emissions />
	<Deploys />
</div>

<style>
	.mainGrid {
		display: grid;
		grid-template-columns: 4fr 3fr 3fr 3fr;
		grid-column-gap: 1rem;
		justify-content: stretch;
	}
</style>
