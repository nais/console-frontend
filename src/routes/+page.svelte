<script lang="ts">
	import Alert from '$lib/Alert.svelte';
	import Teams from './Teams.svelte';
	import Footprint from './Footprint.svelte';
	import Emissions from './Emissions.svelte';
	import Deploys from './Deploys.svelte';
	import Input from '$lib/Input.svelte';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ LandingPage } = data);
</script>

{#if $LandingPage.errors}
	{#each $LandingPage.errors as error}
		<p>{error.message}</p>
	{/each}
{/if}

{#if $LandingPage.data}
	<Alert variant="idea">
		<p>Here's an idea</p>
		<p>Here's another idea</p>
		<p>And even one more</p>
	</Alert>

	<div class="mainGrid" style="margin-bottom: 2em">
		<Input />
	</div>

	<div class="mainGrid">
		<Teams user={$LandingPage.data.user} />
		<Footprint />
		<Emissions />
		<Deploys />
	</div>
{/if}

<style>
	.mainGrid {
		display: grid;
		grid-template-columns: 4fr 3fr 3fr 3fr;
		grid-column-gap: 1rem;
		justify-content: stretch;
	}
</style>
