<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ConfigUpdatedActivityLogEntry' }
		>;
	} = $props();

	const formatFieldName = (field: string): string => {
		if (field.startsWith('value ')) {
			return 'key ' + field.slice('value '.length);
		}
		return field;
	};
</script>

<div>
	Updated config <strong>{data.resourceName}</strong>
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	{#if data.configUpdatedData.updatedFields.length > 0}
		{#each data.configUpdatedData.updatedFields as field (field)}
			<strong>{formatFieldName(field.field)}</strong>
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
