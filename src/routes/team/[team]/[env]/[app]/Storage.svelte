<script lang="ts">
	import { PendingValue, fragment, graphql } from '$houdini';
	import type { Storage } from '$houdini';
	import Loading from '$lib/Loading.svelte';

	export let app: Storage;
	$: data = fragment(
		app,
		graphql(`
			fragment Storage on App @loading {
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
				<h5>{storage.__typename}</h5>
				{storage.name}
			</div>
		{:else if storage.__typename === 'BigQueryDataset'}
			<div class="storageContent">
				<h5>{storage.__typename}</h5>
				{storage.name}
			</div>
		{:else if storage.__typename === 'SqlInstance'}
			<div class="storageContent">
				<h5>{storage.__typename}</h5>
				{storage.name} ({storage.type})
			</div>
		{:else if storage.__typename === 'Kafka'}
			<div class="storageContent">
				<h5>{storage.__typename}</h5>
				Pool: {storage.name}<br /> Streams: ({storage.streams})
			</div>
		{:else if storage.__typename === 'OpenSearch'}
			<div class="storageContent">
				<h5>{storage.__typename}</h5>
				Instance: {storage.name}<br /> Access: ({storage.access})
			</div>
		{/if}
	{:else}
		<p>No storage</p>
	{/each}
</div>

<style>
	.storage {
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 2rem;
	}
	.storageContent {
		display: flex;
		flex-direction: column;
	}
	.storageContent,
	h5 {
		margin-top: 0px;
		align-self: start;
	}
</style>
