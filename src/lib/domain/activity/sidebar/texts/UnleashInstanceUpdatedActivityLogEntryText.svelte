<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';

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
		Updated Unleash instance <a href="/team/{data.teamSlug}/unleash">{data.resourceName}</a>.
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
