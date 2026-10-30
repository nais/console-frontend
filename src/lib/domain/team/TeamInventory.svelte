<script lang="ts">
	import { graphql } from '$houdini';
	import { ShSpinner } from '#lib/shadcn/ui/index.js';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import { BriefcaseClockIcon, PackageIcon } from '#lib/icons/index.js';

	interface Props {
		teamSlug: string;
	}

	let { teamSlug }: Props = $props();

	const inventoryQuery = graphql(`
		query TeamInventoryOverview($team: Slug!) {
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
					postgresBranches {
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
		if (counts.postgresBranches.total > 0)
			items.push({
				label: 'Postgres',
				count: counts.postgresBranches.total,
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

<SurfaceCard title="Inventory">
	{#if $inventoryQuery.fetching}
		<div class="loading">
			<ShSpinner size="lg" />
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
		gap: 1rem;
	}

	.workloads {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	@media (max-width: 500px) {
		.workloads {
			grid-template-columns: 1fr;
		}
	}

	.workload-card {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.625rem;
		padding: 1rem;
		border-radius: var(--radius);
		text-decoration: none;
		color: inherit;
		background-color: var(--card);
		border: 1px solid var(--border);
		transition:
			background-color 140ms ease,
			border-color 140ms ease,
			box-shadow 140ms ease;
	}

	.workload-card:hover {
		background-color: var(--card-hover);
		border-color: var(--border-strong);
		box-shadow: var(--sh-shadow-xs);
		text-decoration: none;
	}

	.workload-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--foreground);
	}

	.workload-label {
		font-weight: 600;
		font-size: 0.875rem;
	}

	.workload-total {
		margin-left: auto;
		font-size: 1.375rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
	}

	.state-bar {
		display: flex;
		width: 100%;
		height: 6px;
		border-radius: var(--radius-full);
		overflow: hidden;
		background: var(--secondary);
		gap: 2px;
	}

	.state-segment {
		min-width: 4px;
		transition: width 300ms ease;
	}

	.state-segment.running {
		background: var(--success);
	}

	.state-segment.completed {
		background: var(--success);
	}

	.state-segment.not-running {
		background: var(--destructive);
	}

	.state-segment.job-running {
		background: var(--info);
	}

	.state-segment.unknown {
		background: var(--muted-foreground);
	}

	.state-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem 0.75rem;
	}

	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: var(--muted-foreground);
		font-variant-numeric: tabular-nums;
	}

	.dot {
		display: inline-block;
		width: 7px;
		height: 7px;
		border-radius: 50%;
	}

	.dot.running {
		background: var(--success);
	}

	.dot.completed {
		background: var(--success);
	}

	.dot.not-running {
		background: var(--destructive);
	}

	.dot.job-running {
		background: var(--info);
	}

	.dot.unknown {
		background: var(--muted-foreground);
	}

	.resources {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
		gap: 0.5rem;
	}

	.resource-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--foreground);
		background-color: color-mix(in srgb, var(--background) 60%, var(--card));
		border: 1px solid var(--border);
		font-size: 0.8125rem;
		transition:
			background-color 120ms ease,
			border-color 120ms ease;
	}

	.resource-item:hover {
		background-color: var(--accent);
		border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
	}

	.resource-label {
		color: var(--muted-foreground);
		font-weight: 500;
	}

	.resource-count {
		font-weight: 700;
		font-family: monospace;
		font-size: 0.75rem;
		padding: 0.0625rem 0.4375rem;
		border-radius: var(--radius-full);
		background-color: var(--secondary);
		color: var(--foreground);
		font-variant-numeric: tabular-nums;
	}
</style>
