<script lang="ts">
	import type { AppSecrets } from '$houdini';
	import { fragment, graphql, PendingValue } from '$houdini';
	import { page } from '$app/stores';
	import { Skeleton } from '@nais/ds-svelte-community';

	export let app: AppSecrets;

	$: data = fragment(
		app,
		graphql(`
			fragment AppSecrets on App {
				secrets @loading {
					name
				}
			}
		`)
	);

	$: env = $page.params.env;
	$: team = $page.params.team;
	$: secrets = $data.secrets
	$: count = secrets.length;
</script>

<div>
	{#if count > 0}
		<ul>
			{#each secrets as secret}
				{#if secret === PendingValue}
					<Skeleton variant="text" width="300px" />
				{:else}
					<li><a href="/team/{team}/{env}/secret/{secret.name}">{secret.name}</a></li>
				{/if}
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
