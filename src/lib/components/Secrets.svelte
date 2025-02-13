<script lang="ts">
	import { graphql } from '$houdini';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { BodyShort, Heading, Link, Loader } from '@nais/ds-svelte-community';
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

<div class="wrapper">
	<Heading level="3" size="small">Secrets</Heading>
	<GraphErrors errors={$secrets.errors} />

	{#if $secrets.fetching}
		<Loader />
	{:else if $secrets.data && $secrets.data.team.environment.workload.secrets.edges.length > 0}
		{#if $secrets.data.team.environment.workload.secrets.edges.length > 0}
			{#each $secrets.data.team.environment.workload.secrets.edges as secret (secret.node.id)}
				<Link
					href="/team/{$secrets.data.team.slug}/{$secrets.data.team.environment.name}/secret/{secret
						.node.name}"><IconWithText icon={PadlockLockedIcon} text={secret.node.name} /></Link
				>
			{/each}
		{/if}
	{:else}
		<BodyShort>No secrets referenced in nais.yaml.</BodyShort>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-1);
		align-items: start;
	}
</style>
