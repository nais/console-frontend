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

	const AggregatedCostForJobsQuery = gql(/* GraphQL */ `
		query AggregatedCostForJobs($team: Slug!, $totalCount: Int) {
			team(slug: $team) {
				slug
				jobs(first: $totalCount) {
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
			query: AggregatedCostForJobsQuery,
			variables: { team: teamSlug, totalCount },
			requestPolicy: 'cache-and-network'
		})
	);

	const result = $derived($costQuery);
</script>

<GraphErrors errors={result.error?.graphQLErrors ?? null} />
<div class="wrapper">
	<div class="heading">
		<Heading as="h3" size="small">Jobs Cost</Heading>

		<HelpText title="Aggregated jobs cost"
			>Aggregated cost for jobs. Current month is estimated.</HelpText
		>
	</div>
	{#if result.fetching && !result.data}
		<div class="loading">
			<Loader size="3xlarge" />
		</div>
	{:else if result.data && result.data.team.jobs.nodes.length > 0}
		<AggregatedCostForWorkloads nodes={result.data.team.jobs.nodes} />
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: var(--ax-space-4);
	}

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
