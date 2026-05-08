<script lang="ts">
	import { graphql, PendingValue } from '$houdini';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import SurfaceCardAction from '$lib/ui/SurfaceCardAction.svelte';
	import { Loader } from '@nais/ds-svelte-community';
	import AggregatedCostForWorkloads from './AggregatedCostForWorkloads.svelte';

	const costQuery = graphql(`
		query AggregatedCostForJobs($team: Slug!, $totalCount: Int) {
			team(slug: $team) @loading {
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

	$effect(() => {
		costQuery.fetch({
			variables: {
				team: teamSlug,
				totalCount: totalCount
			}
		});
	});

	interface Props {
		teamSlug: string;
		totalCount: number;
	}

	let { teamSlug, totalCount }: Props = $props();
</script>

<GraphErrors errors={$costQuery.errors} />
<div>
	{#if $costQuery.data && $costQuery.data.team !== PendingValue}
		{#if $costQuery.data.team.jobs.nodes.length > 0}
			<AggregatedCostForWorkloads nodes={$costQuery.data.team.jobs.nodes} />
			<SurfaceCardAction href="/team/{teamSlug}/cost" label="See cost details" />
		{/if}
	{:else}
		<div class="loading">
			<Loader size="3xlarge" />
		</div>
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
</style>
