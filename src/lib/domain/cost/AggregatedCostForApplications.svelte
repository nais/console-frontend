<script lang="ts">
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { graphql as gql } from '$lib/urql/gql';
	import { Heading, HelpText, Loader } from '@nais/ds-svelte-community';
	import { queryStore } from '@urql/svelte';
	import AggregatedCostForWorkloads from './AggregatedCostForWorkloads.svelte';

	interface Props {
		teamSlug: string;
		totalCount: number;
	}

	let { teamSlug, totalCount }: Props = $props();

	const AggregatedCostForApplicationsQuery = gql(/* GraphQL */ `
		query AggregatedCostForApplications($team: Slug!, $totalCount: Int) {
			team(slug: $team) {
				slug
				applications(first: $totalCount) {
					nodes {
						cost {
							monthly {
								series {
									date
									sum
								}
							}
						}
					}
				}
			}
		}
	`);

	const client = getContextClient();

	const costQuery = $derived(
		queryStore({
			client,
			query: AggregatedCostForApplicationsQuery,
			variables: { team: teamSlug, totalCount },
			requestPolicy: 'cache-and-network'
		})
	);

	const result = $derived($costQuery);
</script>

<GraphErrors errors={result.error?.graphQLErrors ?? null} />
<div>
	<div class="heading">
		<Heading size="small" as="h3">Applications Cost</Heading>
		<HelpText title="Aggregated workloads cost"
			>Aggregated cost for workloads. Current month is estimated.</HelpText
		>
	</div>

	{#if result.fetching && !result.data}
		<div class="loading">
			<Loader size="3xlarge" />
		</div>
	{:else if result.data && result.data.team.applications.nodes.length > 0}
		<AggregatedCostForWorkloads nodes={result.data.team.applications.nodes} />
		<a href="/team/{teamSlug}/cost">See cost details</a>
	{/if}
</div>

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200px;
		width: 100%;
	}

	.heading {
		display: flex;
		gap: var(--ax-space-8);
		align-items: center;
	}
</style>
