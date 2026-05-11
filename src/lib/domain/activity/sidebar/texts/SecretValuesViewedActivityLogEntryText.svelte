<script lang="ts">
	import { BodyLong } from '@nais/ds-svelte-community';
	import type { SidebarActivityLogFragment$data } from '$houdini';
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
	<BodyLong size="small">
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
			<em>Reason: {data.secretValuesViewedData.reason}</em>
		{/if}
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
