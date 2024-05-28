<script lang="ts">
	import { page } from '$app/stores';
	import type { Persistence, Persistence$data } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import BigQuery from '$lib/icons/BigQuery.svelte';
	import Kafka from '$lib/icons/Kafka.svelte';
	import Opensearch from '$lib/icons/Opensearch.svelte';
	import Redis from '$lib/icons/Redis.svelte';
	import { Link, Skeleton } from '@nais/ds-svelte-community';
	import { BucketIcon, DatabaseIcon } from '@nais/ds-svelte-community/icons';

	export let app: Persistence;
	$: data = fragment(
		app,
		graphql(`
			fragment Persistence on App @loading(cascade: true) {
				id
				persistence {
					name
					__typename

					... on SqlInstance {
						type
					}

					... on OpenSearch {
						openSearchInstanceAccess: access {
							role
						}
					}
					... on Redis {
						redisInstanceAccess: access {
							role
						}
					}
				}
			}
		`)
	);

	$: env = $page.params.env;
	$: team = $page.params.team;

	const toTypedData = (data: Persistence$data) => {
		if (data && data.id !== PendingValue) {
			return Object.groupBy(data.persistence, (p) => p.__typename as string);
		}
		return {};
	};
</script>

<div class="persistence">
	{#if $data && $data.id === PendingValue}
		<Skeleton variant="text" width="300px" />
	{:else}
		{@const resourceMap = toTypedData($data)}
		{#each Object.keys(resourceMap) as key}
			<div class="persistenceContent">
				{#if key === 'Bucket'}
					<h5><BucketIcon />{key}</h5>
					{#each resourceMap[key] || [] as item}
						<Link href={`/team/${team}/${env}/bucket/${item.name}`}>{item.name}</Link>
					{/each}
				{:else if key === 'BigQueryDataset'}
					<h5><BigQuery />{key}</h5>
					{#each resourceMap[key] || [] as item}
						<Link href={`/team/${team}/${env}/bigquery/${item.name}`}>{item.name}</Link>
					{/each}
				{:else if key === 'SqlInstance'}
					<h5><DatabaseIcon />Postgres</h5>
					{#each resourceMap[key] || [] as item}
						<Link href={`/team/${team}/${env}/postgres/${item.name}`}>{item.name}</Link>
					{/each}
				{:else if key === 'KafkaTopic'}
					<h5><Kafka />{key}</h5>
					{#each resourceMap[key] || [] as item}
						<Link href={`/team/${team}/${env}/kafka/${item.name}`}>{item.name}</Link>
					{/each}
				{:else if key === 'OpenSearch'}
					<h5><Opensearch />{key}</h5>
					{#each resourceMap[key] || [] as item}
						<Link href={`/team/${team}/${env}/opensearch/${item.name}`}>{item.name}</Link>
					{/each}
				{:else if key === 'Redis'}
					<h5><Redis />{key}</h5>
					{#each resourceMap[key] || [] as item}
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
