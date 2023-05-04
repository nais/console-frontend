<script lang="ts">
	import { fragment, graphql } from '$houdini';
	import type { Storage } from '$houdini';

	export let app: Storage;
	$: data = fragment(
		app,
		graphql(`
			fragment Storage on App {
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
						tier
						databases {
							name
							envVarPrefix
							users {
								name
							}
						}
					}
				}
			}
		`)
	);
</script>

<div class="storage">
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
