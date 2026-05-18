<script lang="ts">
	import { graphql } from '$houdini';
	import IssuePills from '$lib/domain/issues/IssuePills.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { Loader } from '@nais/ds-svelte-community';
	import {
		BriefcaseClockIcon,
		PackageIcon,
		PiggybankIcon,
		VirusIcon,
		VitalsIcon
	} from '@nais/ds-svelte-community/icons';
	import { subDays } from 'date-fns';

	interface Props {
		teamSlug: string;
		environment: string;
		workload: string;
		workloadType: 'app' | 'job';
		criticalIssues?: number;
		warningIssues?: number;
		todoIssues?: number;
		readyInstances?: number;
		desiredInstances?: number;
		totalRuns?: number;
		succeededRuns?: number;
		loading?: boolean;
	}

	let {
		teamSlug,
		environment,
		workload,
		workloadType,
		criticalIssues = 0,
		warningIssues = 0,
		todoIssues = 0,
		readyInstances = 0,
		desiredInstances = 0,
		totalRuns = 0,
		succeededRuns = 0,
		loading = false
	}: Props = $props();

	let totalIssues = $derived(criticalIssues + warningIssues + todoIssues);

	const vulnQuery = graphql(`
		query WorkloadHealthVulnerabilities($team: Slug!, $env: String!, $app: String!)
		@cache(policy: CacheAndNetwork) {
			team(slug: $team) {
				environment(name: $env) {
					application(name: $app) {
						image {
							vulnerabilitySummary {
								critical
							}
						}
					}
				}
			}
		}
	`);

	const jobVulnQuery = graphql(`
		query WorkloadHealthJobVulnerabilities($team: Slug!, $env: String!, $job: String!)
		@cache(policy: CacheAndNetwork) {
			team(slug: $team) {
				environment(name: $env) {
					job(name: $job) {
						image {
							vulnerabilitySummary {
								critical
							}
						}
					}
				}
			}
		}
	`);

	const costQuery = graphql(`
		query WorkloadHealthCost($team: Slug!, $env: String!, $app: String!, $from: Date!, $to: Date!)
		@cache(policy: CacheAndNetwork) {
			team(slug: $team) {
				environment(name: $env) {
					application(name: $app) {
						cost {
							daily(from: $from, to: $to) {
								series {
									date
									sum
								}
							}
						}
					}
				}
			}
		}
	`);

	const jobCostQuery = graphql(`
		query WorkloadHealthJobCost(
			$team: Slug!
			$env: String!
			$job: String!
			$from: Date!
			$to: Date!
		) @cache(policy: CacheAndNetwork) {
			team(slug: $team) {
				environment(name: $env) {
					job(name: $job) {
						cost {
							daily(from: $from, to: $to) {
								series {
									date
									sum
								}
							}
						}
					}
				}
			}
		}
	`);

	$effect(() => {
		const to = subDays(new Date(), 2);
		const from = subDays(to, 60);
		if (workloadType === 'app') {
			vulnQuery.fetch({ variables: { team: teamSlug, env: environment, app: workload } });
			costQuery.fetch({
				variables: { team: teamSlug, env: environment, app: workload, from, to }
			});
		} else {
			jobVulnQuery.fetch({ variables: { team: teamSlug, env: environment, job: workload } });
			jobCostQuery.fetch({
				variables: { team: teamSlug, env: environment, job: workload, from, to }
			});
		}
	});

	let criticalVulnerabilities = $derived(
		workloadType === 'app'
			? ($vulnQuery?.data?.team?.environment?.application?.image?.vulnerabilitySummary?.critical ??
					0)
			: ($jobVulnQuery?.data?.team?.environment?.job?.image?.vulnerabilitySummary?.critical ?? 0)
	);

	let costTrend = $derived.by(() => {
		const series =
			workloadType === 'app'
				? $costQuery?.data?.team?.environment?.application?.cost?.daily?.series
				: $jobCostQuery?.data?.team?.environment?.job?.cost?.daily?.series;
		if (!series || series.length < 2) return null;

		const midpoint = Math.floor(series.length / 2);
		const previous = series.slice(0, midpoint).reduce((sum, d) => sum + d.sum, 0);
		const current = series.slice(midpoint).reduce((sum, d) => sum + d.sum, 0);

		if (previous === 0) return null;
		const change = ((current - previous) / previous) * 100;
		if (Math.abs(change) < 1) return null;
		return { current, previous, change };
	});

	let dataLoading = $derived(
		loading ||
			(workloadType === 'app'
				? $vulnQuery?.fetching || $costQuery?.fetching
				: $jobVulnQuery?.fetching || $jobCostQuery?.fetching)
	);

	let instancesHealthy = $derived(readyInstances >= desiredInstances && desiredInstances > 0);
	let instancesDanger = $derived(readyInstances === 0 && desiredInstances > 0);

	let runsHealthy = $derived(totalRuns > 0 && succeededRuns === totalRuns);
	let runsDanger = $derived(totalRuns > 0 && succeededRuns === 0);
	let runsWarning = $derived(totalRuns > 0 && succeededRuns > 0 && succeededRuns < totalRuns);

	let basePath = $derived(`/team/${teamSlug}/${environment}/${workloadType}/${workload}`);
	let title = $derived(workloadType === 'app' ? 'Application health' : 'Job health');
</script>

<SurfaceCard {title} bordered>
	{#if dataLoading}
		<div class="loading">
			<Loader size="xlarge" />
		</div>
	{:else}
		<div class="metrics">
			<a
				href="{basePath}/issues"
				class="metric"
				class:danger={criticalIssues > 0}
				class:warning={!criticalIssues && warningIssues > 0}
				class:success={totalIssues === 0}
			>
				<div
					class="metric-icon"
					class:danger={criticalIssues > 0}
					class:warning={!criticalIssues && warningIssues > 0}
					class:success={totalIssues === 0}
				>
					<VitalsIcon />
				</div>
				<div class="metric-body">
					<span class="metric-value">{totalIssues}</span>
					<span class="metric-label">
						<IssuePills critical={criticalIssues} warning={warningIssues} todo={todoIssues} />
					</span>
				</div>
			</a>

			<a
				href="{basePath}/vulnerabilities"
				class="metric"
				class:danger={criticalVulnerabilities > 0}
				class:success={criticalVulnerabilities === 0}
			>
				<div
					class="metric-icon"
					class:danger={criticalVulnerabilities > 0}
					class:success={criticalVulnerabilities === 0}
				>
					<VirusIcon />
				</div>
				<div class="metric-body">
					<span class="metric-value">{criticalVulnerabilities}</span>
					<span class="metric-label">Critical vulns</span>
				</div>
			</a>

		{#if workloadType === 'app'}
			<a
				href="{basePath}/instancegroup"
				class="metric"
				class:success={instancesHealthy}
				class:danger={instancesDanger}
				class:warning={!instancesHealthy && !instancesDanger && desiredInstances > 0}
			>
				<div
					class="metric-icon"
					class:success={instancesHealthy}
					class:danger={instancesDanger}
					class:warning={!instancesHealthy && !instancesDanger && desiredInstances > 0}
				>
					<PackageIcon />
				</div>
				<div class="metric-body">
					<span class="metric-value">{readyInstances}/{desiredInstances}</span>
					<span class="metric-label">Instances</span>
				</div>
			</a>
			{:else}
				<span
					class="metric"
					class:success={runsHealthy}
					class:danger={runsDanger}
					class:warning={runsWarning}
				>
					<div
						class="metric-icon"
						class:success={runsHealthy}
						class:danger={runsDanger}
						class:warning={runsWarning}
					>
						<BriefcaseClockIcon />
					</div>
					<div class="metric-body">
						{#if totalRuns > 0}
							<span class="metric-value">{succeededRuns}/{totalRuns}</span>
							<span class="metric-label">Runs succeeded</span>
						{:else}
							<span class="metric-value">—</span>
							<span class="metric-label">No recent runs</span>
						{/if}
					</div>
				</span>
			{/if}

			<span
				class="metric"
				class:warning={costTrend && costTrend.change > 5}
				class:success={costTrend && costTrend.change <= 5}
			>
				<div
					class="metric-icon"
					class:warning={costTrend && costTrend.change > 5}
					class:success={costTrend && costTrend.change <= 5}
				>
					<PiggybankIcon />
				</div>
				<div class="metric-body">
					{#if costTrend}
						<span class="metric-value">
							{costTrend.change > 0 ? '+' : ''}{costTrend.change.toFixed(0)}%
						</span>
						<span class="metric-label">Cost vs last month</span>
					{:else}
						<span class="metric-value">—</span>
						<span class="metric-label">Cost trend</span>
					{/if}
				</div>
			</span>
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

	.metrics {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--ax-space-12);
	}

	.metric {
		display: flex;
		align-items: center;
		gap: var(--ax-space-12);
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

	a.metric:hover {
		background: color-mix(in srgb, var(--surface-accent-color) 8%, var(--ax-bg-default));
		box-shadow:
			0 0 0 1px color-mix(in srgb, var(--surface-accent-color) 24%, transparent),
			0 8px 12px -10px var(--surface-shadow-color);
		transform: translateY(-1px);
	}

	.metric-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
		border-radius: var(--ax-radius-8);
		font-size: 1.1rem;
		color: var(--ax-text-neutral-subtle);
		background: color-mix(in srgb, var(--ax-text-neutral-subtle) 10%, transparent);
	}

	.metric-icon.danger {
		color: var(--ax-text-danger);
		background: var(--ax-bg-danger-moderate);
	}

	.metric-icon.warning {
		color: var(--ax-text-warning);
		background: var(--ax-bg-warning-moderate);
	}

	.metric-icon.success {
		color: var(--ax-text-success);
		background: var(--ax-bg-success-moderate);
	}

	.metric-body {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.metric-value {
		font-size: var(--ax-font-size-xlarge);
		font-weight: var(--ax-font-weight-bold);
		line-height: 1.2;
	}

	.metric.danger .metric-value {
		color: var(--ax-text-danger);
	}

	.metric.warning .metric-value {
		color: var(--ax-text-warning);
	}

	.metric.success .metric-value {
		color: var(--ax-text-success);
	}

	.metric-label {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
		white-space: nowrap;
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-4);
	}

	@media (max-width: 767px), (max-height: 500px) {
		.metrics {
			grid-template-columns: 1fr;
		}
	}
</style>
