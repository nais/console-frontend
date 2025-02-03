<script lang="ts">
	import BigQueryIcon from '$lib/icons/BigQueryIcon.svelte';
	import KafkaIcon from '$lib/icons/KafkaIcon.svelte';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
	import RedisIcon from '$lib/icons/RedisIcon.svelte';
	import ValkeyIcon from '$lib/icons/ValkeyIcon.svelte';
	import { BucketIcon, DatabaseIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		instance: {
			readonly name: string;
			readonly __typename: string | null;
			readonly environment: {
				readonly name: string;
			};
			readonly team: {
				readonly slug: string;
			};
		};
		showIcon?: boolean;
	}

	let { instance, showIcon = false }: Props = $props();
</script>

{#if instance.__typename === 'BigQueryDataset'}
	<a href="/team/{instance.team.slug}/{instance.environment.name}/bigquery/{instance.name}">
		{#if showIcon}
			<BigQueryIcon />
		{/if}
		{instance.name}
	</a>
{:else if instance.__typename === 'Bucket'}
	<a href="/team/{instance.team.slug}/{instance.environment.name}/bucket/{instance.name}">
		{#if showIcon}
			<BucketIcon />
		{/if}
		{instance.name}
	</a>
{:else if instance.__typename === 'KafkaTopic'}
	{#if showIcon}
		<KafkaIcon />
	{/if}
	<a href="/team/{instance.team.slug}/{instance.environment.name}/kafka/{instance.name}"
		>{instance.name}</a
	>
{:else if instance.__typename === 'OpenSearch'}
	{#if showIcon}
		<OpenSearchIcon />
	{/if}
	<a href="/team/{instance.team.slug}/{instance.environment.name}/opensearch/{instance.name}"
		>{instance.name}</a
	>
{:else if instance.__typename === 'RedisInstance'}
	{#if showIcon}
		<RedisIcon />
	{/if}
	<a href="/team/{instance.team.slug}/{instance.environment.name}/redis/{instance.name}"
		>{instance.name}</a
	>
{:else if instance.__typename === 'SqlInstance'}
	{#if showIcon}
		<DatabaseIcon />
	{/if}
	<a href="/team/{instance.team.slug}/{instance.environment.name}/postgres/{instance.name}"
		>{instance.name}</a
	>
{:else if instance.__typename === 'ValkeyInstance'}
	{#if showIcon}
		<ValkeyIcon />
	{/if}
	<a href="/team/{instance.team.slug}/{instance.environment.name}/valkey/{instance.name}">
		{instance.name}
	</a>
{/if}
