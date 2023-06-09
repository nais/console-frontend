<script lang="ts">
	import Card from '$lib/Card.svelte';
	import { PendingValue } from '$houdini';

	import type { PageData } from './$houdini';
	import Loading from '$lib/Loading.svelte';
	import { page } from '$app/stores';
	import { copyText } from 'svelte-copy';
	import { Clipboard } from '@nais/ds-svelte/icons';
	import { Alert, Button } from '@nais/ds-svelte';

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
		<h3>
			nais.yaml for {name}
			<Button
				size="xsmall"
				on:click={() => {
					if ($AppManifest.data?.app.manifest !== PendingValue) {
						copyText($AppManifest.data.app.manifest);
					}
				}}
			>
				<svelte:fragment slot="icon-left"><Clipboard /></svelte:fragment>
				Copy manifest</Button
			>
		</h3>
		{#if $AppManifest.data.app.name === PendingValue}
			<Loading height="300px" />
		{:else}
			<pre>{$AppManifest.data.app.manifest}</pre>
		{/if}
	</Card>
{/if}

<style>
	h3 {
		display: flex;
		justify-content: space-between;
	}
</style>
