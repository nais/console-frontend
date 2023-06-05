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
		<div class="grow">
			<Deploys user={$LandingPage.data.user} />
		</div>
	{/if}
</div>

<style>
	.main {
		width: 100%;
		height: 100%;
		display: flex;
		gap: 1rem;
	}
	.grow {
		flex-grow: 1;
	}
</style>
