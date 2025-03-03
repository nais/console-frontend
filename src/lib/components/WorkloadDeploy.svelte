<script lang="ts">
	import { fragment, graphql, type WorkloadDeploy } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { isValidSha } from '$lib/utils/isValidSha';
	import { BodyShort, Heading, Link, Tag } from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		workload: WorkloadDeploy;
	}

	let { workload }: Props = $props();

	let data = $derived(
		fragment(
			workload,
			graphql(`
				fragment WorkloadDeploy on Workload {
					__typename
					name
					deployments(first: 1) {
						nodes {
							deployerUsername
							createdAt
							triggerUrl
							commitSha
							repository
							statuses {
								nodes {
									state
								}
							}
						}
					}
				}
			`)
		)
	);

	let deploymentInfo = $derived(
		$data.deployments.nodes.length > 0 ? $data.deployments.nodes[0] : null
	);
</script>

<div class="wrapper">
	<Heading level="3" size="small">
		<div style="display: flex; gap: var(--a-spacing-2);">
			Deployment
			{#if deploymentInfo?.statuses.nodes[0].state === 'FAILURE'}
				<Tag variant="error" size="small">Failed</Tag>
			{/if}
		</div>
	</Heading>
	{#if deploymentInfo}
		{#if deploymentInfo.createdAt}
			<BodyShort>Last deployed <Time time={deploymentInfo.createdAt} distance={true} />.</BodyShort>
		{/if}

		{#if deploymentInfo.triggerUrl}
			<Link href={deploymentInfo.triggerUrl}>Github action <ExternalLinkIcon /></Link>
		{/if}

		{#if deploymentInfo.commitSha && isValidSha(deploymentInfo.commitSha)}
			<a href="https://github.com/{deploymentInfo.repository}/commit/{deploymentInfo.commitSha}"
				>Commit {deploymentInfo.commitSha.slice(0, 7)} <ExternalLinkIcon /></a
			>
		{/if}
	{:else}
		<BodyShort>No deployment metadata found for workload.</BodyShort>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-1);
	}
</style>
