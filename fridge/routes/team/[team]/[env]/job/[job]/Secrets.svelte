<script lang="ts">
	import { graphql, PendingValue } from '$houdini';
	import { page } from '$app/stores';
	import { Alert, Loader, Skeleton } from '@nais/ds-svelte-community';
	import type { JobSecretsVariables } from './$houdini';

	export const _JobSecretsVariables: JobSecretsVariables = () => {
		return { job: $page.params.job, team: $page.params.team, env: $page.params.env };
	};

	const jobSecrets = graphql(`
		query JobSecrets($job: String!, $team: Slug!, $env: String!) @load {
			naisjob(name: $job, team: $team, env: $env) @loading {
				secrets @loading {
					name
				}
			}
		}
	`);

	$: env = $page.params.env;
	$: team = $page.params.team;
</script>

{#if $jobSecrets.fetching}
	<Loader />
{:else if $jobSecrets.errors}
	<Alert variant="error">
		{#each $jobSecrets.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $jobSecrets.data}
	<div>
		{#if $jobSecrets.data.naisjob.secrets.length > 0}
			<ul>
				{#each $jobSecrets.data.naisjob.secrets as secret}
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
