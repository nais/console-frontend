<script lang="ts">
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Loader } from '@nais/ds-svelte-community';
	import type { AppSecretsVariables } from './$houdini';

	export const _AppSecretsVariables: AppSecretsVariables = () => {
		return { app: page.params.app, team: page.params.team, env: page.params.env };
	};

	const appSecrets = graphql(`
		query AppSecrets($app: String!, $team: Slug!, $env: String!) @load {
			team(slug: $team) {
				slug
				environment(name: $env) {
					name
					application(name: $app) {
						name
						secrets {
							edges {
								node {
									name
								}
							}
						}
					}
				}
			}
		}
	`);
</script>

<GraphErrors errors={$appSecrets.errors} />

{#if $appSecrets.fetching}
	<Loader />
{:else if $appSecrets.data}
	<div>
		{#if $appSecrets.data.team.environment.application.secrets.edges.length > 0}
			<ul>
				{#each $appSecrets.data.team.environment.application.secrets.edges as secret}
					<li>
						<a
							href="/team/{$appSecrets.data.team.slug}/{$appSecrets.data.team.environment
								.name}/secret/{secret.node.name}">{secret.node.name}</a
						>
					</li>
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
