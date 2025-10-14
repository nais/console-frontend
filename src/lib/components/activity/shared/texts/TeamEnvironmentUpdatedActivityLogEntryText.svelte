<script lang="ts">
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'TeamEnvironmentUpdatedActivityLogEntry'>;
	} = $props();
</script>

<div>
	{data.message}.
	{#if data.teamEnvironmentUpdated.updatedFields.length > 0}
		{#each data.teamEnvironmentUpdated.updatedFields as field (field)}
			<strong>{field.field}</strong>: Changed from <i>{field.oldValue}</i> to
			<i>{field.newValue}</i>.
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
