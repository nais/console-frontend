<script lang="ts">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';

	import { page } from '$app/stores';
	import Loading from '$lib/Loading.svelte';
	import { Alert, CopyButton } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

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
			{#if $JobManifest.data?.naisjob.manifest !== PendingValue}
				<CopyButton
					text="Copy manifest"
					activeText="Manifest copied"
					variant="action"
					copyText={$JobManifest.data ? $JobManifest.data.naisjob.manifest : ''}
				/>
			{/if}
		</h4>
		{#if $JobManifest.data.naisjob.name === PendingValue}
			<Loading height="300px" />
		{:else}
			<pre>{$JobManifest.data.naisjob.manifest}</pre>
		{/if}
	</Card>
{/if}

<style>
	h4 {
		display: flex;
		justify-content: space-between;
	}
</style>
