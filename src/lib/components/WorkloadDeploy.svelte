<script lang="ts">
	import { fragment, graphql, type WorkloadDeploy } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { getImageDisplayName } from '$lib/utils/image';
	import { isValidSha } from '$lib/utils/isValidSha';
	import { BodyShort, CopyButton, Heading, Link, Tag } from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
	import ExternalLink from './ExternalLink.svelte';
	import WorkloadLink from './WorkloadLink.svelte';

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
					id
					name
					image {
						name
						tag
						workloadReferences {
							nodes {
								workload {
									id
									__typename
									team {
										slug
									}
									teamEnvironment {
										environment {
											name
										}
									}
									name
								}
							}
						}
					}
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

	const relatedWorkloads = $derived(
		$data.image.workloadReferences.nodes
			.map((node) => node.workload)
			.filter((workload) => workload.id !== $data.id)
	);
</script>

<div class="wrapper">
	<Heading level="3" size="small">
		<div style="display: flex; gap: var(--ax-space-8);">
			Deployment
			{#if deploymentInfo?.statuses && deploymentInfo.statuses.nodes && deploymentInfo.statuses.nodes.length > 0}
				{#if deploymentInfo?.statuses.nodes[0].state === 'FAILURE'}
					<Tag variant="error" size="small">Failed</Tag>
				{/if}
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
			<ExternalLink
				href="https://github.com/{deploymentInfo.repository}/commit/{deploymentInfo.commitSha}"
				>Commit {deploymentInfo.commitSha.slice(0, 7)}
			</ExternalLink>
		{/if}
	{:else}
		<BodyShort>No deployment metadata found for workload.</BodyShort>
	{/if}
</div>
<div class="wrapper">
	<div class="image_heading">
		<Heading level="3" size="small">Image</Heading>
		<div>
			<CopyButton
				copyText={$data.image.name + ':' + $data.image.tag}
				size="small"
				variant="action"
			/>
		</div>
	</div>
	{#if $data.image.name.startsWith('europe-north1-docker.pkg.dev')}
		<ExternalLink href="https://{$data.image.name + ':' + $data.image.tag}">
			{getImageDisplayName($data.image.name)}:{$data.image.tag}
		</ExternalLink>
	{:else}
		{$data.image.name}:{$data.image.tag}
	{/if}
	{#if relatedWorkloads.length > 0}
		<Heading level="4" size="xsmall">Other Workloads Using This Image</Heading>
		{#each relatedWorkloads as workload (workload.id)}
			<WorkloadLink {workload} />
		{/each}
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}
	.image_heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--spacing-layout);
	}
</style>
