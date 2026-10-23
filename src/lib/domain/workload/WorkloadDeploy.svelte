<script lang="ts">
	import Meta from '#lib/domain/activity/Meta.svelte';
	import GitHubIcon from '#lib/icons/GitHubIcon.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import {
		DeploymentStatusState,
		fragment,
		graphql,
		type DeploymentStatusState$options,
		type WorkloadDeploy
	} from '$houdini';
	import { BodyShort, Tag, Tooltip } from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		workload: WorkloadDeploy;
	}

	let { workload }: Props = $props();

	let data = $derived(
		workload
			? fragment(
					workload,
					graphql(`
						fragment WorkloadDeploy on Workload {
							__typename
							activityLog(
								first: 1
								filter: {
									activityTypes: [
										DEPLOYMENT
										APPLICATION_UPDATED
										JOB_UPDATED
										GENERIC_KUBERNETES_RESOURCE_CREATED
									]
								}
							) {
								nodes {
									__typename
									createdAt
									actor
									gitHubActorClaims {
										actor
										repository
										runID
									}
									... on DeploymentActivityLogEntry {
										data {
											triggerURL
										}
									}
								}
							}
							deployments(first: 1) {
								nodes {
									createdAt
									repository
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
			: null
	);

	let deploymentInfo = $derived.by(() => {
		const deployment = $data?.deployments.nodes[0];
		const entry = $data?.activityLog.nodes.at(0);
		if (entry && (!deployment || entry.createdAt > deployment.createdAt)) {
			const claims = entry.gitHubActorClaims;
			return {
				createdAt: entry.createdAt,
				repository: claims?.repository,
				deployerUsername: claims?.actor || entry.actor,
				triggerUrl:
					(entry.__typename === 'DeploymentActivityLogEntry' && entry.data.triggerURL) ||
					(claims ? `https://github.com/${claims.repository}/actions/runs/${claims.runID}` : null),
				status: null
			};
		}
		return deployment
			? { ...deployment, status: deployment.statuses.nodes[0]?.state ?? ('UNKNOWN' as const) }
			: null;
	});

	let deploymentStatus: 'UNKNOWN' | DeploymentStatusState$options = $derived(
		deploymentInfo?.status ?? 'UNKNOWN'
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
		{#if deploymentInfo?.status}
			<Tag size="xsmall" variant={statusPill.variant}>{statusPill.label}</Tag>
		{/if}
	{/snippet}

	{#if deploymentInfo}
		<div class="details">
			{#if deploymentInfo.repository || workflowUrl}
				<span class="workflow-row">
					<GitHubIcon size="14px" />
					<span class="repo-name">{deploymentInfo.repository ?? 'Deployment workflow'}</span>
					{#if workflowUrl}
						<Tooltip content="View workflow on GitHub" placement="top">
							<a
								href={workflowUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="workflow-icon"
								aria-label="View workflow on GitHub"
							>
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
