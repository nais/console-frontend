<script lang="ts">
	import { graphql } from '$houdini';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Heading, Loader } from '@nais/ds-svelte-community';
	import { PadlockLockedIcon } from '@nais/ds-svelte-community/icons';
	import type { WorkloadSecretsVariables } from './$houdini';

	export const _WorkloadSecretsVariables: WorkloadSecretsVariables = () => {
		return { name: workload, team: teamSlug, env: environment };
	};

	const secrets = graphql(`
		query WorkloadSecrets($name: String!, $team: Slug!, $env: String!) @load {
			team(slug: $team) {
				slug
				environment(name: $env) {
					name
					workload(name: $name) {
						secrets {
							edges {
								node {
									id
									name
								}
							}
						}
					}
				}
			}
		}
	`);

	interface Props {
		environment: string;
		workload: string;
		teamSlug: string;
	}

	let { environment, workload, teamSlug }: Props = $props();
</script>

<GraphErrors errors={$secrets.errors} />

{#if $secrets.fetching}
	<Loader />
{:else if $secrets.data && $secrets.data.team.environment.workload.secrets.edges.length > 0}
	<Heading size="small" spacing>Secrets</Heading>
	<div>
		{#if $secrets.data.team.environment.workload.secrets.edges.length > 0}
			{#each $secrets.data.team.environment.workload.secrets.edges as secret (secret.node.id)}
				<a
					href="/team/{$secrets.data.team.slug}/{$secrets.data.team.environment.name}/secret/{secret
						.node.name}"><IconWithText icon={PadlockLockedIcon} text={secret.node.name} /></a
				>
			{/each}
		{/if}
	</div>
{/if}
