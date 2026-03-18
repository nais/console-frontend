<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ConfigUpdatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Updated config <strong>{data.resourceName}</strong>.
	{#if data.configUpdatedData.updatedFields.length > 0}
		{#each data.configUpdatedData.updatedFields as field (field)}
			<strong>{field.field}</strong> changed from <i>{field.oldValue}</i> to
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
