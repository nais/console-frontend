<script lang="ts">
	import { BucketIcon, DatabaseIcon } from '@nais/ds-svelte-community/icons';
	import BigQueryIcon from './icons/BigQueryIcon.svelte';
	import KafkaIcon from './icons/KafkaIcon.svelte';
	import OpenSearchIcon from './icons/OpenSearchIcon.svelte';
	import RedisIcon from './icons/RedisIcon.svelte';
	import UnleashIcon from './icons/UnleashIcon.svelte';
	import ValkeyIcon from './icons/ValkeyIcon.svelte';

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
	<RedisIcon {size} {...rest} />
{:else if type === 'ValkeyInstance'}
	<ValkeyIcon {size} {...rest} />
{:else if type === 'UnleashInstance'}
	<UnleashIcon {size} {...rest} />
{/if}
