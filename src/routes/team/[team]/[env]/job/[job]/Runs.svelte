<script lang="ts">
	import type { JobRuns } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import JobRunListItem from '$lib/domain/list-items/JobRunListItem.svelte';
	import List from '$lib/ui/List.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	interface Props {
		job: JobRuns;
		ondelete?: (runName: string) => void;
	}

	let { job, ondelete }: Props = $props();

	let data = $derived(
		fragment(
			job,
			graphql(`
				fragment JobRuns on Job {
					team {
						slug
					}
					teamEnvironment {
						environment {
							name
						}
					}
					name

					runs(first: 999) @list(name: "All_Runs") {
						edges {
							node {
								id
								name
								startTime
								completionTime
								duration
								instances {
									pageInfo {
										totalCount
									}
								}
								status {
									message
									state
								}
								trigger {
									type
									actor
								}
							}
						}
					}
				}
			`)
		)
	);

	let runEdges = $derived($data?.runs?.edges ?? []);
	let runCount = $derived(runEdges.length);
	let runTitle = $derived(`${runCount} job run${runCount > 1 ? 's' : ''}`);
</script>

{#if $data}
	{#if runCount === 0}
		<BodyShort>No runs found</BodyShort>
	{:else}
		<List title={runTitle}>
			{#each runEdges as run (run.node.id)}
				{#if run.node.instances.pageInfo.totalCount > 0}
					{#if $data.team?.slug && $data.teamEnvironment?.environment?.name && $data.name}
						<JobRunListItem
							run={run.node}
							urlBase="/team/{$data.team?.slug}/{$data.teamEnvironment?.environment
								.name}/job/{$data.name}/logs?instance="
							{ondelete}
						/>
					{:else}
						<JobRunListItem run={run.node} {ondelete} />
					{/if}
				{:else}
					<JobRunListItem run={run.node} {ondelete} />
				{/if}
			{/each}
		</List>
	{/if}
{/if}
