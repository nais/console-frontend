<script lang="ts">
	import type { TeamSummaryCost$result, TeamSummaryVulnerabilities$result } from '$houdini';
	import IssuePills from '$lib/domain/issues/IssuePills.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { Loader } from '@nais/ds-svelte-community';
	import {
		BellDotFillIcon,
		PiggybankIcon,
		VirusIcon,
		VitalsIcon
	} from '@nais/ds-svelte-community/icons';
	import { AreaChart } from 'layerchart';

	interface Props {
		teamSlug: string;
		criticalIssues?: number;
		warningIssues?: number;
		todoIssues?: number;
		firingAlerts?: number;
		loading?: boolean;
		vulnerabilityData?: TeamSummaryVulnerabilities$result | null;
		costData?: TeamSummaryCost$result | null;
		costLoading?: boolean;
	}

	let {
		teamSlug,
		criticalIssues = 0,
		warningIssues = 0,
		todoIssues = 0,
		firingAlerts = 0,
		loading = false,
		vulnerabilityData = null,
		costData = null,
		costLoading = false
	}: Props = $props();

	let totalIssues = $derived(criticalIssues + warningIssues + todoIssues);

	let immediateVulnerabilities = $derived(
		vulnerabilityData?.team?.vulnerabilitySummary?.critical ?? 0
	);

	let costTrend = $derived.by(() => {
		const series = costData?.team?.cost?.daily?.series;
		if (!series || series.length < 2) return null;

		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();

		const current = series.filter((d) => {
			const date = new Date(d.date);
			return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
		});

		const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
		const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
		const previous = series.filter((d) => {
			const date = new Date(d.date);
			return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
		});

		if (current.length === 0 || previous.length === 0) return null;
		const currAvg = current.reduce((s, d) => s + d.sum, 0) / current.length;
		const prevAvg = previous.reduce((s, d) => s + d.sum, 0) / previous.length;
		if (prevAvg === 0) return null;
		const change = ((currAvg - prevAvg) / prevAvg) * 100;
		return { change };
	});

	let sparklineData = $derived.by(() => {
		const series = costData?.team?.cost?.daily?.series;
		if (!series || series.length === 0) return [];
		return series.map((item) => ({ date: item.date, value: item.sum }));
	});

	let dataLoading = $derived(loading);

	let allSuccess = $derived(
		totalIssues === 0 &&
			immediateVulnerabilities === 0 &&
			firingAlerts === 0 &&
			(!costTrend || costTrend.change <= 5)
	);
</script>

<div class="team-health" class:all-success={allSuccess}>
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
					<span class="metric-category">Issues</span>
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
					class:danger={immediateVulnerabilities > 0}
					class:success={immediateVulnerabilities === 0}
				>
					<span class="metric-category">Vulnerabilities</span>
					<div
						class="metric-icon"
						class:danger={immediateVulnerabilities > 0}
						class:success={immediateVulnerabilities === 0}
					>
						<VirusIcon />
					</div>
					<div class="metric-body">
						<span class="metric-value">{immediateVulnerabilities}</span>
						<span class="metric-label">Immediate</span>
					</div>
				</a>

				<a
					href="/team/{teamSlug}/alerts"
					class="metric"
					class:danger={firingAlerts > 0}
					class:success={firingAlerts === 0}
				>
					<span class="metric-category">Alerts</span>
					<div
						class="metric-icon"
						class:danger={firingAlerts > 0}
						class:success={firingAlerts === 0}
					>
						<BellDotFillIcon />
					</div>
					<div class="metric-body">
						<span class="metric-value">{firingAlerts}</span>
						<span class="metric-label">Firing</span>
					</div>
				</a>

				<a
					href="/team/{teamSlug}/cost"
					class="metric"
					class:warning={costTrend && costTrend.change > 5}
					class:success={costTrend && costTrend.change <= 5}
				>
					<span class="metric-category">Cost</span>
					<div
						class="metric-icon"
						class:warning={costTrend && costTrend.change > 5}
						class:success={costTrend && costTrend.change <= 5}
					>
						<PiggybankIcon />
					</div>
					<div class="metric-body">
						{#if costLoading}
							<span class="metric-value">…</span>
							<span class="metric-label">Loading</span>
						{:else if costTrend}
							<span class="metric-value">
								{costTrend.change > 0
									? '+' + costTrend.change.toFixed(0)
									: Math.round(costTrend.change) === 0
										? '0'
										: costTrend.change.toFixed(0)}%
							</span>
							<span class="metric-label">vs last month</span>
						{:else}
							<span class="metric-value">—</span>
							<span class="metric-label">Trend unavailable</span>
						{/if}
					</div>
					{#if !costLoading && costTrend && sparklineData.length > 1}
						<div class="sparkline">
							<AreaChart
								data={sparklineData}
								x="date"
								y="value"
								axis={false}
								grid={false}
								padding={{ top: 2, bottom: 2, left: 0, right: 0 }}
								props={{
									area: { fillOpacity: 1, class: 'sparkline-area' },
									spline: { class: 'sparkline-line' }
								}}
							/>
						</div>
					{/if}
				</a>
			</div>
		{/if}
	</SurfaceCard>
</div>

<style>
	.all-success :global(.surface-card) {
		background: color-mix(
			in srgb,
			var(--ax-bg-success-moderate) 15%,
			color-mix(in srgb, var(--surface-accent-color) 4%, var(--ax-bg-default))
		);
	}

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
		position: relative;
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

	.metric-category {
		position: absolute;
		top: var(--ax-space-6);
		right: var(--ax-space-8);
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
		text-transform: uppercase;
		letter-spacing: 0.03em;
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

	.sparkline {
		flex: 1;
		align-self: stretch;
		min-width: 0;
		margin-right: var(--ax-space-40);
	}

	.sparkline :global(.sparkline-line) {
		stroke: var(--ax-text-success);
		stroke-width: 1.5;
		fill: none;
	}

	.sparkline :global(.sparkline-area) {
		fill: var(--ax-bg-success-moderate);
	}

	.metric.warning .sparkline :global(.sparkline-line) {
		stroke: var(--ax-text-warning);
	}

	.metric.warning .sparkline :global(.sparkline-area) {
		fill: var(--ax-bg-warning-moderate);
	}

	.metric.success .sparkline :global(.sparkline-line) {
		stroke: var(--ax-text-success);
	}

	.metric.success .sparkline :global(.sparkline-area) {
		fill: var(--ax-bg-success-moderate);
	}

	@media (max-width: 767px), (max-height: 500px) {
		.metrics {
			grid-template-columns: 1fr;
		}
	}
</style>
