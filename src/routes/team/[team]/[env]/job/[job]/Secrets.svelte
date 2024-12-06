<script lang="ts">
	import { page } from '$app/stores';
	import { graphql } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Loader } from '@nais/ds-svelte-community';
	import type { JobSecretsVariables } from './$houdini';

	export const _JobSecretsVariables: JobSecretsVariables = () => {
		return { job: $page.params.job, team: $page.params.team, env: $page.params.env };
	};

	const jobSecrets = graphql(`
		query JobSecrets($job: String!, $team: Slug!, $env: String!) @load {
			team(slug: $team) {
				environment(name: $env) {
					job(name: $job) {
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

	let env = $derived($page.params.env);
	let team = $derived($page.params.team);
</script>

<GraphErrors errors={$jobSecrets.errors} />

{#if $jobSecrets.fetching}
	<Loader />
{:else if $jobSecrets.data}
	<div>
		{#if $jobSecrets.data.team.environment.job.secrets.edges.length > 0}
			<ul>
				{#each $jobSecrets.data.team.environment.job.secrets.edges as secret}
					<li><a href="/team/{team}/{env}/secret/{secret.node.name}">{secret.node.name}</a></li>
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
