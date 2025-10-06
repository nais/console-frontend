<script lang="ts">
	import type { TeamOverviewActivityLog$result } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import { resourceLink } from '../../utils';

	let {
		data
	}: {
		data: Extract<
			TeamOverviewActivityLog$result['team']['activityLog']['edges'][number]['node'],
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
	{:else}
		Deployed
	{/if}
	<a
		href={resourceLink(
			data.environmentName ?? '',
			data.resourceType,
			data.resourceName,
			data.teamSlug
		)}>{data.resourceName}</a
	>
	<Tag size="small" variant={envTagVariant(data.environmentName || '')}>{data.environmentName}</Tag>

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
