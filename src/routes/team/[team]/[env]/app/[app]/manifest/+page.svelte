<script lang="ts">
	import Manifest from '$lib/components/Manifest.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ AppManifest } = data);
</script>

{#if $AppManifest.errors}
	<Alert variant="error">
		{#each $AppManifest.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $AppManifest.data}
	<Manifest workload={$AppManifest.data.team.environment.application} />
{/if}

<style>
</style>
