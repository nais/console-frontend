<script lang="ts">
	import { capitalizeFirstLetter, percentageFormatter } from '$lib/utils/formatters';

	type VulnerabilitySummary = {
		critical: number;
		high: number;
		medium: number;
		low: number;
		unassigned: number;
		riskScore?: number;
		coverage?: number;
	};

	interface Props {
		summary: VulnerabilitySummary;
	}

	let { summary }: Props = $props();

	const weights = { critical: 10, high: 5, medium: 3, low: 1, unassigned: 5 };

	const scores = {
		critical: summary.critical * weights.critical,
		high: summary.high * weights.high,
		medium: summary.medium * weights.medium,
		low: summary.low * weights.low,
		unassigned: summary.unassigned * weights.unassigned
	};

	const totalScore = Object.values(scores).reduce((sum, value) => sum + value, 0);

	const percentages = {
		critical: (scores.critical / totalScore) * 100,
		high: (scores.high / totalScore) * 100,
		medium: (scores.medium / totalScore) * 100,
		low: (scores.low / totalScore) * 100,
		unassigned: (scores.unassigned / totalScore) * 100
	};
</script>

<div class="stack-container">
	<div class="stack">
		{#each Object.keys(scores) as level (level)}
			{#if scores[level as keyof typeof scores] > 0}
				<div
					class="segment {level}"
					style="height: {percentages[level as keyof typeof percentages]}%;"
				></div>
			{/if}
		{/each}
	</div>
	<div class="labels">
		{#each Object.keys(scores) as level (level)}
			{#if scores[level as keyof typeof scores] > 0}
				<div class="label-item">
					<span class="label-dot {level}"></span>
					{capitalizeFirstLetter(level)}: {summary[level as keyof typeof summary]}
				</div>
			{/if}
		{/each}
	</div>
</div>
<div class="container">
	<dl>
		{#if summary['riskScore']}
			<dt>Risk score:</dt>
			<dd>
				<span class={summary['riskScore'] > 100 ? 'red' : 'green'}>{summary['riskScore']}</span>
			</dd>
			<!--HelpText title="Risk score"
				>The risk score is a calculated value based on the severity of the vulnerabilities
				discovered within the workloads. A higher risk score indicates a higher risk of
				exploitation. Algorithms may vary, but a common approach is to assign a score based on the
				severity of the vulnerabilities found. The Score is calculated: "((critical * 10) + (high *
				5) + (medium * 3) + (low * 1) + (unassigned * 5))".
			</HelpText-->
		{/if}

		{#if summary['coverage']}
			<dt>Coverage:</dt>
			<dd>
				<span class={summary['coverage'] < 100 ? 'red' : 'green'}
					>{percentageFormatter(summary['coverage'] ? summary['coverage'] : 0, 0)}</span
				>
			</dd>
		{/if}
	</dl>
</div>

<style>
	.stack-container {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.labels {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.label-item {
		display: flex;
		align-items: center;
		font-size: 0.9rem;
	}

	.label-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		margin-right: 0.5rem;
	}
	.stack {
		display: flex;
		flex-direction: column;
		width: 64px;
		height: 256px;
		row-gap: 1px;

		:global(.segment:first-of-type) {
			border-top-left-radius: 8px;
			border-top-right-radius: 8px;
		}

		:global(.segment:last-of-type) {
			border-bottom-right-radius: 8px;
			border-bottom-left-radius: 8px;
		}
		:global(.segment) {
			padding: 4px 10px;
			text-align: center;
		}
	}

	.segment {
		width: 100%;
		transition: height 0.3s ease-in-out;
	}

	.critical {
		background-color: var(--a-red-200);
	}
	.high {
		background-color: color-mix(in oklab, var(--a-red-200), var(--a-orange-200));
	}
	.medium {
		background-color: var(--a-orange-200);
	}
	.low {
		background-color: var(--a-green-200);
	}
	.unassigned {
		background-color: var(--a-gray-200);
	}
	.red {
		color: var(--a-surface-danger);
	}

	.green {
		color: var(--a-surface-success);
	}

	dl {
		display: grid;
		grid-template-columns: 90px auto;
		margin-block-start: 0;
		margin-block-end: 0;
		padding-top: var(--a-spacing-4);
	}

	dt {
		font-weight: bold;
		text-align: left;
	}

	dd {
		margin: 0;
	}
</style>
