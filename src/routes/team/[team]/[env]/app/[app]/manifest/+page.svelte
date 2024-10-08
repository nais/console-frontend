<script lang="ts">
	import Card from '$lib/Card.svelte';

	import { page } from '$app/stores';
	import { Alert, CopyButton } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	let name = $page.params.app;
	$: ({ AppManifest } = data);
</script>

{#if $AppManifest.errors}
	<Alert variant="error">
		{#each $AppManifest.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $AppManifest.data}
	{@const manifest = $AppManifest.data.team.environment.application.manifest.content}
	<Card>
		<h3>
			Manifest for application {name}
			<CopyButton
				text="Copy manifest"
				activeText="Manifest copied"
				variant="action"
				copyText={manifest}
			/>
		</h3>

		<pre>{manifest}</pre>
	</Card>
{/if}

<style>
	h3 {
		display: flex;
		justify-content: space-between;
	}
</style>
