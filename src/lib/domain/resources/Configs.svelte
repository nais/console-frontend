<script lang="ts">
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { graphql as gql } from '$lib/urql/gql';
	import { BodyShort, Heading, Loader } from '@nais/ds-svelte-community';
	import { FileTextIcon } from '@nais/ds-svelte-community/icons';
	import { queryStore } from '@urql/svelte';

	interface Props {
		environment: string;
		workload: string;
		teamSlug: string;
	}

	let { environment, workload, teamSlug }: Props = $props();

	const WorkloadConfigsQuery = gql(/* GraphQL */ `
		query WorkloadConfigs($name: String!, $team: Slug!, $env: String!) {
			team(slug: $team) {
				slug
				environment(name: $env) {
					environment {
						name
					}
					workload(name: $name) {
						configs {
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

	const configs = $derived(
		queryStore({
			client,
			query: WorkloadConfigsQuery,
			variables: { name: workload, team: teamSlug, env: environment },
			requestPolicy: 'cache-and-network'
		})
	);

	const result = $derived($configs);
</script>

<div class="wrapper">
	<Heading as="h3" size="small">Configs</Heading>
	<GraphErrors errors={result.error?.graphQLErrors ?? null} />

	{#if result.fetching && !result.data}
		<Loader />
	{:else if result.data && result.data.team.environment.workload.configs.edges.length > 0}
		{#each result.data.team.environment.workload.configs.edges as config (config.node.id)}
			<IconLabel
				label={config.node.name}
				icon={FileTextIcon}
				href="/team/{result.data.team.slug}/{result.data.team.environment.environment
					.name}/config/{config.node.name}"
			/>
		{/each}
	{:else}
		<BodyShort>No configs referenced in nais.yaml.</BodyShort>
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
