<script lang="ts">
	import {
		fragment,
		graphql,
		type DeploymentStatusState$options,
		type WorkloadDeploy
	} from '$houdini';
	import DeploymentStatus from '$lib/ui/DeploymentStatus.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
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

<div class="wrapper">
	{#if deploymentInfo}
		<div class="header">
			<span class="eyebrow">Latest deployment</span>
			<DeploymentStatus status={deploymentStatus} />
		</div>

		<div class="content">
			<div class="icon-shell">
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
		<div class="header">
			<span class="eyebrow">Latest deployment</span>
		</div>
		<div class="content empty-state">
			<div class="icon-shell">
				<RocketIcon />
			</div>
			<BodyShort>No deployment metadata found for workload.</BodyShort>
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		padding: var(--ax-space-16);
		border-radius: var(--ax-radius-8);
		background: linear-gradient(
			180deg,
			color-mix(in oklab, var(--ax-bg-default) 40%, var(--ax-bg-neutral-soft)) 0%,
			var(--ax-bg-neutral-soft) 100%
		);
		box-shadow:
			0 12px 24px -24px var(--surface-shadow-color),
			0 4px 10px -12px var(--surface-shadow-color);
		width: 100%;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.eyebrow {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
		line-height: var(--ax-font-line-height-large);
		color: var(--ax-text-neutral-subtle);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.content {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ax-space-12);
		align-items: start;
		width: 100%;
	}

	.icon-shell {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: var(--ax-radius-8);
		background-color: var(--ax-neutral-100);
		color: var(--ax-text-accent);
		flex-shrink: 0;
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
		.wrapper {
			padding: var(--ax-space-12);
		}

		.header,
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
