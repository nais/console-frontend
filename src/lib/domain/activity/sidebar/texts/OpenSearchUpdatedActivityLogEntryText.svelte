<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import { activityLogResourceLink } from '../../utils';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'OpenSearchUpdatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	OpenSearch <a
		href={activityLogResourceLink(
			data.environmentName ?? '',
			data.resourceType,
			data.resourceName,
			data.teamSlug
		)}>{data.resourceName}</a
	>
	updated
	{#if data.environmentName}
		in <Tag size="small" variant={envTagVariant(data.environmentName)}>{data.environmentName}</Tag>
	{/if}.
	{#if data.opensearchData?.updatedFields.length > 0}
		{#each data.opensearchData.updatedFields as field (field)}
			<strong>{field.field}</strong> changed from <i>{field.oldValue}</i> to
			<i>{field.newValue}</i>.
		{/each}
	{/if}
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
