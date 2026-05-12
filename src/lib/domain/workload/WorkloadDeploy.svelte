<script lang="ts">
	import {
		fragment,
		graphql,
		DeploymentStatusState,
		type DeploymentStatusState$options,
		type WorkloadDeploy
	} from '$houdini';
	import Meta from '$lib/domain/activity/Meta.svelte';
	import GitHubIcon from '$lib/icons/GitHubIcon.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { BodyShort, Tag, Tooltip } from '@nais/ds-svelte-community';
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
					deployments(first: 1) {
						nodes {
							createdAt
							repository
							commitSha
							deployerUsername
							triggerUrl
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

	let deploymentStatus: 'UNKNOWN' | DeploymentStatusState$options = $derived.by(
		() => deploymentInfo?.statuses.nodes[0]?.state ?? 'UNKNOWN'
	);

	let statusPill: {
		variant: 'success' | 'error' | 'warning' | 'info' | 'neutral';
		label: string;
	} = $derived.by(() => {
		switch (deploymentStatus) {
			case DeploymentStatusState.SUCCESS:
				return { variant: 'success', label: 'Success' };
			case DeploymentStatusState.IN_PROGRESS:
				return { variant: 'info', label: 'In progress' };
			case DeploymentStatusState.FAILURE:
				return { variant: 'error', label: 'Failed' };
			case DeploymentStatusState.ERROR:
				return { variant: 'error', label: 'Error' };
			default:
				return { variant: 'neutral', label: 'Unknown' };
		}
	});

	let workflowUrl = $derived.by(() => {
		if (deploymentInfo?.triggerUrl) return deploymentInfo.triggerUrl;
		if (deploymentInfo?.repository) return `https://github.com/${deploymentInfo.repository}`;
		return null;
	});
</script>

<SurfaceCard title="Latest deployment">
	{#snippet headerAside()}
		{#if deploymentInfo}
			<Tag size="xsmall" variant={statusPill.variant}>{statusPill.label}</Tag>
		{/if}
	{/snippet}

	{#if deploymentInfo}
		<div class="details">
			{#if deploymentInfo.repository}
				<span class="workflow-row">
					<GitHubIcon size="14px" />
					<span class="repo-name">{deploymentInfo.repository}</span>
					{#if workflowUrl}
						<Tooltip content="View workflow on GitHub" placement="top">
							<a href={workflowUrl} target="_blank" rel="noopener noreferrer" class="workflow-icon">
								<ExternalLinkIcon />
							</a>
						</Tooltip>
					{/if}
				</span>
			{/if}

			{#if deploymentInfo.deployerUsername && deploymentInfo.createdAt}
				<Meta actor={deploymentInfo.deployerUsername} createdAt={deploymentInfo.createdAt} />
			{:else if deploymentInfo.createdAt}
				<Meta actor="unknown" createdAt={deploymentInfo.createdAt} />
			{/if}
		</div>
	{:else}
		<BodyShort size="small">No deployment metadata found for workload.</BodyShort>
	{/if}
</SurfaceCard>

<style>
	.details {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
		min-width: 0;
	}

	.workflow-row {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
		font-size: var(--ax-font-size-medium);
		line-height: var(--ax-font-line-height-large);
	}

	.repo-name {
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-neutral);
	}

	.workflow-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--ax-text-neutral-subtle);
		text-decoration: none;
	}

	.workflow-row :global(.ds-svelte-tooltip-wrapper) {
		display: inline-flex;
		align-items: center;
	}

	.workflow-icon:hover {
		color: var(--ax-text-neutral);
	}
</style>
