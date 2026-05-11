<script lang="ts">
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'TeamEnvironmentUpdatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<BodyLong size="small">
		Updated team <strong>{data.resourceName}</strong>
		{#if data.environmentName}
			in {data.environmentName}
		{/if}.
		{#if data.teamEnvironmentUpdatedData.updatedFields.length > 0}
			{#each data.teamEnvironmentUpdatedData.updatedFields as field (field)}
				<strong>{field.field}</strong> changed from <i>{field.oldValue}</i> to
				<i>{field.newValue}</i>.
			{/each}
		{/if}
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
