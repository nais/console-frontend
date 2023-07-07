<script lang="ts">
	import { PendingValue, fragment, graphql } from '$houdini';
	import type { JobStorage } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import Bigquery from '$lib/icons/Bigquery.svelte';
	import Bucket from '$lib/icons/Bucket.svelte';
	import Kafka from '$lib/icons/Kafka.svelte';
	import Opensearch from '$lib/icons/Opensearch.svelte';
	import Postgres from '$lib/icons/Postgres.svelte';

	export let job: JobStorage;
	$: data = fragment(
		job,
		graphql(`
			fragment JobStorage on NaisJob @loading {
				storage {
					... on Bucket {
						name
					}
					... on BigQueryDataset {
						name
					}
					... on SqlInstance {
						name
						type
					}
					... on Kafka {
						name
						streams
					}
					... on OpenSearch {
						name
						access
					}
				}
			}
		`)
	);
</script>

<div class="storage">
	{#if $data.storage.map((s) => s.__typename).includes(PendingValue)}
		<Loading width="300px" />
	{/if}
	{#each $data.storage as storage}
		{#if storage.__typename === 'Bucket'}
			<div class="storageContent">
				<h5><Bucket />{storage.__typename}</h5>
				{storage.name}
			</div>
		{:else if storage.__typename === 'BigQueryDataset'}
			<div class="storageContent">
				<h5><Bigquery />{storage.__typename}</h5>
				{storage.name}
			</div>
		{:else if storage.__typename === 'SqlInstance'}
			<div class="storageContent">
				<h5><Postgres />{storage.__typename}</h5>
				{storage.name} ({storage.type})
			</div>
		{:else if storage.__typename === 'Kafka'}
			<div class="storageContent">
				<h5><Kafka />{storage.__typename}</h5>
				<span
					><b>Pool:</b>
					{storage.name}</span
				>
				<span><b>Streams:</b> ({storage.streams})</span>
			</div>
		{:else if storage.__typename === 'OpenSearch'}
			<div class="storageContent">
				<h5><Opensearch />{storage.__typename}</h5>
				<span><b>Instance:</b> {storage.name}</span>
				<span><b>Access:</b> ({storage.access})</span>
			</div>
		{/if}
	{:else}
		<p>No storage</p>
	{/each}
</div>

<style>
	.storage {
		display: block;
	}
	.storageContent {
		display: flex;
		flex-direction: column;
		padding: 1rem 0;
		align-items: flex-start;
	}
	h5 {
		display: flex;
		align-items: center;
		margin-top: 0px;
		align-self: start;
		gap: 0.5rem;
		font-size: 1.2rem;
	}
</style>