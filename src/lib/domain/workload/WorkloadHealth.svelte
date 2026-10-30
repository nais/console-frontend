<script lang="ts">
	import IssuePills from '#lib/domain/issues/IssuePills.svelte';
	import { ShBadge, ShSpinner, Tooltip } from '#lib/shadcn/ui/index.js';

	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import { graphql } from '$houdini';

	import {
		BriefcaseClockIcon,
		PackageIcon,
		PiggybankIcon,
		VirusIcon,
		VitalsIcon
	} from '#lib/icons/index.js';
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
		query WorkloadHealthVulnerabilities($team: Slug!, $env: String!, $app: String!) {
			team(slug: $team) {
				environment(name: $env) {
					application(name: $app) {
						urgentVulnerabilityIssues: issues(
							first: 1
							filter: { issueType: EXTERNAL_INGRESS_URGENT_VULNERABILITY }
						) {
							edges {
								node {
									... on ExternalIngressUrgentVulnerabilityIssue {
										__typename
										priorityUrgent
									}
								}
							}
						}
						image {
							sbom {
								status
							}
							vulnerabilitySummary {
								countsByPriority {
									knownExploited
								}
							}
						}
					}
				}
			}
		}
	`);

	const jobVulnQuery = graphql(`
		query WorkloadHealthJobVulnerabilities($team: Slug!, $env: String!, $job: String!) {
			team(slug: $team) {
				environment(name: $env) {
					job(name: $job) {
						image {
							sbom {
								status
							}
							vulnerabilitySummary {
								countsByPriority {
									knownExploited
								}
							}
						}
					}
				}
			}
		}
	`);

	const costQuery = graphql(`
		query WorkloadHealthCost($team: Slug!, $env: String!, $app: String!, $from: Date!, $to: Date!) {
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
		) {
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

	let imageData = $derived(
		workloadType === 'app'
			? $vulnQuery?.data?.team?.environment?.application?.image
			: $jobVulnQuery?.data?.team?.environment?.job?.image
	);

	let urgentVulnerabilityCount = $derived.by(() => {
		if (workloadType !== 'app') return undefined;
		const issue =
			$vulnQuery?.data?.team?.environment?.application?.urgentVulnerabilityIssues?.edges[0]?.node;
		return issue?.__typename === 'ExternalIngressUrgentVulnerabilityIssue'
			? issue.priorityUrgent
			: undefined;
	});
	let knownExploitedCount = $derived(
		imageData?.vulnerabilitySummary?.countsByPriority?.knownExploited
	);
	// Prefer the internet-facing+known-exploited (urgent) count when there is
	// one; otherwise fall back to the plain known-exploited count.
	let showingUrgent = $derived((urgentVulnerabilityCount ?? 0) > 0);
	let vulnerabilityValue = $derived(
		showingUrgent ? urgentVulnerabilityCount : (knownExploitedCount ?? undefined)
	);
	let sbomProcessing = $derived(imageData?.sbom?.status === 'PROCESSING');

	$effect(() => {
		if (!sbomProcessing) return;
		const interval = setInterval(() => {
			if (document.hidden) return;
			if (workloadType === 'app') {
				vulnQuery.fetch({
					variables: { team: teamSlug, env: environment, app: workload },
					policy: 'NetworkOnly'
				});
			} else {
				jobVulnQuery.fetch({
					variables: { team: teamSlug, env: environment, job: workload },
					policy: 'NetworkOnly'
				});
			}
		}, 10_000);
		return () => clearInterval(interval);
	});

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

	let hasData = $derived(
		workloadType === 'app'
			? !!$vulnQuery?.data && !!$costQuery?.data
			: !!$jobVulnQuery?.data && !!$jobCostQuery?.data
	);

	let dataLoading = $derived(
		loading ||
			(!hasData &&
				(workloadType === 'app'
					? $vulnQuery?.fetching || $costQuery?.fetching
					: $jobVulnQuery?.fetching || $jobCostQuery?.fetching))
	);

	let instancesHealthy = $derived(readyInstances >= desiredInstances && desiredInstances > 0);
	let instancesDanger = $derived(readyInstances === 0 && desiredInstances > 0);

	let runsHealthy = $derived(totalRuns > 0 && succeededRuns === totalRuns);
	let runsDanger = $derived(totalRuns > 0 && succeededRuns === 0);
	let runsWarning = $derived(totalRuns > 0 && succeededRuns > 0 && succeededRuns < totalRuns);

	let basePath = $derived(`/team/${teamSlug}/${environment}/${workloadType}/${workload}`);
	let title = $derived(workloadType === 'app' ? 'Application health' : 'Job health');
</script>

<SurfaceCard {title}>
	{#if dataLoading}
		<div class="loading">
			<ShSpinner size="lg" />
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
				class:danger={(vulnerabilityValue ?? 0) > 0}
				class:success={vulnerabilityValue === 0}
			>
				<div
					class="metric-icon"
					class:danger={(vulnerabilityValue ?? 0) > 0}
					class:success={vulnerabilityValue === 0}
				>
					<VirusIcon />
				</div>
				<div class="metric-body">
					<span class="metric-value"
						>{vulnerabilityValue !== undefined ? vulnerabilityValue : '-'}</span
					>
					{#if showingUrgent}
						<span class="metric-label">
							<ShBadge size="xs" variant="destructive">Internet-facing</ShBadge>
							<ShBadge size="xs" variant="warning">Known exploited</ShBadge>
						</span>
					{:else}
						<span class="metric-label">Known exploited</span>
					{/if}
				</div>
				{#if sbomProcessing}
					<div class="metric-processing">
						<Tooltip content="Scanning for vulnerabilities…">
							<ShSpinner size="sm" />
						</Tooltip>
					</div>
				{/if}
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
		grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
		gap: 0.75rem;
	}

	.metric {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		border-radius: var(--radius);
		text-decoration: none;
		color: inherit;
		background-color: var(--card);
		border: 1px solid var(--border);
		overflow: hidden;
		transition:
			background-color 140ms ease,
			border-color 140ms ease,
			box-shadow 140ms ease;
	}

	a.metric:hover {
		background-color: var(--card-hover);
		border-color: var(--border-strong);
		box-shadow: var(--sh-shadow-xs);
		text-decoration: none;
	}

	.metric-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
		border-radius: var(--radius-md);
		font-size: 1rem;
		color: var(--muted-foreground);
		background-color: var(--secondary);
		border: 1px solid var(--border);
	}

	.metric-icon.danger {
		color: var(--destructive);
		background-color: var(--destructive-muted);
		border-color: var(--destructive-border);
	}

	.metric-icon.warning {
		color: var(--warning);
		background-color: var(--warning-muted);
		border-color: var(--warning-border);
	}

	.metric-icon.success {
		color: var(--success);
		background-color: var(--success-muted);
		border-color: var(--success-border);
	}

	.metric-body {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.metric-value {
		font-size: 1.375rem;
		font-weight: 700;
		letter-spacing: -0.025em;
		line-height: 1.15;
		font-variant-numeric: tabular-nums;
	}

	.metric.danger .metric-value {
		color: var(--destructive);
	}

	.metric.warning .metric-value {
		color: var(--warning);
	}

	.metric.success .metric-value {
		color: var(--success);
	}

	.metric-label {
		font-size: 0.75rem;
		color: var(--muted-foreground);
		white-space: nowrap;
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.metrics {
			grid-template-columns: 1fr;
		}
	}

	.metric-processing {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
	}
</style>
