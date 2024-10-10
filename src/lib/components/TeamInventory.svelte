<script lang="ts">
	import { graphql, PendingValue } from '$houdini';
	import { Skeleton } from '@nais/ds-svelte-community';
	import type { TeamResourceInventoryVariables } from './$houdini';
	import { ArrowCirclepathIcon, BucketIcon, SandboxIcon } from '@nais/ds-svelte-community/icons';
	import PostgresStroke from '$lib/icons/PostgresStroke.svelte';
	import Kafka from '$lib/icons/Kafka.svelte';
	import Redis from '$lib/icons/Redis.svelte';
	import BigQuery from '$lib/icons/BigQuery.svelte';

	export let teamName: string;

	export const _TeamResourceInventoryVariables: TeamResourceInventoryVariables = () => {
		return { team: teamName };
	};

	const inventory = graphql(`
		query TeamResourceInventory($team: Slug!) @cache(policy: NetworkOnly) @load {
			team(slug: $team) @loading(cascade: true) {
				id @loading
				resourceInventory {
					totalApps
					totalJobs
					totalSqlInstances
					totalBuckets
					totalKafkaTopics
					totalRedisInstances
					totalBigQueryDatasets
					isEmpty
				}
			}
		}
	`);

	$: team = $inventory.data?.team;
</script>

<h4>Inventory</h4>
{#if team && team.id !== PendingValue}
	{#if team.resourceInventory.totalApps > 0}
		<p>
			<SandboxIcon {...$$restProps} />
			<a href="/team/{teamName}/applications">
				{team.resourceInventory.totalApps} app{team.resourceInventory.totalApps > 1 ? 's' : ''}</a
			>
		</p>
	{/if}
	{#if team.resourceInventory.totalJobs > 0}
		<p>
			<ArrowCirclepathIcon {...$$restProps} />
			<a href="/team/{teamName}/jobs"
				>{team.resourceInventory.totalJobs} job{team.resourceInventory.totalJobs > 1 ? 's' : ''}</a
			>
		</p>
	{/if}
	{#if team.resourceInventory.totalSqlInstances > 0}
		<p>
			<PostgresStroke {...$$restProps} />
			<a href="/team/{teamName}/postgres">{team.resourceInventory.totalSqlInstances} postgres</a>
		</p>
	{/if}
	{#if team.resourceInventory.totalBuckets > 0}
		<p>
			<BucketIcon {...$$restProps} />
			<a href="/team/{teamName}/buckets"
				>{team.resourceInventory.totalBuckets}
				bucket{team.resourceInventory.totalBuckets > 1 ? 's' : ''}</a
			>
		</p>
	{/if}
	{#if team.resourceInventory.totalKafkaTopics > 0}
		<p>
			<Kafka {...$$restProps} />
			<a href="/team/{teamName}/kafka"
				>{team.resourceInventory.totalKafkaTopics} kafka topic{team.resourceInventory
					.totalKafkaTopics > 1
					? 's'
					: ''}</a
			>
		</p>
	{/if}
	{#if team.resourceInventory.totalRedisInstances > 0}
		<p>
			<Redis {...$$restProps} />
			<a href="/team/{teamName}/redis"
				>{team.resourceInventory.totalRedisInstances} redis instance{team.resourceInventory
					.totalRedisInstances > 1
					? 's'
					: ''}</a
			>
		</p>
	{/if}
	{#if team.resourceInventory.totalBigQueryDatasets > 0}
		<p>
			<BigQuery {...$$restProps} />
			<a href="/team/{teamName}/bigquery"
				>{team.resourceInventory.totalBigQueryDatasets} bigquery dataset{team.resourceInventory
					.totalBigQueryDatasets > 1
					? 's'
					: ''}</a
			>
		</p>
	{/if}
	{#if team.resourceInventory.isEmpty}
		<p>No resources</p>
	{/if}
{:else}
	<Skeleton variant="text" width="100px" />
	<Skeleton variant="text" width="120px" />
{/if}

<style>
</style>
