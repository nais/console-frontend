<script lang="ts">
	import JobRunListItem from '$lib/domain/list-items/JobRunListItem.svelte';
	import List from '$lib/ui/List.svelte';
	import { useFragment, type FragmentType } from '$lib/urql/fragment';
	import { BodyShort, Heading } from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';
	import { JobRunsFragment } from './runs';

	interface Props {
		job: FragmentType<typeof JobRunsFragment>;
		ondelete?: (runName: string) => void;
	}

	let { job, ondelete }: Props = $props();

	const data = $derived(useFragment(JobRunsFragment, job));

	let runEdges = $derived(data?.runs?.edges ?? []);
	let runCount = $derived(runEdges.length);
	let runTitle = $derived(`${runCount} job run${runCount > 1 ? 's' : ''}`);
</script>

{#if data}
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
									{#if data.resources?.requests?.cpu}
										{data.resources?.requests?.cpu?.toFixed(2)} CPUs
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
									{#if data.resources?.requests?.memory}
										{prettyBytes(data.resources?.requests?.memory, {
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
									{#if data.resources?.limits?.cpu}
										{data.resources?.limits?.cpu?.toFixed(2)} CPUs
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
									{#if data.resources?.limits?.memory}
										{prettyBytes(data.resources?.limits?.memory, {
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

	{#if runCount === 0}
		<BodyShort>No runs found</BodyShort>
	{:else}
		<List title={runTitle}>
			{#each runEdges as run (run.node.id)}
				{#if run.node.instances.pageInfo.totalCount > 0}
					{#if data.team?.slug && data.teamEnvironment?.environment?.name && data.name}
						<JobRunListItem
							run={run.node}
							urlBase="/team/{data.team?.slug}/{data.teamEnvironment?.environment
								.name}/job/{data.name}/logs?instance="
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
