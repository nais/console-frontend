<script lang="ts">
	import { graphql } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Heading, HelpText, Loader } from '@nais/ds-svelte-community';
	import type { AggregatedCostForApplicationsVariables } from './$houdini';
	import AggregatedCostForWorkloads from './AggregatedCostForWorkloads.svelte';

	export const _AggregatedCostForApplicationsVariables: AggregatedCostForApplicationsVariables =
		() => {
			return { team: teamSlug, totalCount: totalCount };
		};

	const costQuery = $derived(
		graphql(`
			query AggregatedCostForApplications($team: Slug!, $totalCount: Int) @load {
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
		`)
	);

	interface Props {
		teamSlug: string;
		totalCount: number;
	}

	let { teamSlug, totalCount }: Props = $props();
</script>

<GraphErrors errors={$costQuery.errors} />
<div>
	<div class="heading">
		<Heading size="small" level="3">Applications Cost</Heading>
		<HelpText title="Aggregated workloads cost"
			>Aggregated cost for workloads. Current month is estimated.</HelpText
		>
	</div>

	{#if $costQuery.fetching}
		<div class="loading">
			<Loader size="3xlarge" />
		</div>
	{:else if $costQuery.data && $costQuery.data.team.applications.nodes.length > 0}
		<AggregatedCostForWorkloads nodes={$costQuery.data.team.applications.nodes} />
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
		gap: var(--ax-space-8, --a-spacing-2);
		align-items: center;
	}
</style>
