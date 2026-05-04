<script lang="ts">
	import Meta from './Meta.svelte';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<'DeploymentActivityLogEntry'>;
	} = $props();

	const triggerURL = $derived(data.deploymentData?.triggerURL || '');
	const id = $derived(triggerURL.split('/').at(-1) ?? '');
	const workloadType = $derived(data.resourceType === 'JOB' ? 'job' : 'app');
	const detailsHref = $derived(
		id && data.teamSlug && data.environmentName
			? `/team/${data.teamSlug}/${data.environmentName}/${workloadType}/${data.resourceName}/deploys?deployId=${id}`
			: null
	);
</script>

<div>
	{#if detailsHref}
		<a href={detailsHref}>Deployed</a>
	{:else}
		Deployed
	{/if}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
