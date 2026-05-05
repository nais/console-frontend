<script lang="ts">
	import {
		fragment,
		graphql,
		type DeploymentStatusState$options,
		type WorkloadDeploy
	} from '$houdini';
	import DeploymentStatus from '$lib/ui/DeploymentStatus.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';

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
</script>

<SurfaceCard title="Latest deployment">
	{#snippet headerAside()}
		{#if deploymentInfo}
			<DeploymentStatus status={deploymentStatus} />
		{/if}
	{/snippet}

	{#if deploymentInfo}
		<div class="content">
			<div class="surface-icon">
				<RocketIcon />
			</div>
			<div class="details">
				{#if deploymentInfo.repository}
					<div class="repo">
						<ExternalLink href="https://github.com/{deploymentInfo.repository}">
							{deploymentInfo.repository}
						</ExternalLink>
					</div>
				{:else}
					<div class="repo fallback">Deployment metadata</div>
				{/if}

				{#if deploymentInfo.createdAt}
					<div class="meta">
						<BodyShort size="small"
							><Time time={deploymentInfo.createdAt} distance={true} /></BodyShort
						>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="content empty-state">
			<div class="surface-icon">
				<RocketIcon />
			</div>
			<BodyShort>No deployment metadata found for workload.</BodyShort>
		</div>
	{/if}
</SurfaceCard>

<style>
	.content {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ax-space-12);
		align-items: start;
		width: 100%;
	}

	.details {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		min-width: 0;
	}

	.repo,
	.repo.fallback {
		font-size: var(--ax-font-size-large);
		font-weight: var(--ax-font-weight-bold);
		line-height: var(--ax-font-line-height-large);
		overflow-wrap: anywhere;
	}

	.repo :global(a) {
		color: inherit;
		text-decoration: none;
	}

	.repo :global(a:hover) {
		text-decoration: underline;
	}

	.meta {
		color: var(--ax-text-neutral-subtle);
	}

	.empty-state {
		align-items: center;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.content {
			grid-template-columns: 1fr;
		}

		.content {
			display: flex;
			flex-direction: column;
		}

		.empty-state {
			align-items: flex-start;
		}
	}
</style>
