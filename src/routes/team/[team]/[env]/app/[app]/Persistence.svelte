<script lang="ts">
	import { page } from '$app/stores';
	import type { Persistence, Persistence$data } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import BigQuery from '$lib/icons/BigQuery.svelte';
	import Kafka from '$lib/icons/Kafka.svelte';
	import Opensearch from '$lib/icons/Opensearch.svelte';
	import Postgres from '$lib/icons/Postgres.svelte';
	import Redis from '$lib/icons/Redis.svelte';
	import { Link, Skeleton } from '@nais/ds-svelte-community';
	import { BucketIcon } from '@nais/ds-svelte-community/icons';
	import persistence from '$houdini/artifacts/Persistence';

	export let app: Persistence;
	$: data = fragment(
		app,
		graphql(`
			fragment Persistence on App @loading {
				persistence {
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
					... on KafkaTopic {
						name
					}
					... on OpenSearch {
						name
						access
					}
					... on Redis {
						name
						access
					}
				}
			}
		`)
	);
	type PersistenceTypes =
		| 'Bucket'
		| 'BigQueryDataset'
		| 'SqlInstance'
		| 'KafkaTopic'
		| 'OpenSearch'
		| 'Redis'
		| 'unknown'
		| "non-exhaustive; don't match this";

	$: env = $page.params.env;
	$: team = $page.params.team;

	const toTypedData = (data): Persistence$data | Record<string, never> => {
		if (data) {
			return Object.groupBy(data, (p: Persistence$data) => (p ? p.__typename : 'unknown'));
		}
		return {};
	};
</script>

<div class="persistence">
	{#if $data?.persistence.map((s) => s.__typename).includes(PendingValue)}
		<Skeleton variant="text" width="300px" />
	{:else}
		{#each Object.keys(toTypedData($data.persistence)) as key}
			{@const resourceMap = toTypedData($data.persistence)}

			<div class="persistenceContent">
				{#if key === 'Bucket'}
					<h5><BucketIcon />{key}</h5>
					{#each resourceMap[key] as item}
						<Link href={`/team/${team}/${env}/bucket/${item.name}`}>{item.name}</Link>
					{/each}
				{:else if key === 'BigQueryDataset'}
					<h5><BigQuery />{key}</h5>
					{#each resourceMap[key] as item}
						<Link href={`/team/${team}/${env}/bigquery/${item.name}`}>{item.name}</Link>
					{/each}
				{:else if key === 'SqlInstance'}
					<h5><Postgres />Postgres</h5>
					{#each resourceMap[key] as item}
						<Link href={`/team/${team}/${env}/postgres/${item.name}`}>{item.name}</Link>
					{/each}
				{:else if key === 'KafkaTopic'}
					<h5><Kafka />{key}</h5>
					{#each resourceMap[key] as item}
						<Link href={`/team/${team}/${env}/kafka/${item.name}`}>{item.name}</Link>
					{/each}
				{:else if key === 'OpenSearch'}
					<h5><Opensearch />{key}</h5>
					{#each resourceMap[key] as item}
						<Link href={`/team/${team}/${env}/opensearch/${item.name}`}>{item.name}</Link>
					{/each}
				{:else if key === 'Redis'}
					<h5><Redis />{key}</h5>
					{#each resourceMap[key] as item}
						<Link href={`/team/${team}/${env}/redis/${item.name}`}>{item.name}</Link>
					{/each}
				{/if}
			</div>
		{:else}
			<p>No persistence</p>
		{/each}
	{/if}
</div>

<style>
	.persistence {
		display: block;
	}
	.persistenceContent {
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
