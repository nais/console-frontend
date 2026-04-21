<script lang="ts">
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { graphql as gql } from '$lib/urql/gql';
	import { BodyShort, Heading, Loader } from '@nais/ds-svelte-community';
	import { PadlockLockedIcon } from '@nais/ds-svelte-community/icons';
	import { queryStore } from '@urql/svelte';

	interface Props {
		environment: string;
		workload: string;
		teamSlug: string;
	}

	let { environment, workload, teamSlug }: Props = $props();

	const WorkloadSecretsQuery = gql(/* GraphQL */ `
		query WorkloadSecrets($name: String!, $team: Slug!, $env: String!) {
			team(slug: $team) {
				slug
				environment(name: $env) {
					environment {
						name
					}
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

	const client = getContextClient();

	const secrets = $derived(
		queryStore({
			client,
			query: WorkloadSecretsQuery,
			variables: { name: workload, team: teamSlug, env: environment },
			requestPolicy: 'cache-and-network'
		})
	);

	const result = $derived($secrets);
</script>

<div class="wrapper">
	<Heading as="h3" size="small">Secrets</Heading>
	<GraphErrors errors={result.error?.graphQLErrors ?? null} />

	{#if result.fetching && !result.data}
		<Loader />
	{:else if result.data && result.data.team.environment.workload.secrets.edges.length > 0}
		{#each result.data.team.environment.workload.secrets.edges as secret (secret.node.id)}
			<IconLabel
				label={secret.node.name}
				icon={PadlockLockedIcon}
				href="/team/{result.data.team.slug}/{result.data.team.environment.environment
					.name}/secret/{secret.node.name}"
			/>
		{/each}
	{:else}
		<BodyShort>No secrets referenced in nais.yaml.</BodyShort>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		align-items: start;
	}
</style>
