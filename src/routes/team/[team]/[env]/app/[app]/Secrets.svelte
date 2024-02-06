<script lang="ts">
	import type { AppSecrets } from '$houdini';
	import { fragment, graphql } from '$houdini';
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
	$: secrets = $data.secrets
	$: count = secrets.length;
</script>

<div>
	{#if count > 0}
		<ul>
			{#each secrets as secret}
					<li><a href="/team/{team}/{env}/secret/{secret.name}">{secret.name}</a></li>
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
