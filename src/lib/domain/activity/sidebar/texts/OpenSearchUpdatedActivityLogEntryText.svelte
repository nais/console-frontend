<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

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
	OpenSearch
	{#if data.environmentName}
		<a
			href={activityLogResourceLink(
				data.environmentName,
				data.resourceType,
				data.resourceName,
				data.teamSlug
			)}>{data.resourceName}</a
		>
	{:else}
		{data.resourceName}
	{/if}
	updated
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	{#if data.opensearchData?.updatedFields.length > 0}
		{#each data.opensearchData.updatedFields as field (field)}
			<strong>{field.field}</strong> changed from <i>{field.oldValue}</i> to
			<i>{field.newValue}</i>.
		{/each}
	{/if}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
