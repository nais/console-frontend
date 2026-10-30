<script lang="ts">
	import IssuePills from '#lib/domain/issues/IssuePills.svelte';
	import { ShSpinner } from '#lib/shadcn/ui/index.js';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import type { TeamSummaryCost$result, TeamSummaryVulnerabilities$result } from '$houdini';
	import { BellDotFillIcon, PiggybankIcon, VirusIcon, VitalsIcon } from '#lib/icons/index.js';
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

	let urgentVulnerabilityIssues = $derived(
		vulnerabilityData?.team?.urgentVulnerabilityIssues?.pageInfo?.totalCount ?? 0
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
			urgentVulnerabilityIssues === 0 &&
			firingAlerts === 0 &&
			(!costTrend || costTrend.change <= 5)
	);
</script>

<div class="team-health" class:all-success={allSuccess}>
	<SurfaceCard title="Team health">
		{#if dataLoading}
			<div class="loading">
				<ShSpinner size="lg" />
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
					<div class="metric-top">
						<span class="metric-category">Issues</span>
						<div
							class="metric-icon"
							class:danger={criticalIssues > 0}
							class:warning={!criticalIssues && warningIssues > 0}
							class:success={totalIssues === 0}
						>
							<VitalsIcon />
						</div>
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
					class:danger={urgentVulnerabilityIssues > 0}
					class:success={urgentVulnerabilityIssues === 0}
				>
					<div class="metric-top">
						<span class="metric-category">Vulnerabilities</span>
						<div
							class="metric-icon"
							class:danger={urgentVulnerabilityIssues > 0}
							class:success={urgentVulnerabilityIssues === 0}
						>
							<VirusIcon />
						</div>
					</div>
					<div class="metric-body">
						<span class="metric-value">{urgentVulnerabilityIssues}</span>
						<span class="metric-label">Urgent issues</span>
					</div>
				</a>

				<a
					href="/team/{teamSlug}/alerts"
					class="metric"
					class:danger={firingAlerts > 0}
					class:success={firingAlerts === 0}
				>
					<div class="metric-top">
						<span class="metric-category">Alerts</span>
						<div
							class="metric-icon"
							class:danger={firingAlerts > 0}
							class:success={firingAlerts === 0}
						>
							<BellDotFillIcon />
						</div>
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
					<div class="metric-top">
						<span class="metric-category">Cost</span>
						<div
							class="metric-icon"
							class:warning={costTrend && costTrend.change > 5}
							class:success={costTrend && costTrend.change <= 5}
						>
							<PiggybankIcon />
						</div>
					</div>
					<div class="metric-bottom-row">
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
					</div>
				</a>
			</div>
		{/if}
	</SurfaceCard>
</div>

<style>
	.all-success :global(.surface-card) {
		border-color: var(--success-border);
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 6rem;
	}

	.metrics {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.metric {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: space-between;
		gap: 0.5rem;
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

	.metric:hover {
		background-color: var(--card-hover);
		border-color: var(--border-strong);
		box-shadow: var(--sh-shadow-xs);
		text-decoration: none;
	}

	.metric-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		width: 100%;
	}

	.metric-category {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--muted-foreground);
	}

	.metric-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		flex-shrink: 0;
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
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

	.metric-bottom-row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.metric-body {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.metric-value {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.03em;
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

	.sparkline {
		flex: 1;
		height: 36px;
		min-width: 48px;
		max-width: 96px;
	}

	.sparkline :global(.sparkline-line) {
		stroke: var(--success);
		stroke-width: 1.5;
		fill: none;
	}

	.sparkline :global(.sparkline-area) {
		fill: var(--success-muted);
	}

	.metric.warning .sparkline :global(.sparkline-line) {
		stroke: var(--warning);
	}

	.metric.warning .sparkline :global(.sparkline-area) {
		fill: var(--warning-muted);
	}

	.metric.success .sparkline :global(.sparkline-line) {
		stroke: var(--success);
	}

	.metric.success .sparkline :global(.sparkline-area) {
		fill: var(--success-muted);
	}

	@media (max-width: 960px) {
		.metrics {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 540px) {
		.metrics {
			grid-template-columns: 1fr;
		}
	}
</style>
