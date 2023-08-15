<script lang="ts">
	import Card from '$lib/Card.svelte';

	import type { PageData } from './$houdini';
	import { page } from '$app/stores';
	import { Alert } from '@nais/ds-svelte-community';
	import { PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';

	export let data: PageData;
	let instanceName = $page.params.instance;
	$: ({ AppLog } = data);
</script>

{#if $AppLog.errors}
	<Alert variant="error">
		{#each $AppLog.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $AppLog.data}
	<Card>
		<h4>{instanceName}</h4>
		{#if $AppLog.data.app.name === PendingValue}
			{#each new Array(5) as _}
				<pre>Loading loading</pre>
				<Loading />
			{/each}
		{:else}
			{#each $AppLog.data.app.instances as instance}
				{#if instanceName === instance.name}
					<code>
						{#each instance.log as log}
							<p>{log.message}</p>
						{/each}</code
					>
				{/if}
			{/each}
		{/if}
	</Card>
{/if}

<style>
	h4 {
		display: flex;
		justify-content: space-between;
	}
	pre {
		white-space: pre-wrap;
		font-size: 8px;
	}
</style>
