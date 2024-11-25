<script lang="ts">
	import { page } from '$app/stores';

	import type { LayoutData } from './$types';
	import TeamMenu from './TeamMenu.svelte';

	export let data: LayoutData;

	$: team = $page.params.team;
</script>

<svelte:head><title>{team} - Console</title></svelte:head>

<div class="main">
	{#key team}
		<TeamMenu {data} />
	{/key}
	<div class="container">
		<slot />
	</div>
</div>

<style>
	.container {
		flex-grow: 1;
	}

	.main {
		gap: 1rem;
		display: grid;
		grid-template-columns: 200px 1fr;
	}
</style>
