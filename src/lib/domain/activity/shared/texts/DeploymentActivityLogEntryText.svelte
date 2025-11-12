<script lang="ts">
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import { activityLogResourceLink } from '../../utils';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'DeploymentActivityLogEntry'>;
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
		href={activityLogResourceLink(
			data.environmentName ?? '',
			data.resourceType,
			data.resourceName,
			data.teamSlug
		)}>{data.resourceName}</a
	>
	{#if data.environmentName}
		in <Tag size="small" variant={envTagVariant(data.environmentName)}>{data.environmentName}</Tag>
	{/if}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
