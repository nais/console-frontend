<script lang="ts">
	import type { AppSecrets } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import { Skeleton } from '@nais/ds-svelte-community';
	import { page } from '$app/stores';

	export let app: AppSecrets;

	$: data = fragment(
		app,
		graphql(`
			fragment AppSecrets on App {
				secrets {
					name
				}
			}
		`)
	);

	$: env = $page.params.env;
	$: team = $page.params.team;
	$: secrets = $data.secrets;
	$: count = secrets.length;
</script>

<div>
	{#if count > 0}
		<ul>
			{#each secrets as secret}
				{#if secret === PendingValue}
					<Skeleton variant="text" />
				{:else}
					<li><a href="/team/{team}/{env}/secret/{secret}">{secret}</a></li>
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
