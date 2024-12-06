<script lang="ts">
	import { BucketIcon, SandboxIcon } from '@nais/ds-svelte-community/icons';
	import BigQuery from './icons/BigQuery.svelte';
	import Kafka from './icons/Kafka.svelte';
	import Opensearch from './icons/Opensearch.svelte';
	import PostgresStroke from './icons/PostgresStroke.svelte';

	interface Props {
		type: string;
		[key: string]: unknown;
	}

	let { type, ...rest }: Props = $props();
</script>

{#if type === 'Bucket'}
	<BucketIcon {...rest} />
{:else if type === 'BigQueryDataset'}
	<BigQuery {...rest} />
{:else if type === 'SqlInstance'}
	<PostgresStroke {...rest} />
{:else if type === 'Kafka'}
	<Kafka {...rest} />
{:else if type === 'OpenSearch'}
	<Opensearch {...rest} />
{:else if type === 'RedisInstance'}
	<SandboxIcon {...rest} />
{/if}
