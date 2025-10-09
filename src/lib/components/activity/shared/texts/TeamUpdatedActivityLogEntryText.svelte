<script lang="ts">
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import type { ActivityLogEntry } from './types';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: ActivityLogEntry<'TeamUpdatedActivityLogEntry'>;
	} = $props();
</script>

<div>
	{data.message}
	{#if data.teamUpdated?.updatedFields.length}
		{#each data.teamUpdated?.updatedFields as field (field)}
			{field.field}. Changed from <i>{field.oldValue}</i> to <i>{field.newValue}</i>.
		{/each}
	{/if}

	{#if data.environmentName}
		<Tag size="small" variant={envTagVariant(data.environmentName)}>{data.environmentName}</Tag>
	{/if}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
