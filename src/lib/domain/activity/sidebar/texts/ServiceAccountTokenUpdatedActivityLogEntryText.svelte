<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ServiceAccountTokenUpdatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<BodyLong size="small">
		Token updated for service account
		<a href="/team/{data.teamSlug}/settings/service_accounts">{data.resourceName}</a>.
		{#if data.serviceAccountTokenUpdatedData.updatedFields.length > 0}
			{#each data.serviceAccountTokenUpdatedData.updatedFields as field (field.field)}
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
