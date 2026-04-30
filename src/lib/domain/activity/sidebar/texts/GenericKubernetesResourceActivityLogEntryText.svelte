<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'GenericKubernetesResourceActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Applied {data.genericKubernetesData.kind.toLowerCase()}
	<strong>{data.resourceName}</strong>{data.environmentName ? ` in ${data.environmentName}` : ''}.
	{#if data.genericKubernetesData.changedFields.length > 0}
		{#each data.genericKubernetesData.changedFields as field (field.field)}
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
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
