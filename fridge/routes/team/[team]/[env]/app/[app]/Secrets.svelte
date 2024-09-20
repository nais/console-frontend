<script lang="ts">
	import { graphql, PendingValue } from '$houdini';
	import { page } from '$app/stores';
	import { Alert, Loader, Skeleton } from '@nais/ds-svelte-community';
	import type { AppSecretsVariables } from './$houdini';

	export const _AppSecretsVariables: AppSecretsVariables = () => {
		return { app: $page.params.app, team: $page.params.team, env: $page.params.env };
	};

	const appSecrets = graphql(`
		query AppSecrets($app: String!, $team: Slug!, $env: String!) @load {
			app(name: $app, team: $team, env: $env) @loading {
				secrets @loading {
					name
				}
			}
		}
	`);

	$: env = $page.params.env;
	$: team = $page.params.team;
</script>

{#if $appSecrets.fetching}
	<Loader />
{:else if $appSecrets.errors}
	<Alert variant="error">
		{#each $appSecrets.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $appSecrets.data}
	<div>
		{#if $appSecrets.data.app.secrets.length > 0}
			<ul>
				{#each $appSecrets.data.app.secrets as secret}
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
{/if}

<style>
	ul {
		list-style: none;
	}
</style>
