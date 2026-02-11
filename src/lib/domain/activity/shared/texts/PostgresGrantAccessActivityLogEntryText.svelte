<script lang="ts">
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'PostgresGrantAccessActivityLogEntry'>;
	} = $props();
</script>

<div>
	Granted access to {data.postgresGrantAccessData.grantee} on {data.resourceType.toLocaleLowerCase()}
	<strong>{data.resourceName}</strong>
	until <Time time={data.postgresGrantAccessData.until} dateFormat="dd/MM/yyyy HH:mm" />
	{#if data.environmentName}
		in <Tag size="small" variant={envTagVariant(data.environmentName)}>{data.environmentName}</Tag>
	{/if}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
