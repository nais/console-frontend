<script lang="ts">
	import Manifest from '$lib/components/Manifest.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ JobManifest } = data);
</script>

{#if $JobManifest.errors}
	<Alert variant="error">
		{#each $JobManifest.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $JobManifest.data}
	{@const workloadID = $JobManifest.data.team.environment.job.id}
	<Manifest {workloadID} />
{/if}
