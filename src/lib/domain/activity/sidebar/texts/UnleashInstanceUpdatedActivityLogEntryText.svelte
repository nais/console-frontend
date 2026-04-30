<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

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
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
