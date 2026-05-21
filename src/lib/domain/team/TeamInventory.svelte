<script lang="ts">
	import { graphql } from '$houdini';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { Loader } from '@nais/ds-svelte-community';
	import { BriefcaseClockIcon, PackageIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		teamSlug: string;
	}

	let { teamSlug }: Props = $props();

	const inventoryQuery = graphql(`
		query TeamInventoryOverview($team: Slug!) @cache(policy: CacheAndNetwork) {
			team(slug: $team) {
				inventoryCounts {
					applications {
						total
						running
						notRunning
						unknown
					}
					jobs {
						total
						running
						failed
						completed
						unknown
					}
					sqlInstances {
						total
					}
					buckets {
						total
					}
					valkeys {
						total
					}
					openSearches {
						total
					}
					kafkaTopics {
						total
					}
					bigQueryDatasets {
						total
					}
					postgresInstances {
						total
					}
					secrets {
						total
					}
					configs {
						total
					}
				}
			}
		}
	`);

	$effect(() => {
		inventoryQuery.fetch({ variables: { team: teamSlug } });
	});

	let counts = $derived($inventoryQuery.data?.team?.inventoryCounts);

	let appStates = $derived.by(() => {
		const apps = counts?.applications;
		return {
			total: apps?.total ?? 0,
			running: apps?.running ?? 0,
			notRunning: apps?.notRunning ?? 0,
			unknown: apps?.unknown ?? 0
		};
	});

	let jobStates = $derived.by(() => {
		const jobs = counts?.jobs;
		return {
			total: jobs?.total ?? 0,
			running: jobs?.running ?? 0,
			failed: jobs?.failed ?? 0,
			completed: jobs?.completed ?? 0,
			unknown: jobs?.unknown ?? 0
		};
	});

	let resources = $derived.by(() => {
		if (!counts) return [];
		const items: { label: string; count: number; href: string }[] = [];
		if (counts.sqlInstances.total > 0)
			items.push({
				label: 'Cloud SQL',
				count: counts.sqlInstances.total,
				href: `/team/${teamSlug}/cloudsql`
			});
		if (counts.postgresInstances.total > 0)
			items.push({
				label: 'Postgres',
				count: counts.postgresInstances.total,
				href: `/team/${teamSlug}/postgres`
			});
		if (counts.buckets.total > 0)
			items.push({
				label: 'Buckets',
				count: counts.buckets.total,
				href: `/team/${teamSlug}/buckets`
			});
		if (counts.valkeys.total > 0)
			items.push({
				label: 'Valkey',
				count: counts.valkeys.total,
				href: `/team/${teamSlug}/valkey`
			});
		if (counts.openSearches.total > 0)
			items.push({
				label: 'OpenSearch',
				count: counts.openSearches.total,
				href: `/team/${teamSlug}/opensearch`
			});
		if (counts.kafkaTopics.total > 0)
			items.push({
				label: 'Kafka',
				count: counts.kafkaTopics.total,
				href: `/team/${teamSlug}/kafka`
			});
		if (counts.bigQueryDatasets.total > 0)
			items.push({
				label: 'BigQuery',
				count: counts.bigQueryDatasets.total,
				href: `/team/${teamSlug}/bigquery`
			});
		if (counts.secrets.total > 0)
			items.push({
				label: 'Secrets',
				count: counts.secrets.total,
				href: `/team/${teamSlug}/secrets`
			});
		if (counts.configs.total > 0)
			items.push({
				label: 'Config',
				count: counts.configs.total,
				href: `/team/${teamSlug}/configs`
			});
		return items;
	});
</script>

<SurfaceCard title="Inventory" bordered>
	{#if $inventoryQuery.fetching}
		<div class="loading">
			<Loader size="xlarge" />
		</div>
	{:else}
		<div class="inventory">
			<div class="workloads">
				<a href="/team/{teamSlug}/applications" class="workload-card">
					<div class="workload-header">
						<PackageIcon />
						<span class="workload-label">Applications</span>
						<span class="workload-total">{appStates.total}</span>
					</div>
					<div class="state-bar">
						{#if appStates.total > 0}
							{#if appStates.running > 0}
								<div
									class="state-segment running"
									style="width: {(appStates.running / appStates.total) * 100}%"
									title="{appStates.running} running"
								></div>
							{/if}
							{#if appStates.notRunning > 0}
								<div
									class="state-segment not-running"
									style="width: {(appStates.notRunning / appStates.total) * 100}%"
									title="{appStates.notRunning} not running"
								></div>
							{/if}
							{#if appStates.unknown > 0}
								<div
									class="state-segment unknown"
									style="width: {(appStates.unknown / appStates.total) * 100}%"
									title="{appStates.unknown} unknown"
								></div>
							{/if}
						{/if}
					</div>
					<div class="state-legend">
						{#if appStates.running > 0}
							<span class="legend-item"
								><span class="dot running"></span> {appStates.running} running</span
							>
						{/if}
						{#if appStates.notRunning > 0}
							<span class="legend-item"
								><span class="dot not-running"></span> {appStates.notRunning} not running</span
							>
						{/if}
						{#if appStates.unknown > 0}
							<span class="legend-item"
								><span class="dot unknown"></span> {appStates.unknown} unknown</span
							>
						{/if}
					</div>
				</a>

				<a href="/team/{teamSlug}/jobs" class="workload-card">
					<div class="workload-header">
						<BriefcaseClockIcon />
						<span class="workload-label">Jobs</span>
						<span class="workload-total">{jobStates.total}</span>
					</div>
					<div class="state-bar">
						{#if jobStates.total > 0}
							{#if jobStates.running > 0}
								<div
									class="state-segment job-running"
									style="width: {(jobStates.running / jobStates.total) * 100}%"
									title="{jobStates.running} running"
								></div>
							{/if}
							{#if jobStates.completed > 0}
								<div
									class="state-segment completed"
									style="width: {(jobStates.completed / jobStates.total) * 100}%"
									title="{jobStates.completed} completed"
								></div>
							{/if}
							{#if jobStates.failed > 0}
								<div
									class="state-segment not-running"
									style="width: {(jobStates.failed / jobStates.total) * 100}%"
									title="{jobStates.failed} failed"
								></div>
							{/if}
							{#if jobStates.unknown > 0}
								<div
									class="state-segment unknown"
									style="width: {(jobStates.unknown / jobStates.total) * 100}%"
									title="{jobStates.unknown} unknown"
								></div>
							{/if}
						{/if}
					</div>
					<div class="state-legend">
						{#if jobStates.running > 0}
							<span class="legend-item"
								><span class="dot job-running"></span> {jobStates.running} running</span
							>
						{/if}
						{#if jobStates.completed > 0}
							<span class="legend-item"
								><span class="dot completed"></span> {jobStates.completed} completed</span
							>
						{/if}
						{#if jobStates.failed > 0}
							<span class="legend-item"
								><span class="dot not-running"></span> {jobStates.failed} failed</span
							>
						{/if}
						{#if jobStates.unknown > 0}
							<span class="legend-item"
								><span class="dot unknown"></span> {jobStates.unknown} unknown</span
							>
						{/if}
					</div>
				</a>
			</div>

			{#if resources.length > 0}
				<div class="resources">
					{#each resources as resource (resource.label)}
						<a href={resource.href} class="resource-item">
							<span class="resource-label">{resource.label}</span>
							<span class="resource-count">{resource.count}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</SurfaceCard>

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 6rem;
	}

	.inventory {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.workloads {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--ax-space-12);
	}

	@media (max-width: 500px) {
		.workloads {
			grid-template-columns: 1fr;
		}
	}

	.workload-card {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		padding: var(--ax-space-12);
		border-radius: var(--ax-radius-8);
		text-decoration: none;
		color: inherit;
		background: color-mix(in srgb, var(--ax-bg-default) 82%, transparent);
		box-shadow: 0 0 0 1px var(--ax-border-neutral-subtleA);
		transition:
			background-color 120ms ease,
			box-shadow 120ms ease,
			transform 120ms ease;
	}

	.workload-card:hover {
		background: color-mix(in srgb, var(--surface-accent-color) 8%, var(--ax-bg-default));
		box-shadow:
			0 0 0 1px color-mix(in srgb, var(--surface-accent-color) 24%, transparent),
			0 8px 12px -10px var(--surface-shadow-color);
		transform: translateY(-1px);
	}

	.workload-header {
		display: flex;
		align-items: center;
		gap: var(--ax-space-6);
		color: var(--ax-text-neutral);
	}

	.workload-label {
		font-weight: var(--ax-font-weight-bold);
		font-size: var(--ax-font-size-small);
	}

	.workload-total {
		margin-left: auto;
		font-size: var(--ax-font-size-xlarge);
		font-weight: var(--ax-font-weight-bold);
	}

	.state-bar {
		display: flex;
		width: 100%;
		height: 6px;
		border-radius: 3px;
		overflow: hidden;
		background: var(--ax-neutral-200);
		gap: 1px;
	}

	.state-segment {
		min-width: 4px;
		transition: width 300ms ease;
	}

	.state-segment.running {
		background: var(--ax-bg-success-strong);
	}

	.state-segment.completed {
		background: var(--ax-bg-success-strong);
	}

	.state-segment.not-running {
		background: var(--ax-bg-danger-strong);
	}

	.state-segment.job-running {
		background: var(--ax-bg-info-strong);
	}

	.state-segment.unknown {
		background: var(--ax-bg-neutral-strong);
	}

	.state-legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-6) var(--ax-space-12);
	}

	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
	}

	.dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.dot.running {
		background: var(--ax-bg-success-strong);
	}

	.dot.completed {
		background: var(--ax-bg-success-strong);
	}

	.dot.not-running {
		background: var(--ax-bg-danger-strong);
	}

	.dot.job-running {
		background: var(--ax-bg-info-strong);
	}

	.dot.unknown {
		background: var(--ax-bg-neutral-strong);
	}

	.resources {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-6);
	}

	.resource-item {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-6);
		padding: var(--ax-space-4) var(--ax-space-12);
		border-radius: var(--ax-radius-8);
		text-decoration: none;
		color: var(--ax-text-neutral);
		background: color-mix(in srgb, var(--ax-bg-default) 82%, transparent);
		box-shadow: 0 0 0 1px var(--ax-border-neutral-subtleA);
		font-size: var(--ax-font-size-small);
		transition:
			background-color 120ms ease,
			box-shadow 120ms ease;
	}

	.resource-item:hover {
		background: color-mix(in srgb, var(--surface-accent-color) 8%, var(--ax-bg-default));
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--surface-accent-color) 24%, transparent);
	}

	.resource-label {
		color: var(--ax-text-neutral);
	}

	.resource-count {
		font-weight: var(--ax-font-weight-bold);
	}
</style>
