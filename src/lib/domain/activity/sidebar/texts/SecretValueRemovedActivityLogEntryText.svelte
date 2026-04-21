<script lang="ts">
	import type { SidebarActivityLogEntry } from './types';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: SidebarActivityLogEntry<'SecretValueRemovedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Value <strong>{data.secretValueRemovedData.valueName}</strong> removed from secret
	<strong>{data.resourceName}</strong>
	{#if data.environmentName}
		in <Tag size="small" variant={envTagVariant(data.environmentName)}>{data.environmentName}</Tag>
	{/if}.
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
