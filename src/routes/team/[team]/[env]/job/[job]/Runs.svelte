<script lang="ts">
	import type { JobRuns } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import JobRunListItem from '$lib/components/list/JobRunListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	interface Props {
		job: JobRuns;
	}

	let { job }: Props = $props();

	let data = $derived(
		fragment(
			job,
			graphql(`
				fragment JobRuns on Job {
					team {
						slug
					}
					name
					environment {
						name
					}
					runs(first: 20) @list(name: "All_Runs") {
						edges {
							node {
								id
								name
								startTime
								completionTime
								duration
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
</script>

{#if $data.runs.edges.length === 0}
	<BodyShort>No runs found</BodyShort>
{:else}
	<List title="{$data.runs.edges.length} job run{$data.runs.edges.length > 1 ? 's' : ''}">
		{#each $data.runs.edges as run (run.node.id)}
			<JobRunListItem
				run={run.node}
				urlBase="/team/{$data.team.slug}/{$data.environment.name}/job/{$data.name}/logs?name="
			/>
		{/each}
	</List>
{/if}
