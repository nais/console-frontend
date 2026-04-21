<script lang="ts">
	import type { SidebarActivityLogEntry } from './types';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/ui/Time.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: SidebarActivityLogEntry<'ClusterAuditActivityLogEntry'>;
	} = $props();
</script>

<div>
	{capitalizeFirstLetter(data.message.toLowerCase())}
	in
	<Tag size="small" variant={envTagVariant(data.environmentName || '')}>{data.environmentName}</Tag>

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
