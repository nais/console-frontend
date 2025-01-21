<script lang="ts">
	import { BucketIcon } from '@nais/ds-svelte-community/icons';
	import BigQuery from './icons/BigQuery.svelte';
	import Kafka from './icons/Kafka.svelte';
	import Opensearch from './icons/Opensearch.svelte';
	import PostgresStroke from './icons/PostgresStroke.svelte';
	import Redis from './icons/Valkey.svelte';
	import Valkey from './icons/Valkey.svelte';

	interface Props {
		type: string;
		size: string;
		[key: string]: unknown;
	}

	let { type, size = '24px', ...rest }: Props = $props();
</script>

{#if type === 'Bucket'}
	<BucketIcon width={size} height={size} {...rest} />
{:else if type === 'BigQueryDataset'}
	<BigQueryIcon {size} {...rest} />
{:else if type === 'SqlInstance'}
	<DatabaseIcon width={size} height={size} {...rest} />
{:else if type === 'KafkaTopic'}
	<KafkaIcon {size} {...rest} />
{:else if type === 'OpenSearch'}
	<OpenSearchIcon {size} {...rest} />
{:else if type === 'RedisInstance'}
	<Redis {...rest} />
{:else if type === 'ValkeyInstance'}
	<Valkey {...rest} />
{/if}
