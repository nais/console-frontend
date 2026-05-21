<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ServiceAccountUpdatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<BodyLong size="small">
		Service account <strong>{data.resourceName}</strong> updated.
		{#if data.serviceAccountUpdatedData.updatedFields.length > 0}
			{#each data.serviceAccountUpdatedData.updatedFields as field (field.field)}
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
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
