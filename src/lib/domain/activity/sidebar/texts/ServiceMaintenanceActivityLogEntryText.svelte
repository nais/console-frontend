<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

	import { activityLogResourceLink } from '../../utils';
	import { resourceTypeToText } from './utils';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ServiceMaintenanceActivityLogEntry' }
		>;
	} = $props();

	const link = $derived(
		data.environmentName
			? activityLogResourceLink(
					data.environmentName,
					data.resourceType,
					data.resourceName,
					data.teamSlug
				)
			: null
	);
</script>

<div>
	Started maintenance on {resourceTypeToText(data.resourceType)}
	{#if link}
		<a href={link}><strong>{data.resourceName}</strong></a>
	{:else}
		<strong>{data.resourceName}</strong>
	{/if}
	{#if data.environmentName}
		in {data.environmentName}
	{/if}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
