<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';

	import { activityLogResourceLink } from '../../utils';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'SecretValueAddedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<BodyLong size="small">
		Value
		<span class="valueName">{data.secretValueAddedData.valueName}</span> added to secret
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
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>

<style>
	.valueName {
		font-weight: bold;
		word-break: break-all;
	}
</style>
