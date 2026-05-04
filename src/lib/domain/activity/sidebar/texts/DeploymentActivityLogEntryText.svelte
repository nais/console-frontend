<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

	import { activityLogResourceLink } from '../../utils';

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
	{#if triggerURL && data.environmentName}
		<a
			href="/team/{data.teamSlug}/{data.environmentName}/{workloadType}/{data.resourceName}/deploys?deployId={id}"
			>Deployed</a
		>
		{data.resourceName} to {data.environmentName}
	{:else}
		Deployed
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
		{#if data.environmentName}
			to {data.environmentName}
		{/if}
	{/if}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
