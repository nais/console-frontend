<script lang="ts">
	import {
		CheckmarkCircleIcon,
		QuestionmarkCircleIcon,
		XMarkOctagonIcon
	} from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';

	interface StatusDef {
		key: string;
		label: string;
		count: number;
		icon: Component;
		colorClass: 'success' | 'danger' | 'neutral';
	}

	const {
		running = 0,
		notRunning = 0,
		unknown = 0,
		activeStatuses = [],
		onchange
	}: {
		running?: number;
		notRunning?: number;
		unknown?: number;
		activeStatuses?: string[];
		onchange?: (statuses: string[]) => void;
	} = $props();

	const statuses: StatusDef[] = $derived(
		[
			{
				key: 'running',
				label: 'Running',
				count: running,
				icon: CheckmarkCircleIcon,
				colorClass: 'success' as const
			},
			{
				key: 'not-running',
				label: 'Not running',
				count: notRunning,
				icon: XMarkOctagonIcon,
				colorClass: 'danger' as const
			},
			{
				key: 'unknown',
				label: 'Unknown',
				count: unknown,
				icon: QuestionmarkCircleIcon,
				colorClass: 'neutral' as const
			}
		].filter((s) => s.count > 0)
	);

	function toggle(key: string) {
		const next = activeStatuses.includes(key)
			? activeStatuses.filter((s) => s !== key)
			: [...activeStatuses, key];
		if (next.length > 0) {
			onchange?.(next);
		}
	}
</script>

<div class="status-pills">
	{#each statuses as status (status.key)}
		{@const active = activeStatuses.includes(status.key)}
		<button
			type="button"
			class="pill {status.colorClass}"
			class:active
			onclick={() => toggle(status.key)}
		>
			<status.icon width="14" height="14" />
			<span class="pill-label">{status.label}</span>
			<span class="pill-count">{status.count}</span>
		</button>
	{/each}
</div>

<style>
	.status-pills {
		display: flex;
		gap: var(--ax-space-8);
		align-items: center;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
		padding: var(--ax-space-4) var(--ax-space-8);
		border-radius: 9999px;
		font-size: var(--ax-font-size-small);
		font-weight: 500;
		border: 1px solid;
		cursor: pointer;
		transition:
			background-color 120ms ease,
			border-color 120ms ease,
			opacity 120ms ease;
		line-height: 1.4;
	}

	.pill.success {
		color: var(--ax-text-success);
		background: color-mix(in srgb, var(--ax-bg-success-moderate) 40%, transparent);
		border-color: color-mix(in srgb, var(--ax-bg-success-moderate) 80%, transparent);
	}

	.pill.success:hover {
		background: color-mix(in srgb, var(--ax-bg-success-moderate) 60%, transparent);
	}

	.pill.danger {
		color: var(--ax-text-danger);
		background: color-mix(in srgb, var(--ax-bg-danger-moderate) 40%, transparent);
		border-color: color-mix(in srgb, var(--ax-bg-danger-moderate) 80%, transparent);
	}

	.pill.danger:hover {
		background: color-mix(in srgb, var(--ax-bg-danger-moderate) 60%, transparent);
	}

	.pill.neutral {
		color: var(--ax-text-subtle);
		background: color-mix(in srgb, var(--ax-neutral-200) 50%, transparent);
		border-color: var(--ax-border-neutral-subtleA);
	}

	.pill.neutral:hover {
		background: color-mix(in srgb, var(--ax-neutral-200) 80%, transparent);
	}

	.pill:not(.active) {
		opacity: 0.5;
	}

	.pill:not(.active):hover {
		opacity: 0.75;
	}

	.pill-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.125rem;
		height: 1rem;
		padding: 0 var(--ax-space-4);
		border-radius: 9999px;
		font-size: 0.625rem;
		font-weight: 600;
		background: color-mix(in srgb, var(--ax-bg-default) 60%, transparent);
	}

	.pill-label {
		white-space: nowrap;
	}
</style>
