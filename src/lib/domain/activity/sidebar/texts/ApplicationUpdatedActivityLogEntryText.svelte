<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

	import { activityLogResourceLink } from '../../utils';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ApplicationUpdatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Application
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
	{#if data.applicationUpdatedData.changedFields.length > 0}
		{#each data.applicationUpdatedData.changedFields as field (field.field)}
			<strong>{field.field}</strong>
			{#if field.oldValue != null && field.newValue != null}
				changed from <i>{field.oldValue}</i> to <i>{field.newValue}</i>.
			{:else if field.oldValue == null && field.newValue != null}
				set to <i>{field.newValue}</i>.
			{:else if field.oldValue != null && field.newValue == null}
				removed (was <i>{field.oldValue}</i>).
			{:else}
				changed.
			{/if}
		{/each}
	{/if}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
