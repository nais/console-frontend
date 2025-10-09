<script lang="ts">
	import type { ActivityLogEntryFragment$data } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			ActivityLogEntryFragment$data,
			{ __typename: 'TeamEnvironmentUpdatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	{data.message}
	{#if data.teamEnvironmentUpdated.updatedFields.length > 0}
		{#each data.teamEnvironmentUpdated.updatedFields as field (field)}
			{field.field}. Changed from {field.oldValue} to {field.newValue}.
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
