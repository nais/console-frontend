<script lang="ts">
	import { page } from '$app/state';
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

	const triggerURL = data.deploymentData?.triggerURL || '';
	const id = triggerURL.split('/').at(-1) ?? '';

	const teamSlug = page.params.team;
	const env = page.params.env;

	const workloadType = page.url.toString().includes('job')
		? 'job'
		: page.url.toString().includes('app')
			? 'app'
			: 'unknown';
	const workloadName = data.resourceName;
</script>

<div>
	{#if triggerURL && workloadType !== 'unknown'}
		<a href="/team/{teamSlug}/{env}/{workloadType}/{workloadName}/deploys?deployId={id}"
			>Deployment</a
		>
	{:else}
		Deployment
	{/if}
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
