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
	<div class="mainGrid">
		<Teams user={$LandingPage.data.user} />
		<!-- <Footprint />
		<Emissions />
		<Deploys /> -->
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
