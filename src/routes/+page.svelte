<script lang="ts">
	import Teams from './Teams.svelte';
	import Deploys from './Deploys.svelte';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ LandingPage } = data);
</script>

{#if $LandingPage.errors}
	{#each $LandingPage.errors as error}
		<p>{error.message}</p>
	{/each}
{/if}

<div class="main">
	{#if $LandingPage.data}
		<Teams user={$LandingPage.data.user} />
		<Deploys user={$LandingPage.data.user} />
	{/if}
</div>

<style>
	.main {
		width: 100%;
		height: 100%;
		place-items: top;
		display: flex;
		gap: 1rem;
	}
</style>
