<script lang="ts">
	import type { JobRuns } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import JobRunListItem from '$lib/domain/list-items/JobRunListItem.svelte';
	import List from '$lib/ui/List.svelte';
	import { BodyShort, Heading } from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';

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
					teamEnvironment {
						environment {
							name
						}
					}
					name
					resources {
						requests {
							cpu
							memory
						}
						limits {
							cpu
							memory
						}
					}

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
</script>

<div>
	<Heading as="h4" size="small">Resources:</Heading>
	<ul class="resource-list">
		<li>
			Requests:
			<ul>
				<li>
					<div class="resource-list-item">
						<div>CPU:</div>
						<div class="data">
							<code>
								{#if $data.resources.requests.cpu}
									{$data.resources.requests.cpu?.toFixed(2)} CPUs
								{:else}
									0.2 CPUs (default)
								{/if}
							</code>
						</div>
					</div>
				</li>

				<li>
					<div class="resource-list-item">
						<div>Memory:</div>
						<div class="data">
							<code>
								{#if $data.resources.requests.memory}
									{prettyBytes($data.resources.requests.memory, {
										locale: 'en',
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
										binary: true
									})}
								{:else}
									{prettyBytes(268435456, {
										locale: 'en',
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
										binary: true
									})} (default)
								{/if}
							</code>
						</div>
					</div>
				</li>
			</ul>
		</li>
		<li>
			Limits:
			<ul>
				<li>
					<div class="resource-list-item">
						<div>CPU:</div>
						<div class="data">
							<code>
								{#if $data.resources.limits.cpu}
									{$data.resources.limits.cpu?.toFixed(2)} CPUs
								{:else}
									0.5 CPUs (default)
								{/if}
							</code>
						</div>
					</div>
				</li>

				<li>
					<div class="resource-list-item">
						<div>Memory:</div>
						<div class="data">
							<code>
								{#if $data.resources.limits.memory}
									{prettyBytes($data.resources.limits.memory, {
										locale: 'en',
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
										binary: true
									})}
								{:else}
									{prettyBytes(536870912, {
										locale: 'en',
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
										binary: true
									})} (default)
								{/if}
							</code>
						</div>
					</div>
				</li>
			</ul>
		</li>
	</ul>
</div>

{#if $data.runs.edges.length === 0}
	<BodyShort>No runs found</BodyShort>
{:else}
	<List title="{$data.runs.edges.length} job run{$data.runs.edges.length > 1 ? 's' : ''}">
		{#each $data.runs.edges as run (run.node.id)}
			{#if run.node.instances.pageInfo.totalCount > 0}
				<JobRunListItem
					run={run.node}
					urlBase="/team/{$data.team.slug}/{$data.teamEnvironment.environment
						.name}/job/{$data.name}/logs?instance="
				/>
			{:else}
				<JobRunListItem run={run.node} />
			{/if}
		{/each}
	</List>
{/if}

<style>
	ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	li ul {
		margin-left: 1rem;
	}

	.resource-list {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	.resource-list-item {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.data {
		text-align: right;
	}
	code {
		font-size: 1rem;
	}
</style>
