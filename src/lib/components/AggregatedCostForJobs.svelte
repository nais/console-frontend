<script lang="ts">
	import { graphql } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Heading, HelpText } from '@nais/ds-svelte-community';
	import type { AggregatedCostForJobsVariables } from './$houdini';
	import AggregatedCostForWorkloads from './AggregatedCostForWorkloads.svelte';

	export const _AggregatedCostForJobsVariables: AggregatedCostForJobsVariables = () => {
		return { team: teamSlug, totalCount: totalCount };
	};

	const costQuery = graphql(`
		query AggregatedCostForJobs($team: Slug!, $totalCount: Int) @load {
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

	interface Props {
		teamSlug: string;
		totalCount: number;
	}

	let { teamSlug, totalCount }: Props = $props();
</script>

<GraphErrors errors={$costQuery.errors} />
<div class="wrapper">
	<div class="heading">
		<Heading level="3">Jobs cost</Heading>

		<HelpText title="Aggregated jobs cost"
			>Aggregated cost for jobs. Current month is estimated.</HelpText
		>
	</div>
	{#if $costQuery.data && $costQuery.data.team.jobs.nodes.length > 0}
		<AggregatedCostForWorkloads nodes={$costQuery.data.team.jobs.nodes} />
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: var(--a-spacing-1);
	}

	.heading {
		display: flex;
		gap: var(--a-spacing-2);
		align-items: center;
	}
</style>
