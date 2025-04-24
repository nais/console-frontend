<script lang="ts">
	import { percentageFormatter } from '$lib/utils/formatters';

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

	const scores = {
		critical: summary.critical,
		high: summary.high,
		medium: summary.medium,
		low: summary.low,
		unassigned: summary.unassigned
	};
</script>

<div class="stack-container">
	<div class="stack">
		{#each Object.keys(scores) as level (level)}
			<div class="segment {level}">{summary[level as keyof VulnerabilitySummary]}</div>
		{/each}
	</div>
</div>
<div class="container">
	<dl>
		{#if summary.riskScore}
			<dt>Risk score:</dt>
			<dd>
				<span class={summary['riskScore'] > 100 ? 'red' : 'green'}>{summary['riskScore']}</span>
			</dd>
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
		justify-content: center;
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
		/*row-gap: 1px;*/

		:global(.segment:first-of-type) {
			border-top-left-radius: 8px;
			border-top-right-radius: 8px;
		}

		:global(.segment:last-of-type) {
			border-bottom-right-radius: 8px;
			border-bottom-left-radius: 8px;
		}
	}

	.risk-score-label {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 256px;
		font-weight: bold;
		/* transform: rotate(-90deg); */
		white-space: nowrap;
		z-index: 1;
	}

	.segment {
		display: flex;
		align-items: center;
		color: var(--ax-text-neutral, --a-text-on-neutral);
		font-weight: bold;
		justify-content: center;
		width: 100%;
		height: 20%;
	}

	.critical {
		background-color: var(--ax-danger-600, --a-red-200);
	}
	.high {
		background-color: color-mix(
			in oklab,
			var(--ax-danger-600, --a-red-200),
			var(--ax-warning-200, --a-orange-200)
		);
	}
	.medium {
		background-color: var(--ax-warning-200, --a-orange-200);
	}
	.low {
		background-color: var(--ax-success-400, --a-green-200);
	}
	.unassigned {
		background-color: var(--ax-neutral-200, --a-gray-200);
	}
	.red {
		color: var(--ax-bg-danger-strong, --a-surface-danger);
	}

	.green {
		color: var(--ax-text-success-subtle, --a-surface-success);
	}

	dl {
		display: grid;
		grid-template-columns: 90px auto;
		margin-block-start: 0;
		margin-block-end: 0;
		padding-top: var(--ax-space-16, --a-spacing-4);
	}

	dt {
		font-weight: bold;
		text-align: left;
	}

	dd {
		margin: 0;
	}
</style>
