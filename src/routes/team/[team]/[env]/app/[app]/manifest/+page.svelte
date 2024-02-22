<script lang="ts">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';

	import { page } from '$app/stores';
	import { Alert, CopyButton, Skeleton } from '@nais/ds-svelte-community';
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
	<Card>
		<h4>
			Manifest for application {name}
			{#if $AppManifest.data?.app.manifest !== PendingValue}
				<CopyButton
					text="Copy manifest"
					activeText="Manifest copied"
					variant="action"
					copyText={$AppManifest.data ? $AppManifest.data.app.manifest : ''}
				/>
			{/if}
		</h4>
		{#if $AppManifest.data.app.name === PendingValue}
			<Skeleton variant="rounded" height="700px" />
		{:else}
			<pre>{$AppManifest.data.app.manifest}</pre>
		{/if}
	</Card>
{/if}

<style>
	h4 {
		display: flex;
		justify-content: space-between;
	}
</style>
