<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { BodyShort } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';

	import { activityLogResourceLink } from '../../utils';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'SecretValuesViewedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Viewed secret values for
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
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	{#if data.secretValuesViewedData?.reason}
		<BodyShort size="small"><em>Reason: {data.secretValuesViewedData.reason}</em></BodyShort>
	{/if}

	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
