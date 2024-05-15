<script lang="ts">
	import { BucketIcon, SandboxIcon } from '@nais/ds-svelte-community/icons';
	import BigQuery from './icons/BigQuery.svelte';
	import Kafka from './icons/Kafka.svelte';
	import Opensearch from './icons/Opensearch.svelte';
	import PostgresStroke from './icons/PostgresStroke.svelte';

	export let type: string;
</script>

{#if type === 'Bucket'}
	<BucketIcon {...$$restProps} />
{:else if type === 'BigQueryDataset'}
	<BigQuery {...$$restProps} />
{:else if type === 'SqlInstance'}
	<PostgresStroke {...$$restProps} />
{:else if type === 'Kafka'}
	<Kafka {...$$restProps} />
{:else if type === 'OpenSearch'}
	<Opensearch {...$$restProps} />
{:else if type === 'Redis'}
	<SandboxIcon {...$$restProps} />
{:else if type === 'InfluxDb'}
	<SandboxIcon {...$$restProps} />
{/if}
