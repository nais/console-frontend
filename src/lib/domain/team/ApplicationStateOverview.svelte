<script lang="ts">
	import { graphql } from '$houdini';

	interface Props {
		teamSlug: string;
	}

	let { teamSlug }: Props = $props();

	const stateQuery = graphql(`
		query ApplicationStateOverview($team: Slug!) @cache(policy: CacheAndNetwork) {
			team(slug: $team) {
				applications(first: 500) {
					nodes {
						state
					}
					pageInfo {
						totalCount
					}
				}
			}
		}
	`);

	$effect(() => {
		stateQuery.fetch({ variables: { team: teamSlug } });
	});

	let states = $derived.by(() => {
		const nodes = $stateQuery.data?.team?.applications?.nodes ?? [];
		const total = $stateQuery.data?.team?.applications?.pageInfo?.totalCount ?? 0;
		const running = nodes.filter((n) => n.state === 'RUNNING').length;
		const notRunning = nodes.filter((n) => n.state === 'NOT_RUNNING').length;
		const unknown = nodes.filter((n) => n.state === 'UNKNOWN').length;
		return { total, running, notRunning, unknown };
	});
</script>

{#if states.total > 0}
	<div class="overview">
		<div class="state-bar">
			{#if states.running > 0}
				<div
					class="segment running"
					style="width: {(states.running / states.total) * 100}%"
					title="{states.running} running"
				></div>
			{/if}
			{#if states.notRunning > 0}
				<div
					class="segment not-running"
					style="width: {(states.notRunning / states.total) * 100}%"
					title="{states.notRunning} not running"
				></div>
			{/if}
			{#if states.unknown > 0}
				<div
					class="segment unknown"
					style="width: {(states.unknown / states.total) * 100}%"
					title="{states.unknown} unknown"
				></div>
			{/if}
		</div>
		<div class="legend">
			{#if states.running > 0}
				<span class="legend-item"><span class="dot running"></span> {states.running} running</span>
			{/if}
			{#if states.notRunning > 0}
				<span class="legend-item"
					><span class="dot not-running"></span> {states.notRunning} not running</span
				>
			{/if}
			{#if states.unknown > 0}
				<span class="legend-item"><span class="dot unknown"></span> {states.unknown} unknown</span>
			{/if}
		</div>
	</div>
{/if}

<style>
	.overview {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-6);
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

	.segment {
		min-width: 4px;
		transition: width 300ms ease;
	}

	.segment.running {
		background: var(--ax-bg-success-strong);
	}

	.segment.not-running {
		background: var(--ax-bg-danger-strong);
	}

	.segment.unknown {
		background: var(--ax-bg-neutral-strong);
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-6) var(--ax-space-12);
	}

	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
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

	.dot.not-running {
		background: var(--ax-bg-danger-strong);
	}

	.dot.unknown {
		background: var(--ax-bg-neutral-strong);
	}
</style>
