<script lang="ts">
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'UnleashInstanceUpdatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<BodyLong size="small">
		Updated Unleash instance <strong>{data.resourceName}</strong>.
		{#if data.unleashInstanceUpdatedData.allowedTeamSlug}
			Allowed <a href="/team/{data.unleashInstanceUpdatedData.allowedTeamSlug}"
				>{data.unleashInstanceUpdatedData.allowedTeamSlug}</a
			>
			to access the instance.
		{:else if data.unleashInstanceUpdatedData.revokedTeamSlug}
			Revoked access for <a href="/team/{data.unleashInstanceUpdatedData.revokedTeamSlug}"
				>{data.unleashInstanceUpdatedData.revokedTeamSlug}</a
			>
			to the instance.
		{:else if data.unleashInstanceUpdatedData.updatedReleaseChannel}
			Changed release channel to <strong
				>{data.unleashInstanceUpdatedData.updatedReleaseChannel}</strong
			>.
		{/if}
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
