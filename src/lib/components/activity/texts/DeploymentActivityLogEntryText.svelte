<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'DeploymentActivityLogEntry' }
		>;
	} = $props();

	const triggerURL = $derived(data.deploymentData?.triggerURL || '');
	const id = $derived(triggerURL.split('/').at(-1) ?? '');

	const workloadType = $derived(data.resourceType === 'JOB' ? 'job' : 'app');
</script>

<div>
	{#if triggerURL}
		<a
			href="/team/{data.teamSlug}/{data.environmentName}/{workloadType}/{data.resourceName}/deploys?deployId={id}"
			>Deployed</a
		>
		{data.resourceName}
	{:else}
		Deployment
	{/if}
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
