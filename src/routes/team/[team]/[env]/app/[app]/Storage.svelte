<script lang="ts">
	import type { Storage } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import Bigquery from '$lib/icons/Bigquery.svelte';
	import Kafka from '$lib/icons/Kafka.svelte';
	import Opensearch from '$lib/icons/Opensearch.svelte';
	import Postgres from '$lib/icons/Postgres.svelte';
	import { Link, Skeleton } from '@nais/ds-svelte-community';
	import { BucketIcon } from '@nais/ds-svelte-community/icons';
	import { page } from '$app/stores';

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
						topics {
							name
							acl {
								access
								application
								team
							}
						}
					}
					... on OpenSearch {
						name
						access
					}
					... on Redis {
						name
						access
					}
					... on InfluxDb {
						name
					}
				}
			}
		`)
	);

	$: env = $page.params.env;
	$: team = $page.params.team;
</script>

<div class="storage">
	{#if $data?.storage.map((s) => s.__typename).includes(PendingValue)}
		<Skeleton variant="text" width="300px" />
	{/if}
	{#each $data?.storage || [] as storage}
		{#if storage.__typename === 'Bucket'}
			<div class="storageContent">
				<h5><BucketIcon />{storage.__typename}</h5>
				{storage.name}
			</div>
		{:else if storage.__typename === 'BigQueryDataset'}
			<div class="storageContent">
				<h5><Bigquery />{storage.__typename}</h5>
				{storage.name}
			</div>
		{:else if storage.__typename === 'SqlInstance'}
			<div class="storageContent">
				<h5><Postgres />Postgres</h5>
				<span><b>Instance:</b> <Link href="/team/{team}/{env}/postgres/{storage.name}">{storage.name}</Link></span>
				<span><b>Type:</b>  ({storage.type}) </span>
			</div>
		{:else if storage.__typename === 'Kafka'}
			<div class="storageContent">
				<h5><Kafka />{storage.__typename}</h5>
				<span
					><b>Pool:</b>
					{storage.name}</span
				>
				<span><b>Streams:</b> ({storage.streams})</span>
				{#if storage.topics.length !== 0}
					<h6>Topics:</h6>
					<ul>
						{#each storage.topics as topic}
							<li>
								<code style="font-size: 1rem"
									>{topic.name} -
									{#each topic.acl as acl}{acl.access}{/each}
								</code>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{:else if storage.__typename === 'OpenSearch'}
			<div class="storageContent">
				<h5><Opensearch />{storage.__typename}</h5>
				<span><b>Instance:</b> {storage.name}</span>
				<span><b>Access:</b> {storage.access}</span>
			</div>
		{:else if storage.__typename === 'Redis'}
			<div class="storageContent">
				<h5><!--Opensearch /-->{storage.__typename}</h5>

				<span><b>Instance:</b> {storage.name}</span>
				<span><b>Access:</b> {storage.access}</span>
			</div>
		{:else if storage.__typename === 'InfluxDb'}
			<div class="storageContent">
				<h5><!--Opensearch /-->{storage.__typename}</h5>
				<span><b>Instance:</b> {storage.name}</span>
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
	h6 {
		margin-bottom: 0;
		margin-top: 0.5rem;
		gap: 0.5rem;
		font-size: 1.1rem;
	}
	ul {
		margin-top: 0;
	}
</style>
