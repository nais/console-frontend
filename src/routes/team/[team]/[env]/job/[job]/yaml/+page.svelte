<script lang="ts">
	import Card from '$lib/Card.svelte';
	import { PendingValue } from '$houdini';

	import type { PageData } from './$houdini';
	import Loading from '$lib/Loading.svelte';
	import { page } from '$app/stores';
	import { copyText } from 'svelte-copy';
	import { Clipboard } from '@nais/ds-svelte-community/icons';
	import { Alert, Button } from '@nais/ds-svelte-community';

	export let data: PageData;
	let name = $page.params.job;
	$: ({ JobManifest } = data);
</script>

{#if $JobManifest.errors}
	<Alert variant="error">
		{#each $JobManifest.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $JobManifest.data}
	<Card>
		<h4>
			nais.yaml for {name}
			<Button
				size="xsmall"
				on:click={() => {
					if ($JobManifest.data?.job.manifest !== PendingValue) {
						copyText($JobManifest.data ? $JobManifest.data.job.manifest : '');
					}
				}}
			>
				<svelte:fragment slot="icon-left"><Clipboard /></svelte:fragment>
				Copy manifest</Button
			>
		</h4>
		{#if $JobManifest.data.job.name === PendingValue}
			<Loading height="300px" />
		{:else}
			<pre>{$JobManifest.data.job.manifest}</pre>
		{/if}
	</Card>
{/if}

<style>
	h4 {
		display: flex;
		justify-content: space-between;
	}
</style>
