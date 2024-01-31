<script lang="ts">
	import type { AppSecrets } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import { Skeleton } from '@nais/ds-svelte-community';

	export let app: AppSecrets;
	export let team: string;

	$: data = fragment(
		app,
		graphql(`
			fragment AppSecrets on App {
				secrets @loading
			}
		`)
	);

	$: secrets = $data.secrets;
	$: count = secrets.length
</script>

<div>
	{#if count > 0}
		<ul>
			{#each secrets as secret}
				<li><a href="/team/{team}/secrets">{secret}</a></li>
			{/each}
		</ul>
	{:else}
	<p>No secrets</p>
	{/if}
</div>

<style>
    ul {
        list-style: none;
    }
</style>
