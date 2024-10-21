<script lang="ts">
	import { page } from '$app/stores';
	import { fragment, graphql, type AppPersistence } from '$houdini';
	import BigQuery from '$lib/icons/BigQuery.svelte';
	import Kafka from '$lib/icons/Kafka.svelte';
	import Opensearch from '$lib/icons/Opensearch.svelte';
	import Redis from '$lib/icons/Redis.svelte';
	import { BucketIcon, DatabaseIcon } from '@nais/ds-svelte-community/icons';

	export let app: AppPersistence;

	$: data = fragment(
		app,
		graphql(`
			fragment AppPersistence on Application {
				name
				bigQueryDatasets {
					edges {
						node {
							name
						}
					}
				}
				buckets {
					edges {
						node {
							name
						}
					}
				}
				kafkaTopicAcls {
					edges {
						node {
							teamName
							access
							topic {
								name
							}
							workload {
								name
								environment {
									name
								}
							}
						}
					}
				}
				openSearch {
					name
					access {
						edges {
							node {
								access
								workload {
									name
								}
							}
						}
					}
				}
				redisInstances {
					edges {
						node {
							name
						}
					}
				}
				sqlInstances {
					edges {
						node {
							name
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
	<div class="persistenceContent">
		{#if $data.buckets.edges.length > 0}
			<h5><BucketIcon />Buckets</h5>
			<ul>
				{#each $data.buckets.edges as bucket}
					<li>
						<a href={`/team/${team}/${env}/bucket/${bucket.node.name}`}>{bucket.node.name}</a>
					</li>
				{/each}
			</ul>
		{/if}
		{#if $data.bigQueryDatasets.edges.length > 0}
			<h5><BigQuery />BigQuery</h5>
			<ul>
				{#each $data.bigQueryDatasets.edges as bq}
					<li>
						<a href={`/team/${team}/${env}/bigquery/${bq.node.name}`}>{bq.node.name}</a>
					</li>
				{/each}
			</ul>
		{/if}
		{#if $data.sqlInstances.edges.length > 0}
			<h5><DatabaseIcon />Postgres</h5>
			<ul>
				{#each $data.sqlInstances.edges as sql}
					<li>
						<a href={`/team/${team}/${env}/postgres/${sql.node.name}`}>{sql.node.name}</a>
					</li>
				{/each}
			</ul>
		{/if}
		{#if $data.kafkaTopicAcls.edges.length > 0}
			<h5><Kafka />Kafka</h5>
			<ul>
				{#each $data.kafkaTopicAcls.edges as acl}
					<li>
						<a
							href={`/team/${acl.node.teamName}/${acl.node.workload?.environment.name === 'prod-fss' ? 'prod-gcp' : acl.node.workload?.environment.name === 'dev-fss' ? 'dev-gcp' : acl.node.workload?.environment.name}/kafka/${acl.node.topic.name}`}
							>{acl.node.topic.name}</a
						>
						<code>({acl.node.access})</code>
					</li>
				{/each}
			</ul>
		{/if}
		{#if $data.openSearch}
			<h5><Opensearch />OpenSearch</h5>
			<ul>
				<li>
					<a href={`/team/${team}/${env}/opensearch/${$data.openSearch.name}`}
						>{$data.openSearch.name}</a
					>
					{#each $data.openSearch.access.edges as access}
						{#if access.node.workload.name == $data.name}
							<code>({access.node.access})</code>
						{/if}
					{/each}
				</li>
			</ul>
		{/if}

		{#if $data.redisInstances.edges.length > 0}
			<h5><Redis />Redis</h5>
			<ul>
				{#each $data.redisInstances.edges as redis}
					<li>
						<a href={`/team/${team}/${env}/redis/${redis.node.name}`}>{redis.node.name}</a>
					</li>
				{/each}
			</ul>
		{/if}
		{#if $data.buckets.edges.length === 0 && $data.bigQueryDatasets.edges.length === 0 && $data.sqlInstances.edges.length === 0 && $data.kafkaTopicAcls.edges.length === 0 && !$data.openSearch && $data.redisInstances.edges.length === 0}
			No persistence resources found.
		{/if}
	</div>
</div>

<style>
	.persistence {
		display: block;
	}
	.persistenceContent {
		padding: 1rem 0;
	}
	h5 {
		display: flex;
		align-items: center;
		margin-top: 0px;
		align-self: start;
		gap: 0.5rem;
		font-size: 1.2rem;
	}
	ul {
		margin: 0;
		list-style: none;
	}
	code {
		font-size: 0.8rem;
	}
</style>
