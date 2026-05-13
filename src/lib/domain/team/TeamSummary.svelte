<script lang="ts">
	import { graphql } from '$houdini';
	import IssuePills from '$lib/domain/issues/IssuePills.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { Loader } from '@nais/ds-svelte-community';
	import {
		BellDotFillIcon,
		PiggybankIcon,
		VirusIcon,
		VitalsIcon
	} from '@nais/ds-svelte-community/icons';

	interface Props {
		teamSlug: string;
		criticalIssues?: number;
		warningIssues?: number;
		todoIssues?: number;
		firingAlerts?: number;
		loading?: boolean;
	}

	let {
		teamSlug,
		criticalIssues = 0,
		warningIssues = 0,
		todoIssues = 0,
		firingAlerts = 0,
		loading = false
	}: Props = $props();

	let totalIssues = $derived(criticalIssues + warningIssues + todoIssues);

	const vulnQuery = graphql(`
		query TeamSummaryVulnerabilities($team: Slug!) {
			team(slug: $team) {
				vulnerabilitySummary {
					critical
				}
			}
		}
	`);

	const costQuery = graphql(`
		query TeamSummaryCost($team: Slug!) {
			team(slug: $team) {
				cost {
					monthlySummary {
						series {
							cost
							date
						}
					}
				}
			}
		}
	`);

	$effect(() => {
		vulnQuery.fetch({ variables: { team: teamSlug } });
		costQuery.fetch({ variables: { team: teamSlug } });
	});

	let criticalVulnerabilities = $derived(
		$vulnQuery?.data?.team?.vulnerabilitySummary?.critical ?? 0
	);

	let costTrend = $derived.by(() => {
		const series = $costQuery?.data?.team?.cost?.monthlySummary?.series;
		if (!series || series.length < 2) return null;
		const current = series.at(-1)!.cost;
		const previous = series.at(-2)!.cost;
		if (previous === 0) return null;
		const change = ((current - previous) / previous) * 100;
		return { current, previous, change };
	});

	let dataLoading = $derived(loading || $vulnQuery?.fetching || $costQuery?.fetching);
</script>

<SurfaceCard title="Team health" bordered>
	{#if dataLoading}
		<div class="loading">
			<Loader size="xlarge" />
		</div>
	{:else}
		<div class="metrics">
			<a
				href="/team/{teamSlug}/issues"
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
				href="/team/{teamSlug}/vulnerabilities"
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

			<a
				href="/team/{teamSlug}/alerts"
				class="metric"
				class:danger={firingAlerts > 0}
				class:success={firingAlerts === 0}
			>
				<div class="metric-icon" class:danger={firingAlerts > 0} class:success={firingAlerts === 0}>
					<BellDotFillIcon />
				</div>
				<div class="metric-body">
					<span class="metric-value">{firingAlerts}</span>
					<span class="metric-label">Firing alerts</span>
				</div>
			</a>

		<a
			href="/team/{teamSlug}/cost"
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
					<span class="metric-label">Cost trend unavailable</span>
				{/if}
			</div>
		</a>
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

	.metric:hover {
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
