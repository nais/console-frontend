<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Meta from '../../Meta.svelte';
	import { activityLogResourceLink } from '../../utils';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ApplicationScaledActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Workload
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
	scaled {data.appScaled.direction} to {data.appScaled.newSize} replicas
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.

	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
