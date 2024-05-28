<script lang="ts">
	import { page } from '$app/stores';
	import type { JobPersistence } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import BigQuery from '$lib/icons/BigQuery.svelte';
	import Bucket from '$lib/icons/Bucket.svelte';
	import Kafka from '$lib/icons/Kafka.svelte';
	import Opensearch from '$lib/icons/Opensearch.svelte';
	import Postgres from '$lib/icons/Postgres.svelte';
	import { Link, Skeleton } from '@nais/ds-svelte-community';

	export let job: JobPersistence;
	$: data = fragment(
		job,
		graphql(`
			fragment JobPersistence on NaisJob @loading {
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
						pool
						acl {
							access
							application
							team
						}
					}

					... on OpenSearch {
						name
						openSearchInstanceAccess: access {
							role
						}
					}
					... on Redis {
						name
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
</script>

<div class="persistence">
	{#if $data.persistence.map((s) => s.__typename).includes(PendingValue)}
		<Skeleton variant="text" width="300px" />
	{/if}
	{#each $data.persistence as persistence}
		{#if persistence.__typename === 'Bucket'}
			<div class="persistenceContent">
				<h5><Bucket />{persistence.__typename}</h5>
				{persistence.name}
			</div>
		{:else if persistence.__typename === 'BigQueryDataset'}
			<div class="persistenceContent">
				<h5><BigQuery />{persistence.__typename}</h5>
				{persistence.name}
			</div>
		{:else if persistence.__typename === 'SqlInstance'}
			<div class="persistenceContent">
				<h5><Postgres />{persistence.__typename}</h5>
				<span
					><b>Instance:</b>
					<Link href="/team/{team}/{env}/postgres/{persistence.name}">{persistence.name}</Link
					></span
				>
				<span><b>Type:</b> ({persistence.type}) </span>
			</div>
		{:else if persistence.__typename === 'KafkaTopic'}
			<div class="persistenceContent">
				<h5><Kafka />{persistence.__typename}</h5>
				<span
					><b>Pool:</b>
					{persistence.pool}</span
				>
				<h6>Topic:</h6>
				{persistence.name}
				{#if persistence.acl.length}
					<h6>ACL</h6>
					<ul>
						{#each persistence.acl as acl}
							<li>{acl.access} / {acl.application} / {acl.team}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{:else if persistence.__typename === 'OpenSearch'}
			<div class="persistenceContent">
				<h5><Opensearch />{persistence.__typename}</h5>
				<span><b>Instance:</b> {persistence.name}</span>
				<span><b>Access:</b> ({persistence.access})</span>
			</div>
		{:else if persistence.__typename === 'Redis'}
			<div class="persistenceContent">
				<h5><!--Opensearch /-->{persistence.__typename}</h5>

				<span><b>Instance:</b> {persistence.name}</span>
				<span><b>Access:</b> {persistence.redisInstanceAccess}</span>
			</div>
		{/if}
	{:else}
		<p>No persistence</p>
	{/each}
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
